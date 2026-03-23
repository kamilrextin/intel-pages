export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    // Handle CORS
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { email, salary, retainer, inhouseTotal, agencyTotal, recommendation } = await request.json();

        if (!email) {
            return new Response(JSON.stringify({ error: 'Email is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Format currency for display
        const formatCurrency = (num) => '$' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

        // Run HubSpot and Resend in parallel
        const promises = [];

        // 1. Push to HubSpot CRM
        const hubspotPromise = fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                properties: {
                    email: email,
                    agency_calculator_salary: salary?.toString() || '',
                    agency_calculator_retainer: retainer?.toString() || '',
                    agency_calculator_inhouse_total: inhouseTotal?.toString() || '',
                    agency_calculator_agency_total: agencyTotal?.toString() || '',
                    agency_calculator_result: recommendation || '',
                    agency_calculator_date: new Date().toISOString().split('T')[0],
                    lifecyclestage: 'lead',
                    hs_lead_status: 'NEW',
                },
            }),
        }).then(async (res) => {
            if (!res.ok) {
                // Try to update existing contact
                const searchRes = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/search`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        filterGroups: [{
                            filters: [{
                                propertyName: 'email',
                                operator: 'EQ',
                                value: email,
                            }],
                        }],
                    }),
                });

                const searchData = await searchRes.json();
                if (searchData.results && searchData.results.length > 0) {
                    const contactId = searchData.results[0].id;
                    await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            properties: {
                                agency_calculator_salary: salary?.toString() || '',
                                agency_calculator_retainer: retainer?.toString() || '',
                                agency_calculator_inhouse_total: inhouseTotal?.toString() || '',
                                agency_calculator_agency_total: agencyTotal?.toString() || '',
                                agency_calculator_result: recommendation || '',
                                agency_calculator_date: new Date().toISOString().split('T')[0],
                            },
                        }),
                    });
                }
            }
            return res;
        }).catch(err => {
            console.error('HubSpot error:', err);
        });
        promises.push(hubspotPromise);

        // 2. Send email via Resend
        const savings = inhouseTotal - agencyTotal;
        const winner = savings > 0 ? 'Agency' : 'In-House';
        const savingsAmount = Math.abs(savings);

        const resendPromise = fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: '42 Agency <intel@42agency.com>',
                to: [email],
                subject: `Your Agency vs In-House Comparison: ${winner} saves ${formatCurrency(savingsAmount)}`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <img src="https://intel.42agency.com/42-logo.png" alt="42 Agency" style="height: 32px;">
                        </div>

                        <div style="background: #DFFE68; border: 2px solid #1a1a1a; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
                            <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800;">Your Cost Comparison</h1>
                            <p style="margin: 0; color: #4a4a4a;">Agency vs In-House Demand Gen</p>
                        </div>

                        <div style="display: flex; gap: 16px; margin-bottom: 24px;">
                            <div style="flex: 1; background: rgba(59, 130, 246, 0.1); border: 2px solid #1a1a1a; border-radius: 12px; padding: 20px; text-align: center;">
                                <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b6b6b;">In-House (Year 1)</p>
                                <p style="margin: 0; font-size: 28px; font-weight: 800; color: #3B82F6;">${formatCurrency(inhouseTotal)}</p>
                            </div>
                            <div style="flex: 1; background: rgba(16, 185, 129, 0.1); border: 2px solid #1a1a1a; border-radius: 12px; padding: 20px; text-align: center;">
                                <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b6b6b;">Agency (Year 1)</p>
                                <p style="margin: 0; font-size: 28px; font-weight: 800; color: #10B981;">${formatCurrency(agencyTotal)}</p>
                            </div>
                        </div>

                        <div style="background: #f5f5f5; border: 2px solid #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                            <h3 style="margin: 0 0 12px 0; font-size: 16px;">Your Inputs</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #6b6b6b;">Base Salary</td>
                                    <td style="padding: 8px 0; text-align: right; font-weight: 600;">${formatCurrency(salary)}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6b6b6b;">Monthly Retainer</td>
                                    <td style="padding: 8px 0; text-align: right; font-weight: 600;">${formatCurrency(retainer)}</td>
                                </tr>
                                <tr style="border-top: 2px solid #1a1a1a;">
                                    <td style="padding: 12px 0; font-weight: 700;">Year 1 Savings (${winner})</td>
                                    <td style="padding: 12px 0; text-align: right; font-weight: 800; color: ${savings > 0 ? '#10B981' : '#3B82F6'};">${formatCurrency(savingsAmount)}</td>
                                </tr>
                            </table>
                        </div>

                        <div style="background: ${savings > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)'}; border: 2px solid #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                            <h3 style="margin: 0 0 8px 0; font-size: 16px;">${savings > 0 ? 'Agency' : 'In-House'} Recommendation</h3>
                            <p style="margin: 0; color: #4a4a4a;">
                                ${savings > 0
                                    ? `Based on your inputs, working with an agency saves you ${formatCurrency(savingsAmount)} in Year 1 and gets you to market faster. You also avoid recruiting risk and get immediate access to a full team.`
                                    : `Based on your inputs, hiring in-house saves you ${formatCurrency(savingsAmount)} in Year 1. If you can wait for hiring and ramp time, this builds long-term capacity.`
                                }
                            </p>
                        </div>

                        <div style="text-align: center; margin-bottom: 24px;">
                            <a href="https://www.42agency.com/contact-us?utm_source=agency_calculator&utm_medium=email" style="display: inline-block; background: #1a1a1a; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700;">Talk to Our Team</a>
                        </div>

                        <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e5e5e5;">
                            <p style="font-size: 14px; color: #6b6b6b; margin: 0;">
                                <a href="https://intel.42agency.com/tools/agency-vs-inhouse/" style="color: #1a1a1a;">Run another comparison</a>
                                &nbsp;|&nbsp;
                                <a href="https://42agency.com" style="color: #1a1a1a;">42agency.com</a>
                            </p>
                        </div>
                    </body>
                    </html>
                `,
            }),
        }).catch(err => {
            console.error('Resend error:', err);
        });
        promises.push(resendPromise);

        // 3. Add to Resend Audience
        if (process.env.RESEND_AUDIENCE_ID) {
            const audiencePromise = fetch(`https://api.resend.com/audiences/${process.env.RESEND_AUDIENCE_ID}/contacts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    unsubscribed: false,
                }),
            }).catch(err => {
                console.error('Resend Audience error:', err);
            });
            promises.push(audiencePromise);
        }

        // Wait for all promises
        await Promise.all(promises);

        return new Response(JSON.stringify({
            success: true,
            message: 'Results sent to your email'
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
