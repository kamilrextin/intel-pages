// Vercel Edge Function for Post-Raise Budget Allocator
// Records lead, sends email, pushes to HubSpot

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
    const {
      email,
      budget,
      fundingRound,
      primaryGoal,
      salesMotion,
      companySize,
      channels
    } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Process background tasks
    const resultPromises = [];

    // Send email via Resend
    resultPromises.push(sendResultsEmail(email, {
      budget,
      fundingRound,
      primaryGoal,
      salesMotion,
      companySize,
      channels
    }).catch(err => console.error('Email error:', err)));

    // Push to HubSpot
    resultPromises.push(pushToHubSpot(email, {
      budget,
      fundingRound,
      primaryGoal,
      salesMotion,
      companySize
    }).catch(err => console.error('HubSpot error:', err)));

    // Push to Resend Audience
    resultPromises.push(pushToResendAudience(email).catch(err => console.error('Resend Audience error:', err)));

    // Wait for all background tasks
    await Promise.all(resultPromises);

    return new Response(JSON.stringify({
      success: true,
      message: 'Budget plan unlocked'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Post-raise allocator error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to process request'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function formatCurrency(num) {
  if (num >= 1000000) return '$' + (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return '$' + Math.round(num / 1000) + 'K';
  return '$' + (num || 0).toLocaleString();
}

function getRoundLabel(round) {
  const labels = {
    'seed': 'Seed',
    'series-a': 'Series A',
    'series-b': 'Series B',
    'series-c': 'Series C+'
  };
  return labels[round] || round;
}

function getGoalLabel(goal) {
  const labels = {
    'pipeline': 'Pipeline Generation',
    'awareness': 'Brand Awareness',
    'both': 'Balanced (Pipeline + Awareness)'
  };
  return labels[goal] || goal;
}

function getMotionLabel(motion) {
  const labels = {
    'plg': 'Product-Led Growth',
    'sales-led': 'Sales-Led',
    'hybrid': 'Hybrid (PLG + Sales)'
  };
  return labels[motion] || motion;
}

function getSizeLabel(size) {
  const labels = {
    'smb': 'SMB (<200 employees)',
    'mid-market': 'Mid-Market (200-2,000)',
    'enterprise': 'Enterprise (2,000+)'
  };
  return labels[size] || size;
}

async function sendResultsEmail(email, result) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return { success: false, reason: 'not_configured' };

  const { budget, fundingRound, primaryGoal, salesMotion, companySize, channels } = result;

  // Build channel allocation rows
  const channelRows = (channels || []).map((c, i) => `
    <tr style="background:${i % 2 === 0 ? '#f5f5f5' : 'white'};">
      <td style="padding:12px;border-radius:${i % 2 === 0 ? '8px 0 0 8px' : '0'};">${c.name}</td>
      <td style="padding:12px;text-align:center;font-weight:bold;">${c.pct}%</td>
      <td style="padding:12px;text-align:right;font-weight:bold;border-radius:${i % 2 === 0 ? '0 8px 8px 0' : '0'};">${formatCurrency(c.amount)}/mo</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;margin:0;padding:20px;">
<div style="max-width:600px;margin:0 auto;background:white;border:2px solid #1a1a1a;border-radius:16px;overflow:hidden;">
  <div style="background:#DFFE68;padding:24px;border-bottom:2px solid #1a1a1a;">
    <table width="100%"><tr>
      <td><div style="width:40px;height:40px;background:white;border:2px solid #1a1a1a;border-radius:8px;text-align:center;line-height:36px;font-weight:bold;">42</div></td>
      <td style="text-align:right;"><span style="color:#1a1a1a;font-weight:bold;">Post-Raise Budget Plan</span></td>
    </tr></table>
  </div>
  <div style="padding:32px;">
    <p style="color:#4a4a4a;margin:0 0 24px 0;">Your marketing budget allocation plan is ready:</p>

    <div style="text-align:center;margin:24px 0;padding:24px;background:#1a1a1a;border-radius:12px;color:white;">
      <div style="font-size:48px;font-weight:800;color:#DFFE68;">${formatCurrency(budget)}</div>
      <div style="color:#999;font-size:14px;margin-top:4px;">monthly marketing budget</div>
    </div>

    <div style="background:#f5f5f5;border-radius:12px;padding:16px;margin-bottom:24px;">
      <table width="100%" style="font-size:14px;">
        <tr>
          <td style="padding:4px 0;color:#6b6b6b;">Funding Round:</td>
          <td style="padding:4px 0;text-align:right;font-weight:600;">${getRoundLabel(fundingRound)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#6b6b6b;">Primary Goal:</td>
          <td style="padding:4px 0;text-align:right;font-weight:600;">${getGoalLabel(primaryGoal)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#6b6b6b;">Sales Motion:</td>
          <td style="padding:4px 0;text-align:right;font-weight:600;">${getMotionLabel(salesMotion)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#6b6b6b;">Target Company Size:</td>
          <td style="padding:4px 0;text-align:right;font-weight:600;">${getSizeLabel(companySize)}</td>
        </tr>
      </table>
    </div>

    <h3 style="color:#1a1a1a;margin:24px 0 16px 0;font-size:16px;">Channel Allocation</h3>
    <table width="100%" style="border-collapse:collapse;">
      <tr style="border-bottom:2px solid #1a1a1a;">
        <th style="padding:8px;text-align:left;font-size:12px;color:#6b6b6b;text-transform:uppercase;">Channel</th>
        <th style="padding:8px;text-align:center;font-size:12px;color:#6b6b6b;text-transform:uppercase;">%</th>
        <th style="padding:8px;text-align:right;font-size:12px;color:#6b6b6b;text-transform:uppercase;">Amount</th>
      </tr>
      ${channelRows}
    </table>

    <h3 style="color:#1a1a1a;margin:32px 0 16px 0;font-size:16px;">6-Month Rollout</h3>
    <table width="100%">
      <tr>
        <td style="width:33%;vertical-align:top;padding:8px;">
          <div style="background:#DFFE68;border:2px solid #1a1a1a;border-radius:8px;padding:12px;text-align:center;">
            <div style="font-size:11px;color:#4a4a4a;text-transform:uppercase;margin-bottom:4px;">Month 1-2</div>
            <div style="font-weight:bold;font-size:14px;">Foundation</div>
          </div>
        </td>
        <td style="width:33%;vertical-align:top;padding:8px;">
          <div style="background:#f5f5f5;border:2px solid #e0e0e0;border-radius:8px;padding:12px;text-align:center;">
            <div style="font-size:11px;color:#6b6b6b;text-transform:uppercase;margin-bottom:4px;">Month 3-4</div>
            <div style="font-weight:bold;font-size:14px;">Scale</div>
          </div>
        </td>
        <td style="width:33%;vertical-align:top;padding:8px;">
          <div style="background:#f5f5f5;border:2px solid #e0e0e0;border-radius:8px;padding:12px;text-align:center;">
            <div style="font-size:11px;color:#6b6b6b;text-transform:uppercase;margin-bottom:4px;">Month 5-6</div>
            <div style="font-weight:bold;font-size:14px;">Optimize</div>
          </div>
        </td>
      </tr>
    </table>

    <div style="background:#DFFE68;border:2px solid #1a1a1a;border-radius:12px;padding:24px;margin:32px 0;text-align:center;">
      <h3 style="color:#1a1a1a;margin:0 0 8px 0;">Need Help Executing?</h3>
      <p style="color:#4a4a4a;margin:0 0 16px 0;font-size:14px;">Get a free strategy session with our team to discuss your post-raise marketing plan.</p>
      <a href="https://www.42agency.com/contact-us?utm_source=post_raise_email&utm_medium=intel" style="display:inline-block;background:#1a1a1a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Book a Strategy Call</a>
    </div>

    <p style="color:#6b6b6b;font-size:14px;margin:24px 0 0 0;">Run another allocation anytime at:<br><a href="https://intel.42agency.com/tools/post-raise-allocator" style="color:#1a1a1a;font-weight:600;">intel.42agency.com/tools/post-raise-allocator</a></p>
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
        subject: `Your Post-Raise Budget Plan: ${formatCurrency(budget)}/mo`,
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
    };

    // Custom properties (must exist in HubSpot first)
    const customProps = {
      post_raise_round: result.fundingRound || '',
      post_raise_budget: result.budget?.toString() || '',
      post_raise_goal: result.primaryGoal || '',
      post_raise_motion: result.salesMotion || '',
      post_raise_company_size: result.companySize || '',
      post_raise_date: new Date().toISOString().split('T')[0],
    };

    Object.assign(properties, customProps);

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
