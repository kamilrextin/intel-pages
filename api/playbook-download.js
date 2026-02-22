export const config = { runtime: 'edge' };

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

const playbooks = {
  'closed-lost-revival': {
    title: 'Closed Lost Revival Playbook',
    pdf: '/playbooks/closed-lost-revival/closed-lost-revival-playbook.pdf',
    description: 'Turn dead deals into pipeline gold with timing triggers, re-engagement sequences, and champion tracking.'
  },
  'lead-scoring-framework': {
    title: 'Lead Scoring Framework Builder',
    pdf: '/playbooks/lead-scoring-framework/lead-scoring-framework-playbook.pdf',
    description: 'Build an ICP-based scoring model with engagement scoring and MQL threshold calibration.'
  },
  'lead-reengagement': {
    title: 'Lead Re-Engagement Playbook',
    pdf: '/playbooks/lead-reengagement/lead-reengagement-playbook.pdf',
    description: 'Wake up your cold leads with segmentation strategies, messaging frameworks, and automation workflows.'
  },
  'intent-signals': {
    title: 'Intent Signals Playbook',
    pdf: '/playbooks/intent-signals/intent-signals-playbook.pdf',
    description: 'Identify and act on buying intent with first-party, second-party, and third-party intent data strategies.'
  },
  'abm-enrichment': {
    title: 'ABM Enrichment Playbook',
    pdf: '/playbooks/abm-enrichment/abm-enrichment-playbook.pdf',
    description: 'Build complete account data with enrichment frameworks, vendor comparisons, and budget calculators.'
  }
};

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { email, playbook: playbookId } = await request.json();

    if (!email || !playbookId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const playbook = playbooks[playbookId];
    if (!playbook) {
      return Response.json({ error: 'Invalid playbook' }, { status: 400 });
    }

    const baseUrl = 'https://intel.42agency.com';
    const pdfUrl = `${baseUrl}${playbook.pdf}`;

    // Send email, push to HubSpot, and push to Resend audience in parallel
    await Promise.all([
      // 1. Send email via Resend
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: '42 Agency <intel@42agency.com>',
          to: email,
          subject: `Your ${playbook.title} is ready`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; }
                .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                .header { text-align: center; margin-bottom: 32px; }
                .logo { font-size: 24px; font-weight: 800; color: #1a1a1a; }
                .card { background: #f8f8f8; border: 2px solid #1a1a1a; border-radius: 12px; padding: 24px; margin: 24px 0; }
                .card h2 { margin: 0 0 8px 0; font-size: 20px; }
                .card p { margin: 0; color: #666; }
                .btn { display: inline-block; background: #DFFE68; color: #1a1a1a; padding: 14px 28px; text-decoration: none; font-weight: 700; border-radius: 8px; margin: 20px 0; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">42</div>
                </div>

                <h1>Your playbook is ready!</h1>
                <p>Thanks for downloading the <strong>${playbook.title}</strong>. Click below to access your PDF:</p>

                <div class="card">
                  <h2>${playbook.title}</h2>
                  <p>${playbook.description}</p>
                </div>

                <a href="${pdfUrl}" class="btn">Download PDF</a>

                <p style="margin-top: 24px;">This playbook is part of our B2B marketing resource library. Browse more at <a href="${baseUrl}/playbooks/">intel.42agency.com/playbooks</a>.</p>

                <div class="footer">
                  <p><strong>42 Agency</strong> — B2B Performance Marketing</p>
                  <p><a href="https://42agency.com">42agency.com</a></p>
                </div>
              </div>
            </body>
            </html>
          `
        })
      }),

      // 2. Push to HubSpot CRM
      fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            email: email,
            playbook_downloaded: playbookId,
            playbook_download_date: new Date().toISOString().split('T')[0],
            lead_source: 'Intel Pages',
            lead_source_detail: `Playbook: ${playbook.title}`
          }
        })
      }).catch(() => {
        // If contact exists, update instead
        return fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${encodeURIComponent(email)}?idProperty=email`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            properties: {
              playbook_downloaded: playbookId,
              playbook_download_date: new Date().toISOString().split('T')[0]
            }
          })
        });
      }),

      // 3. Add to Resend audience
      fetch(`https://api.resend.com/audiences/${process.env.RESEND_AUDIENCE_ID}/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          unsubscribed: false
        })
      }).catch(() => {})
    ]);

    return Response.json({
      success: true,
      pdfUrl: playbook.pdf
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
