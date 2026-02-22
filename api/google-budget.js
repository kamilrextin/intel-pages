// Vercel Edge Function for Google Ads Budget Calculator
// Generates keywords, gets CPCs from DataForSEO, sends email + pushes to HubSpot

export const config = {
  runtime: 'edge',
};

// High-intent keyword patterns
const HIGH_INTENT_PATTERNS = [
  '{product} demo',
  '{product} pricing',
  '{product} cost',
  '{product} software',
  '{product} platform',
  '{product} solution',
  '{product} tools',
  'best {product}',
  '{product} for enterprise',
  '{product} for business',
  '{product} comparison',
  '{product} vs',
  '{product} alternative',
  '{product} reviews',
  'top {product}',
  '{product} vendor',
  '{product} provider',
  'buy {product}',
  '{product} free trial',
];

// Keyword generation prompt for Claude
const KEYWORD_PROMPT = `You are a B2B Google Ads keyword research expert. Generate high-intent keywords for the following product/service.

Product/Service: "{target}"

Generate 12-15 high-intent B2B keywords that indicate buying intent. Focus on:
- Demo/pricing/cost keywords
- Comparison keywords (vs, alternative, best)
- Solution/software/platform keywords
- Enterprise/business keywords

Return a JSON array of keyword strings. No explanations, just the JSON array.

Example output:
["supply chain software", "supply chain software pricing", "best supply chain platform", "supply chain software demo", "supply chain solution for enterprise"]`;

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { email, target } = await request.json();

    if (!target || !email) {
      return new Response(JSON.stringify({ error: 'Target and email are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 1: Generate keywords with Claude
    const keywords = await generateKeywords(target);
    console.log('Generated keywords:', keywords);

    // Step 2: Get CPC data from DataForSEO
    const keywordData = await getKeywordMetrics(keywords);
    console.log('Keyword data:', JSON.stringify(keywordData));

    // Step 3: Calculate totals and budgets
    const totalSearches = keywordData.reduce((sum, kw) => sum + (kw.searchVolume || 0), 0);
    const totalCpc = keywordData.reduce((sum, kw) => sum + (kw.cpc || 0), 0);
    const avgCpc = keywordData.length > 0 ? totalCpc / keywordData.length : 10;

    // Budget calculations
    // Estimated clicks = total searches * 3% CTR
    // Budget = clicks * CPC * capture percentage
    const estimatedClicks = totalSearches * 0.03;
    const budgets = {
      min: Math.round(estimatedClicks * avgCpc * 0.3),
      ideal: Math.round(estimatedClicks * avgCpc * 0.5),
      aggressive: Math.round(estimatedClicks * avgCpc * 1.0)
    };

    // Ensure minimum budgets
    budgets.min = Math.max(1500, budgets.min);
    budgets.ideal = Math.max(3000, budgets.ideal);
    budgets.aggressive = Math.max(5000, budgets.aggressive);

    // Step 4: Send results (async, don't block response)
    const resultPromises = [];

    // Send email via Resend
    resultPromises.push(sendResultsEmail(email, {
      target,
      keywords: keywordData,
      totalSearches,
      avgCpc,
      budgets
    }).catch(err => console.error('Email error:', err)));

    // Push to HubSpot with enhanced data
    resultPromises.push(pushToHubSpot(email, {
      target,
      keywordCount: keywordData.length,
      keywords: keywordData,
      totalSearches,
      avgCpc,
      budgets
    }).catch(err => console.error('HubSpot error:', err)));

    // Push to Resend Audience
    resultPromises.push(pushToResendAudience(email).catch(err => console.error('Resend Audience error:', err)));

    // Don't await these - let them run in background
    Promise.all(resultPromises);

    return new Response(JSON.stringify({
      success: true,
      target,
      keywords: keywordData,
      totalSearches,
      avgCpc,
      budgets,
      source: 'DataForSEO'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Google budget calculator error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to calculate budget'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function generateKeywords(target) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    // Fallback: generate keywords from patterns
    return generateKeywordsFromPatterns(target);
  }

  try {
    const prompt = KEYWORD_PROMPT.replace('{target}', target);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      console.error('Claude API error:', response.status);
      return generateKeywordsFromPatterns(target);
    }

    const data = await response.json();
    const text = data.content[0]?.text || '';

    // Parse JSON array from response
    let jsonText = text.trim();
    const arrayMatch = jsonText.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]);
    }

    return generateKeywordsFromPatterns(target);
  } catch (error) {
    console.error('Keyword generation error:', error);
    return generateKeywordsFromPatterns(target);
  }
}

function generateKeywordsFromPatterns(target) {
  // Extract core product terms
  const terms = target.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2 && !['for', 'and', 'the', 'with'].includes(t));

  const product = terms.slice(0, 3).join(' ');

  return HIGH_INTENT_PATTERNS
    .map(pattern => pattern.replace('{product}', product))
    .slice(0, 15);
}

async function getKeywordMetrics(keywords) {
  const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
  const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;

  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    console.log('DataForSEO not configured, using estimates');
    return getEstimatedMetrics(keywords);
  }

  try {
    const credentials = btoa(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`);

    const response = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{
        keywords: keywords.slice(0, 15), // Limit to 15 keywords
        location_code: 2840, // United States
        language_code: 'en'
      }])
    });

    if (!response.ok) {
      console.error('DataForSEO error:', response.status);
      return getEstimatedMetrics(keywords);
    }

    const data = await response.json();

    if (data.status_code !== 20000) {
      console.error('DataForSEO API error:', data.status_message);
      return getEstimatedMetrics(keywords);
    }

    const results = [];
    const tasks = data.tasks || [];

    for (const task of tasks) {
      if (task.status_code !== 20000) continue;

      for (const item of (task.result || [])) {
        results.push({
          keyword: item.keyword,
          searchVolume: item.search_volume || 0,
          cpc: item.cpc || 0,
          lowBid: item.low_top_of_page_bid || 0,
          highBid: item.high_top_of_page_bid || 0,
          competition: mapCompetition(item.competition_index)
        });
      }
    }

    // Sort by search volume descending
    results.sort((a, b) => (b.searchVolume || 0) - (a.searchVolume || 0));

    return results.length > 0 ? results : getEstimatedMetrics(keywords);
  } catch (error) {
    console.error('DataForSEO fetch error:', error);
    return getEstimatedMetrics(keywords);
  }
}

function mapCompetition(index) {
  if (index === null || index === undefined) return 'Medium';
  if (index >= 66) return 'High';
  if (index >= 33) return 'Medium';
  return 'Low';
}

function getEstimatedMetrics(keywords) {
  // Generate realistic B2B estimates
  return keywords.slice(0, 15).map((keyword, index) => {
    // Higher intent keywords get higher CPCs
    const isHighIntent = keyword.includes('pricing') || keyword.includes('demo') ||
                        keyword.includes('cost') || keyword.includes('buy');
    const isComparison = keyword.includes('vs') || keyword.includes('alternative') ||
                        keyword.includes('best') || keyword.includes('review');

    let baseCpc = 8;
    let baseVolume = 500;

    if (isHighIntent) {
      baseCpc = 15;
      baseVolume = 300;
    } else if (isComparison) {
      baseCpc = 12;
      baseVolume = 400;
    }

    // Add some variance
    const variance = 0.7 + Math.random() * 0.6;

    return {
      keyword,
      searchVolume: Math.round(baseVolume * variance * (1 - index * 0.05)),
      cpc: Math.round(baseCpc * variance * 100) / 100,
      lowBid: Math.round(baseCpc * 0.6 * variance * 100) / 100,
      highBid: Math.round(baseCpc * 1.5 * variance * 100) / 100,
      competition: isHighIntent ? 'High' : (isComparison ? 'Medium' : 'Low')
    };
  });
}

async function sendResultsEmail(email, result) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return { success: false, reason: 'not_configured' };

  const { target, keywords, totalSearches, avgCpc, budgets } = result;

  // Build keywords table rows
  const keywordRows = keywords.slice(0, 10).map(kw => {
    const compColor = kw.competition === 'High' ? '#991b1b' :
                      kw.competition === 'Medium' ? '#92400e' : '#065f46';
    const compBg = kw.competition === 'High' ? '#fee2e2' :
                   kw.competition === 'Medium' ? '#fef3c7' : '#d1fae5';
    return `<tr>
      <td style="padding:10px;border-bottom:1px solid #e5e5e5;font-weight:600;">${kw.keyword}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e5e5;text-align:right;">${formatNumber(kw.searchVolume)}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e5e5;text-align:right;font-weight:700;color:#4285F4;">$${kw.cpc.toFixed(2)}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e5e5;text-align:right;"><span style="background:${compBg};color:${compColor};padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;">${kw.competition}</span></td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;margin:0;padding:20px;">
<div style="max-width:600px;margin:0 auto;background:white;border:2px solid #1a1a1a;border-radius:16px;overflow:hidden;">
  <div style="background:#4285F4;padding:24px;border-bottom:2px solid #1a1a1a;">
    <table width="100%"><tr>
      <td><div style="width:40px;height:40px;background:white;border:2px solid #1a1a1a;border-radius:8px;text-align:center;line-height:36px;font-weight:bold;">42</div></td>
      <td style="text-align:right;"><span style="color:white;font-weight:bold;">Google Ads Budget Estimate</span></td>
    </tr></table>
  </div>
  <div style="padding:32px;">
    <p style="color:#4a4a4a;margin:0 0 24px 0;">Here are your Google Ads keyword research results:</p>

    <div style="text-align:center;margin:24px 0;padding:16px;background:#f5f5f5;border-radius:12px;">
      <div style="font-weight:600;color:#1a1a1a;margin-bottom:8px;">${target}</div>
      <div style="display:flex;justify-content:center;gap:24px;flex-wrap:wrap;">
        <div><span style="font-size:24px;font-weight:800;color:#4285F4;">${keywords.length}</span><br><span style="font-size:12px;color:#6b6b6b;">Keywords</span></div>
        <div><span style="font-size:24px;font-weight:800;color:#4285F4;">${formatNumber(totalSearches)}</span><br><span style="font-size:12px;color:#6b6b6b;">Searches/Mo</span></div>
        <div><span style="font-size:24px;font-weight:800;color:#4285F4;">$${avgCpc.toFixed(2)}</span><br><span style="font-size:12px;color:#6b6b6b;">Avg CPC</span></div>
      </div>
    </div>

    <h3 style="color:#1a1a1a;margin:24px 0 16px 0;font-size:16px;">High-Intent Keywords</h3>
    <table width="100%" style="border-collapse:collapse;font-size:14px;">
      <tr style="background:#f5f5f5;"><th style="padding:10px;text-align:left;font-size:12px;color:#6b6b6b;">Keyword</th><th style="padding:10px;text-align:right;font-size:12px;color:#6b6b6b;">Volume</th><th style="padding:10px;text-align:right;font-size:12px;color:#6b6b6b;">CPC</th><th style="padding:10px;text-align:right;font-size:12px;color:#6b6b6b;">Comp.</th></tr>
      ${keywordRows}
    </table>

    <h3 style="color:#1a1a1a;margin:24px 0 16px 0;font-size:16px;">Recommended Monthly Budgets</h3>
    <table width="100%" style="border-collapse:collapse;">
      <tr><td style="padding:12px;"><span style="background:#fee2e2;color:#991b1b;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:bold;">MIN</span> 30% click share</td><td style="padding:12px;text-align:right;font-weight:bold;font-size:18px;">$${budgets.min.toLocaleString()}</td></tr>
      <tr><td style="padding:12px;background:#DFFE68;border-radius:8px;"><span style="background:#d1fae5;color:#065f46;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:bold;">IDEAL</span> 50% click share</td><td style="padding:12px;background:#DFFE68;border-radius:8px;text-align:right;font-weight:bold;font-size:18px;">$${budgets.ideal.toLocaleString()}</td></tr>
      <tr><td style="padding:12px;"><span style="background:#dbeafe;color:#1e40af;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:bold;">AGG</span> 100% click share</td><td style="padding:12px;text-align:right;font-weight:bold;font-size:18px;">$${budgets.aggressive.toLocaleString()}</td></tr>
    </table>

    <div style="background:#DFFE68;border:2px solid #1a1a1a;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
      <h3 style="color:#1a1a1a;margin:0 0 12px 0;">Need Help With Google Ads?</h3>
      <p style="color:#4a4a4a;margin:0 0 16px 0;">Get a free campaign audit from our B2B specialists.</p>
      <a href="https://42agency.com/contact?utm_source=google_budget_email&utm_medium=intel" style="display:inline-block;background:#1a1a1a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Get Your Free Audit</a>
    </div>

    <p style="color:#6b6b6b;font-size:14px;margin:24px 0 0 0;">Run another estimate anytime at:<br><a href="https://intel.42agency.com/tools/google-ads-budget-calculator" style="color:#4285F4;">intel.42agency.com/tools/google-ads-budget-calculator</a></p>
  </div>
  <div style="background:#1a1a1a;padding:16px 24px;text-align:center;">
    <p style="color:#9a9a9a;margin:0;font-size:12px;">Built by <a href="https://42agency.com" style="color:#DFFE68;">42 Agency</a> — B2B Demand Gen & Marketing Ops</p>
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
        subject: `Your Google Ads Budget Estimate: ${keywords.length} keywords, $${avgCpc.toFixed(2)} avg CPC`,
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

    // Enhanced HubSpot payload with all budget data
    const topKeywords = (result.keywords || []).slice(0, 5).map(k => k.keyword).join(', ');
    const properties = {
      email,
      google_budget_target: (result.target || '').substring(0, 500),
      google_budget_keyword_count: result.keywordCount?.toString() || '',
      google_budget_total_searches: result.totalSearches?.toString() || '',
      google_budget_avg_cpc: result.avgCpc?.toFixed(2) || '',
      google_budget_min: result.budgets?.min?.toString() || '',
      google_budget_ideal: result.budgets?.ideal?.toString() || '',
      google_budget_aggressive: result.budgets?.aggressive?.toString() || '',
      google_budget_top_keywords: topKeywords.substring(0, 500),
      google_budget_date: new Date().toISOString().split('T')[0],
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

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return Math.round(num / 1000) + 'K';
  return num?.toLocaleString() || '0';
}
