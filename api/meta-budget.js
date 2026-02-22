// Vercel Edge Function for Meta Ads Budget Calculator
// Pushes to HubSpot + sends email via Resend

export const config = {
  runtime: 'edge',
};

// B2B Meta Ads Benchmarks (42 Agency data)
const META_BENCHMARKS = {
  cpl: { min: 50, max: 150, avg: 100 },
  ctr: { min: 0.8, max: 1.5, avg: 1.15 },
  cpm: { min: 8, max: 25, avg: 15 },
  conversionRate: { min: 2, max: 8, avg: 5 },
};

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { email, product, campaignType, budget, leads, cpl, reach } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Skip if preview/temp email
    if (email === 'preview@temp.local') {
      return new Response(JSON.stringify({ success: true, preview: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Process in parallel
    const resultPromises = [];

    // Send email via Resend
    resultPromises.push(sendResultsEmail(email, {
      product,
      campaignType,
      budget,
      leads,
      cpl,
      reach
    }).catch(err => console.error('Email error:', err)));

    // Push to HubSpot
    resultPromises.push(pushToHubSpot(email, {
      product,
      campaignType,
      budget,
      leads,
      cpl,
      reach
    }).catch(err => console.error('HubSpot error:', err)));

    // Push to Resend Audience
    resultPromises.push(pushToResendAudience(email).catch(err => console.error('Resend Audience error:', err)));

    // Wait for all background tasks to complete
    await Promise.all(resultPromises);

    return new Response(JSON.stringify({
      success: true,
      email
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Meta budget calculator error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to process request'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function sendResultsEmail(email, result) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return { success: false, reason: 'not_configured' };

  const { product, campaignType, budget, leads, cpl, reach } = result;

  const typeLabels = {
    awareness: 'Awareness',
    leadgen: 'Lead Generation',
    retargeting: 'Retargeting'
  };

  const typeDescriptions = {
    awareness: 'building brand visibility and reach',
    leadgen: 'capturing B2B leads with lead gen forms',
    retargeting: 're-engaging warm audiences for higher conversions'
  };

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;margin:0;padding:20px;">
<div style="max-width:600px;margin:0 auto;background:white;border:2px solid #1a1a1a;border-radius:16px;overflow:hidden;">
  <div style="background:#0668E1;padding:24px;border-bottom:2px solid #1a1a1a;">
    <table width="100%"><tr>
      <td><div style="width:40px;height:40px;background:white;border:2px solid #1a1a1a;border-radius:8px;text-align:center;line-height:36px;font-weight:bold;">42</div></td>
      <td style="text-align:right;"><span style="color:white;font-weight:bold;">Meta Ads Budget Estimate</span></td>
    </tr></table>
  </div>
  <div style="padding:32px;">
    <p style="color:#4a4a4a;margin:0 0 24px 0;">Here are your Meta Ads budget estimates for ${typeDescriptions[campaignType] || 'your campaign'}:</p>

    <div style="text-align:center;margin:24px 0;padding:24px;background:#f5f5f5;border-radius:12px;">
      <div style="font-size:14px;font-weight:600;color:#0668E1;text-transform:uppercase;letter-spacing:0.5px;">${typeLabels[campaignType] || 'Campaign'}</div>
      <div style="font-size:48px;font-weight:800;color:#1a1a1a;margin:8px 0;">$${parseInt(budget).toLocaleString()}</div>
      <div style="color:#6b6b6b;font-size:14px;">monthly budget</div>
    </div>

    <h3 style="color:#1a1a1a;margin:24px 0 16px 0;font-size:16px;">Estimated Performance</h3>
    <table width="100%" style="border-collapse:collapse;">
      <tr><td style="padding:12px;background:#f5f5f5;border-radius:8px;">Estimated Reach</td><td style="padding:12px;background:#f5f5f5;border-radius:8px;text-align:right;font-weight:bold;">${formatNumber(reach)} people</td></tr>
      ${campaignType !== 'awareness' ? `<tr><td style="padding:12px;">Estimated Leads</td><td style="padding:12px;text-align:right;font-weight:bold;">${leads} leads</td></tr>` : ''}
      ${cpl ? `<tr><td style="padding:12px;background:#f5f5f5;border-radius:8px;">Estimated CPL</td><td style="padding:12px;background:#f5f5f5;border-radius:8px;text-align:right;font-weight:bold;">$${Math.round(cpl)}</td></tr>` : ''}
    </table>

    <div style="background:#E8F4FD;border:2px solid #0668E1;border-radius:12px;padding:20px;margin:24px 0;">
      <h4 style="color:#0668E1;margin:0 0 8px 0;font-size:14px;">B2B Meta Ads Best Practices</h4>
      <ul style="color:#4a4a4a;margin:0;padding-left:20px;font-size:14px;line-height:1.6;">
        <li>Meta is best for <strong>retargeting warm audiences</strong> in B2B</li>
        <li>B2B CPL typically ranges from <strong>$50-$150</strong></li>
        <li>Combine with LinkedIn targeting data for better results</li>
        <li>Use lookalike audiences from your CRM for cold prospecting</li>
      </ul>
    </div>

    <h3 style="color:#1a1a1a;margin:24px 0 16px 0;font-size:16px;">Product/Service</h3>
    <p style="color:#4a4a4a;margin:0;padding:12px;background:#f5f5f5;border-radius:8px;font-size:14px;">${product || 'Not specified'}</p>

    <div style="background:#DFFE68;border:2px solid #1a1a1a;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
      <h3 style="color:#1a1a1a;margin:0 0 8px 0;">Need Expert Help?</h3>
      <p style="color:#4a4a4a;margin:0 0 16px 0;font-size:14px;">Get a free Meta Ads audit from our B2B performance marketing team.</p>
      <a href="https://42agency.com/contact?utm_source=meta_budget_email&utm_medium=intel" style="display:inline-block;background:#1a1a1a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Get Free Audit</a>
    </div>

    <p style="color:#6b6b6b;font-size:14px;margin:24px 0 0 0;">Run another estimate anytime at:<br><a href="https://intel.42agency.com/tools/meta-budget-calculator" style="color:#0668E1;">intel.42agency.com/tools/meta-budget-calculator</a></p>
  </div>
  <div style="background:#1a1a1a;padding:16px 24px;text-align:center;">
    <p style="color:#9a9a9a;margin:0;font-size:12px;">Built by <a href="https://42agency.com" style="color:#DFFE68;">42 Agency</a> - B2B Demand Gen & Marketing Ops</p>
  </div>
</div></body></html>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: '42 Agency <noreply@42agency.com>',
        to: email,
        subject: `Your Meta Ads Budget Estimate: $${parseInt(budget).toLocaleString()}/mo`,
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

async function pushToHubSpot(email, result) {
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

    // HubSpot payload
    const properties = {
      email,
      lifecyclestage: 'lead',
      // Custom properties (must exist in HubSpot)
      meta_budget_product: (result.product || '').substring(0, 500),
      meta_budget_type: result.campaignType || '',
      meta_budget_amount: result.budget?.toString() || '',
      meta_budget_leads: result.leads?.toString() || '',
      meta_budget_cpl: result.cpl?.toString() || '',
      meta_budget_date: new Date().toISOString().split('T')[0],
    };

    let response;
    if (existingContactId) {
      console.log('Updating existing HubSpot contact:', existingContactId);
      response = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${existingContactId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties }),
      });
    } else {
      console.log('Creating new HubSpot contact for:', email);
      response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties }),
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error('HubSpot API error response:', JSON.stringify(errorData));
      return { success: false, error: errorData };
    }

    console.log('HubSpot contact saved successfully');
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

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return Math.round(num / 1000) + 'K';
  return num?.toLocaleString() || '0';
}
