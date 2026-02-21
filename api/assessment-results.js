// Vercel Edge Function for Assessment Results
// Sends email via Resend + pushes to HubSpot

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
    const { email, name, company, result } = await request.json();

    // 1. Send email via Resend
    const emailResult = await sendResultsEmail(email, name, company, result);

    // 2. Push to HubSpot CRM
    const hubspotResult = await pushToHubSpot(email, name, company, result);

    // 3. Push to Resend Audience
    const resendContactResult = await pushToResendAudience(email, name, company, result);

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
    console.error('Error processing assessment results:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to process results' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function sendResultsEmail(email, name, company, result) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return { success: false, reason: 'not_configured' };

  try {
    const gradeEmoji = { A: '🎉', B: '👍', C: '⚠️', D: '🚨', F: '🔥' }[result.grade] || '📊';

    const categoryRows = result.categories
      .map((cat) => {
        const statusColor = cat.status === 'good' ? '#10B981' : cat.status === 'warning' ? '#F59E0B' : '#EF4444';
        return `<tr><td style="padding:8px 0;border-bottom:1px solid #e5e5e5;">${cat.categoryName}</td><td style="padding:8px 0;border-bottom:1px solid #e5e5e5;text-align:right;font-weight:bold;color:${statusColor};">${cat.percentage}%</td></tr>`;
      })
      .join('');

    const criticalIssuesList = result.criticalIssues.length
      ? `<div style="background:#FEE2E2;border:2px solid #EF4444;border-radius:12px;padding:16px;margin:16px 0;"><h3 style="color:#EF4444;margin:0 0 12px 0;">⚠️ Critical Issues</h3><ul style="margin:0;padding-left:20px;color:#7F1D1D;">${result.criticalIssues.map((issue) => `<li style="margin:4px 0;">${issue}</li>`).join('')}</ul></div>`
      : '';

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;margin:0;padding:20px;"><div style="max-width:600px;margin:0 auto;background:white;border:2px solid #1a1a1a;border-radius:16px;overflow:hidden;"><div style="background:#DFFE68;padding:24px;border-bottom:2px solid #1a1a1a;"><table width="100%"><tr><td><div style="width:40px;height:40px;background:white;border:2px solid #1a1a1a;border-radius:8px;text-align:center;line-height:36px;font-weight:bold;">42</div></td><td style="text-align:right;"><span style="color:#1a1a1a;font-weight:bold;">HubSpot CRM Health Assessment</span></td></tr></table></div><div style="padding:32px;"><p style="color:#4a4a4a;margin:0 0 24px 0;">Hi ${name},</p><p style="color:#4a4a4a;margin:0 0 24px 0;">Here are your HubSpot CRM Health Assessment results${company ? ` for ${company}` : ''}:</p><div style="text-align:center;margin:32px 0;"><div style="display:inline-block;width:120px;height:120px;border:4px solid ${result.percentage >= 70 ? '#10B981' : result.percentage >= 40 ? '#F59E0B' : '#EF4444'};border-radius:50%;background:${result.percentage >= 70 ? '#D1FAE5' : result.percentage >= 40 ? '#FEF3C7' : '#FEE2E2'};"><div style="margin-top:32px;"><div style="font-size:36px;font-weight:bold;color:${result.percentage >= 70 ? '#10B981' : result.percentage >= 40 ? '#F59E0B' : '#EF4444'};">${result.percentage}%</div><div style="font-size:14px;font-weight:bold;color:${result.percentage >= 70 ? '#10B981' : result.percentage >= 40 ? '#F59E0B' : '#EF4444'};">Grade: ${result.grade}</div></div></div><h2 style="color:#1a1a1a;margin:16px 0 0 0;">${gradeEmoji} Your CRM Health Score</h2></div><div style="background:#f5f5f5;border:2px solid #1a1a1a;border-radius:12px;padding:16px;margin:24px 0;"><h3 style="color:#1a1a1a;margin:0 0 12px 0;">Category Breakdown</h3><table width="100%" style="border-collapse:collapse;">${categoryRows}</table></div>${criticalIssuesList}${result.percentage < 70 ? `<div style="background:#DFFE68;border:2px solid #1a1a1a;border-radius:12px;padding:24px;margin:24px 0;text-align:center;"><h3 style="color:#1a1a1a;margin:0 0 12px 0;">Want Help Fixing These Issues?</h3><p style="color:#4a4a4a;margin:0 0 16px 0;">Book a free 15-minute CRM triage call with our MOPS team.</p><a href="https://42agency.com/contact?utm_source=assessment_email&utm_medium=hubspot-health" style="display:inline-block;background:#1a1a1a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Book Free CRM Review</a></div>` : ''}<p style="color:#6b6b6b;font-size:14px;margin:24px 0 0 0;">Take the assessment again anytime at:<br><a href="https://intel.42agency.com/assessments/hubspot-health" style="color:#3B82F6;">intel.42agency.com/assessments/hubspot-health</a></p></div><div style="background:#1a1a1a;padding:16px 24px;text-align:center;"><p style="color:#9a9a9a;margin:0;font-size:12px;">Built by <a href="https://42agency.com" style="color:#DFFE68;">42 Agency</a> — B2B Demand Gen & Marketing Ops</p></div></div></body></html>`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: '42 Agency <noreply@42agency.com>',
        to: email,
        subject: `Your HubSpot CRM Health Score: ${result.percentage}% (Grade ${result.grade})`,
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

async function pushToHubSpot(email, name, company, result) {
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

    const nameParts = name.split(' ');
    const properties = {
      email,
      firstname: nameParts[0] || '',
      lastname: nameParts.slice(1).join(' ') || '',
      company: company || '',
      hubspot_health_score: result.percentage.toString(),
      hubspot_health_grade: result.grade,
      hubspot_health_assessment_date: new Date().toISOString().split('T')[0],
      hubspot_health_critical_issues: result.criticalIssues.length.toString(),
      hubspot_health_weakest_category: result.categories.sort((a, b) => a.percentage - b.percentage)[0]?.categoryName || '',
      lifecyclestage: 'lead',
      hs_lead_status: result.percentage < 60 ? 'NEW' : 'OPEN',
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

async function pushToResendAudience(email, name, company, result) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

  if (!RESEND_API_KEY || !RESEND_AUDIENCE_ID) {
    return { success: false, reason: 'not_configured' };
  }

  try {
    const nameParts = name.split(' ');

    const response = await fetch(`https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
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
