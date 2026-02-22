// Vercel Edge Function for LinkedIn InMail ROI Calculator
// Sends email via Resend + pushes to HubSpot + Resend Audience

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { email, results } = await request.json();

    // Run all operations in parallel and await them
    const [emailResult, hubspotResult, resendContactResult] = await Promise.all([
      sendResultsEmail(email, results),
      pushToHubSpot(email, results),
      pushToResendAudience(email),
    ]);

    return new Response(JSON.stringify({
      success: true,
      emailSent: emailResult.success,
      hubspotPushed: hubspotResult.success,
      resendContactCreated: resendContactResult.success,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing InMail calculator results:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to process results' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function formatCurrency(num) {
  return '$' + num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

async function sendResultsEmail(email, results) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return { success: false, reason: 'not_configured' };

  try {
    const { budget, giftCardValue, withoutGiftCard, withGiftCard, savingsPerLead, leadsMultiplier, recommendation } = results;

    const savingsColor = savingsPerLead > 0 ? '#10B981' : '#F59E0B';
    const recommendationText = recommendation === 'use_gift_card'
      ? 'Gift card incentives are recommended for your campaign.'
      : 'Gift cards may not provide significant savings, but will increase response rates.';

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;margin:0;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:white;border:2px solid #1a1a1a;border-radius:16px;overflow:hidden;">

    <!-- Header -->
    <div style="background:#DFFE68;padding:24px;border-bottom:2px solid #1a1a1a;">
      <table width="100%">
        <tr>
          <td><div style="width:40px;height:40px;background:white;border:2px solid #1a1a1a;border-radius:8px;text-align:center;line-height:36px;font-weight:bold;">42</div></td>
          <td style="text-align:right;"><span style="color:#1a1a1a;font-weight:bold;">LinkedIn InMail ROI Analysis</span></td>
        </tr>
      </table>
    </div>

    <!-- Content -->
    <div style="padding:32px;">
      <p style="color:#4a4a4a;margin:0 0 24px 0;">Here's your LinkedIn InMail campaign ROI analysis based on 42 Agency client data:</p>

      <!-- Verdict -->
      <div style="text-align:center;margin:32px 0;">
        <div style="font-size:42px;font-weight:bold;color:${savingsColor};">${savingsPerLead > 0 ? 'Save ' + formatCurrency(savingsPerLead) + '/lead' : 'Similar Costs'}</div>
        <p style="color:#666;margin:8px 0 0 0;">${recommendationText}</p>
      </div>

      <!-- Campaign Details -->
      <div style="background:#f5f5f5;border-radius:12px;padding:16px;margin:24px 0;">
        <h3 style="color:#1a1a1a;margin:0 0 12px 0;">Your Campaign Settings</h3>
        <table width="100%" style="font-size:14px;">
          <tr>
            <td style="padding:4px 0;color:#666;">Monthly Budget</td>
            <td style="padding:4px 0;font-weight:bold;text-align:right;">${formatCurrency(budget)}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#666;">Gift Card Value</td>
            <td style="padding:4px 0;font-weight:bold;text-align:right;">${formatCurrency(giftCardValue)}</td>
          </tr>
        </table>
      </div>

      <!-- Comparison Table -->
      <table width="100%" style="border-collapse:collapse;margin:24px 0;">
        <tr>
          <th style="padding:12px;text-align:left;border-bottom:2px solid #e5e5e5;"></th>
          <th style="padding:12px;text-align:center;border-bottom:2px solid #e5e5e5;color:#6b6b6b;">Without Gift Card</th>
          <th style="padding:12px;text-align:center;border-bottom:2px solid #e5e5e5;color:#10B981;">With Gift Card</th>
        </tr>
        <tr>
          <td style="padding:12px;border-bottom:1px solid #e5e5e5;font-weight:bold;">Open Rate</td>
          <td style="padding:12px;text-align:center;border-bottom:1px solid #e5e5e5;">${withoutGiftCard.openRateMin}-${withoutGiftCard.openRateMax}%</td>
          <td style="padding:12px;text-align:center;border-bottom:1px solid #e5e5e5;font-weight:bold;color:#10B981;">${withGiftCard.openRateMin}-${withGiftCard.openRateMax}%</td>
        </tr>
        <tr>
          <td style="padding:12px;border-bottom:1px solid #e5e5e5;font-weight:bold;">Cost Per Lead</td>
          <td style="padding:12px;text-align:center;border-bottom:1px solid #e5e5e5;">${formatCurrency(withoutGiftCard.cplMin)} - ${formatCurrency(withoutGiftCard.cplMax)}</td>
          <td style="padding:12px;text-align:center;border-bottom:1px solid #e5e5e5;font-weight:bold;color:#10B981;">${formatCurrency(withGiftCard.cplMin)} - ${formatCurrency(withGiftCard.cplMax)}</td>
        </tr>
        <tr>
          <td style="padding:12px;font-weight:bold;">Estimated Leads</td>
          <td style="padding:12px;text-align:center;">${withoutGiftCard.leadsMin} - ${withoutGiftCard.leadsMax}</td>
          <td style="padding:12px;text-align:center;font-weight:bold;color:#10B981;">${withGiftCard.leadsMin} - ${withGiftCard.leadsMax}</td>
        </tr>
      </table>

      <!-- Key Insight -->
      <div style="background:#d1fae5;border:2px solid #10B981;border-radius:12px;padding:16px;margin:24px 0;">
        <p style="margin:0;font-weight:bold;color:#065f46;">Key Insight</p>
        <p style="margin:8px 0 0 0;color:#065f46;">With the same ${formatCurrency(budget)} budget, gift card incentives could generate ${leadsMultiplier.toFixed(1)}x more leads.</p>
      </div>

      <!-- CTA -->
      <div style="background:#DFFE68;border:2px solid #1a1a1a;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
        <h3 style="color:#1a1a1a;margin:0 0 12px 0;">Need Help Running InMail Campaigns?</h3>
        <p style="color:#4a4a4a;margin:0 0 16px 0;">Our team has run hundreds of campaigns with gift card incentives.</p>
        <a href="https://42agency.com/contact?utm_source=inmail_calculator_email&utm_medium=intel" style="display:inline-block;background:#1a1a1a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Get a Free Strategy Call</a>
      </div>

      <p style="color:#6b6b6b;font-size:14px;margin:24px 0 0 0;">
        Run another calculation anytime at:<br>
        <a href="https://intel.42agency.com/tools/linkedin-inmail-calculator" style="color:#0A66C2;">intel.42agency.com/tools/linkedin-inmail-calculator</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#1a1a1a;padding:16px 24px;text-align:center;">
      <p style="color:#9a9a9a;margin:0;font-size:12px;">Built by <a href="https://42agency.com" style="color:#DFFE68;">42 Agency</a> - B2B Demand Gen & Marketing Ops</p>
    </div>
  </div>
</body>
</html>`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: '42 Agency <noreply@42agency.com>',
        to: email,
        subject: `Your InMail ROI Analysis: ${savingsPerLead > 0 ? 'Save ' + formatCurrency(savingsPerLead) + '/lead with incentives' : 'Campaign comparison ready'}`,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend error:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Resend email error:', error);
    return { success: false, error };
  }
}

async function pushToHubSpot(email, results) {
  const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!accessToken || accessToken.includes('REPLACE')) {
    return { success: false, reason: 'not_configured' };
  }

  try {
    // Search for existing contact
    const searchResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filterGroups: [{
          filters: [{ propertyName: 'email', operator: 'EQ', value: email }],
        }],
      }),
    });

    const searchData = await searchResponse.json();
    const existingContactId = searchData.results?.[0]?.id;

    const properties = {
      email,
      inmail_calculator_budget: results.budget.toString(),
      inmail_calculator_gift_card: results.giftCardValue.toString(),
      inmail_calculator_savings: results.savingsPerLead.toString(),
      inmail_calculator_recommendation: results.recommendation,
      inmail_calculator_date: new Date().toISOString().split('T')[0],
      lifecyclestage: 'lead',
    };

    if (existingContactId) {
      await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${existingContactId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties }),
      });
    } else {
      await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties }),
      });
    }

    return { success: true };
  } catch (error) {
    console.error('HubSpot API error:', error);
    return { success: false, error };
  }
}

async function pushToResendAudience(email) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

  if (!RESEND_API_KEY || !RESEND_AUDIENCE_ID) {
    return { success: false, reason: 'not_configured' };
  }

  try {
    const response = await fetch(`https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        unsubscribed: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Resend Audience API error:', error);
    return { success: false, error };
  }
}
