const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const playbooks = [
  {
    name: 'closed-lost-revival',
    title: 'Closed Lost Revival Playbook',
    subtitle: 'Turn Dead Deals Into Pipeline Gold',
    sections: [
      {
        title: 'Why Closed-Lost Deals Are Hidden Gold',
        content: `
          <p>Your CRM is sitting on untapped revenue. Closed-lost deals aren't dead—they're dormant. The prospect already knows you, went through evaluation, and had budget discussions. Something just didn't align <em>at that moment</em>.</p>
          <p><strong>The math:</strong> If you have 100 closed-lost deals from the past 18 months and can revive just 10% at your average deal size, that's pure pipeline you didn't have to generate from scratch.</p>
          <div class="callout">
            <strong>42 Agency Benchmark:</strong> Companies running structured closed-lost revival programs see 8-15% conversion rates on re-engaged opportunities—higher than most cold outbound.
          </div>
        `
      },
      {
        title: 'The Timing Triggers Framework',
        content: `
          <p>Not all closed-lost deals should be contacted at the same time. Match your outreach timing to the <em>reason</em> the deal was lost:</p>
          <table>
            <tr><th>Lost Reason</th><th>Wait Period</th><th>Why This Works</th></tr>
            <tr><td><strong>Budget/Timing</strong></td><td>60-90 days</td><td>New quarter = new budget. Align with fiscal cycles.</td></tr>
            <tr><td><strong>Chose Competitor</strong></td><td>120-180 days</td><td>Honeymoon period ends. Implementation issues surface.</td></tr>
            <tr><td><strong>No Decision/Stalled</strong></td><td>90 days</td><td>Internal priorities may have shifted. New stakeholders may exist.</td></tr>
            <tr><td><strong>Champion Left</strong></td><td>30-60 days</td><td>Track champion to new company. Also re-engage account with new contacts.</td></tr>
            <tr><td><strong>Wrong Timing</strong></td><td>Based on trigger</td><td>Set specific calendar reminder for when timing improves.</td></tr>
          </table>
        `
      },
      {
        title: 'Re-Engagement Sequences by Lost Reason',
        content: `
          <h3>Sequence 1: Budget/Timing (4 touches over 3 weeks)</h3>
          <div class="sequence">
            <p><strong>Touch 1 (Email):</strong> "Quick check-in—new quarter planning"</p>
            <p class="example">"Hi [Name], we connected back in [Month] about [solution]. I know timing wasn't right then. As you're planning for Q[X], wanted to see if [pain point] is still on your radar. Happy to share what's changed on our end."</p>
            <p><strong>Touch 2 (LinkedIn):</strong> Connect or engage with their content</p>
            <p><strong>Touch 3 (Email):</strong> Share relevant case study or benchmark</p>
            <p><strong>Touch 4 (Email):</strong> Direct ask for 15-min call</p>
          </div>

          <h3>Sequence 2: Chose Competitor (3 touches over 4 weeks)</h3>
          <div class="sequence">
            <p><strong>Touch 1 (Email):</strong> "Checking in on [Competitor] implementation"</p>
            <p class="example">"Hi [Name], hope the [Competitor] rollout is going well. We've been hearing from a few companies who started with them and are now evaluating alternatives. Not assuming that's you—just wanted to stay on your radar if priorities shift."</p>
            <p><strong>Touch 2:</strong> Share competitive intel or industry benchmark</p>
            <p><strong>Touch 3:</strong> Offer comparison consultation</p>
          </div>
        `
      },
      {
        title: 'Champion Tracking System',
        content: `
          <p>When your champion leaves, you have <strong>two</strong> opportunities:</p>
          <ol>
            <li><strong>Follow the champion</strong> to their new company (warm intro to a new account)</li>
            <li><strong>Re-engage the account</strong> with new stakeholders who may have different priorities</li>
          </ol>

          <h3>Champion Tracking Workflow</h3>
          <ol>
            <li>Set up LinkedIn Sales Navigator alerts for all champions</li>
            <li>When job change detected, wait 30-60 days (let them settle)</li>
            <li>Reach out: "Congrats on the new role. When you're ready to tackle [pain point] at [New Company], I'd love to reconnect."</li>
            <li>Simultaneously: Identify new stakeholders at the old account via LinkedIn/ZoomInfo</li>
            <li>Reach out to new contacts: "We were working with [Champion Name] on [project]. Wanted to introduce myself as your point of contact."</li>
          </ol>

          <div class="callout">
            <strong>Pro Tip:</strong> Champions who left often become your best referral sources. Even if their new company isn't a fit, ask: "Who else in your network is dealing with [pain point]?"
          </div>
        `
      },
      {
        title: 'Implementation Checklist',
        content: `
          <div class="checklist">
            <p><input type="checkbox"> Export all closed-lost deals from past 18 months</p>
            <p><input type="checkbox"> Categorize by lost reason (budget, competitor, timing, champion left, no decision)</p>
            <p><input type="checkbox"> Apply timing triggers to create contact date for each</p>
            <p><input type="checkbox"> Build sequences in your sales engagement tool</p>
            <p><input type="checkbox"> Set up champion tracking alerts in LinkedIn Sales Navigator</p>
            <p><input type="checkbox"> Create "Closed-Lost Revival" pipeline stage to track re-engaged opps</p>
            <p><input type="checkbox"> Review and refresh list quarterly</p>
          </div>
        `
      }
    ]
  },
  {
    name: 'lead-scoring-framework',
    title: 'Lead Scoring Framework Builder',
    subtitle: 'Build an ICP-Based Model That Predicts Conversion',
    sections: [
      {
        title: 'Why Most Lead Scoring Fails',
        content: `
          <p>Most lead scoring models are built backwards. Teams assign arbitrary points to actions (downloaded whitepaper = 10 points!) without validating against actual conversion data.</p>
          <p><strong>The result:</strong> Sales gets "MQLs" that don't convert, loses trust in marketing, and the model becomes ignored.</p>
          <div class="callout">
            <strong>The Fix:</strong> Build your scoring model from <em>closed-won analysis</em>, not guesswork. What do your best customers have in common? What actions did they take before converting?
          </div>
        `
      },
      {
        title: 'The Two-Axis Scoring Model',
        content: `
          <p>Effective lead scoring has two independent components:</p>
          <table>
            <tr><th>Axis</th><th>What It Measures</th><th>Max Points</th></tr>
            <tr><td><strong>ICP Fit Score</strong></td><td>How well does this lead match your ideal customer profile?</td><td>50 points</td></tr>
            <tr><td><strong>Engagement Score</strong></td><td>How actively is this lead engaging with your content/product?</td><td>50 points</td></tr>
          </table>
          <p><strong>Why two axes?</strong> A perfect-fit company with no engagement isn't ready for sales. A highly engaged lead from a bad-fit company will waste sales time. You need <em>both</em> to be high.</p>
        `
      },
      {
        title: 'ICP Fit Scoring (50 points max)',
        content: `
          <p>Score these firmographic and demographic attributes:</p>
          <table>
            <tr><th>Attribute</th><th>Ideal Match</th><th>Points</th></tr>
            <tr><td><strong>Company Size</strong></td><td>Your sweet spot (e.g., 200-2000 employees)</td><td>+15</td></tr>
            <tr><td></td><td>Adjacent (e.g., 50-199 or 2001-5000)</td><td>+8</td></tr>
            <tr><td></td><td>Outside range</td><td>0</td></tr>
            <tr><td><strong>Industry</strong></td><td>Primary target industry</td><td>+15</td></tr>
            <tr><td></td><td>Secondary industry</td><td>+8</td></tr>
            <tr><td></td><td>Non-target</td><td>0</td></tr>
            <tr><td><strong>Job Title/Seniority</strong></td><td>Decision maker (VP+)</td><td>+10</td></tr>
            <tr><td></td><td>Influencer (Manager/Director)</td><td>+6</td></tr>
            <tr><td></td><td>Individual contributor</td><td>+2</td></tr>
            <tr><td><strong>Geography</strong></td><td>Primary market</td><td>+5</td></tr>
            <tr><td></td><td>Secondary market</td><td>+2</td></tr>
            <tr><td><strong>Tech Stack</strong></td><td>Uses complementary tech</td><td>+5</td></tr>
          </table>
        `
      },
      {
        title: 'Engagement Scoring (50 points max)',
        content: `
          <p>Score behavioral signals by intent strength:</p>
          <table>
            <tr><th>Action</th><th>Intent Level</th><th>Points</th></tr>
            <tr><td><strong>Demo/Trial Request</strong></td><td>High</td><td>+25</td></tr>
            <tr><td><strong>Pricing Page Visit</strong></td><td>High</td><td>+15</td></tr>
            <tr><td><strong>Case Study Download</strong></td><td>High</td><td>+10</td></tr>
            <tr><td><strong>Product Page (2+ visits)</strong></td><td>Medium</td><td>+8</td></tr>
            <tr><td><strong>Webinar Attendance</strong></td><td>Medium</td><td>+8</td></tr>
            <tr><td><strong>Whitepaper/Guide Download</strong></td><td>Medium</td><td>+5</td></tr>
            <tr><td><strong>Blog Visit (3+ articles)</strong></td><td>Low</td><td>+3</td></tr>
            <tr><td><strong>Email Click</strong></td><td>Low</td><td>+2</td></tr>
            <tr><td><strong>Email Open</strong></td><td>Low</td><td>+1</td></tr>
          </table>
          <div class="callout">
            <strong>Important:</strong> Cap engagement score contributions from low-intent actions. Someone who opens 50 emails shouldn't outscore someone who requested a demo.
          </div>
        `
      },
      {
        title: 'Score Decay: The Missing Piece',
        content: `
          <p>Engagement scores should decay over time. A demo request from 6 months ago isn't as valuable as one from last week.</p>
          <h3>Recommended Decay Schedule</h3>
          <table>
            <tr><th>Time Since Action</th><th>Score Retention</th></tr>
            <tr><td>0-30 days</td><td>100%</td></tr>
            <tr><td>31-60 days</td><td>75%</td></tr>
            <tr><td>61-90 days</td><td>50%</td></tr>
            <tr><td>90+ days</td><td>25%</td></tr>
          </table>
          <p><strong>Implementation:</strong> Most MAPs support score decay. In HubSpot, use a workflow that reduces engagement score by 25% every 30 days if no new activity.</p>
        `
      },
      {
        title: 'MQL Threshold Calibration',
        content: `
          <p>Your MQL threshold should be calibrated against actual conversion data, not arbitrary numbers.</p>
          <h3>Calibration Process</h3>
          <ol>
            <li>Apply your scoring model retroactively to the last 6-12 months of leads</li>
            <li>Segment by score ranges (0-25, 26-50, 51-75, 76-100)</li>
            <li>Calculate conversion rate to SQL and closed-won for each segment</li>
            <li>Set MQL threshold where conversion rate becomes acceptable to sales</li>
          </ol>
          <div class="callout">
            <strong>Example:</strong> If leads scoring 60+ convert to SQL at 25% (vs 5% for leads under 60), set your MQL threshold at 60. Review and adjust quarterly.
          </div>
        `
      }
    ]
  },
  {
    name: 'lead-reengagement',
    title: 'Lead Re-Engagement Playbook',
    subtitle: 'Wake Up Your Cold Database',
    sections: [
      {
        title: 'The Hidden Cost of a Cold Database',
        content: `
          <p>You paid to acquire every lead in your database. If 60-70% are "cold" (no engagement in 90+ days), you're sitting on wasted investment.</p>
          <p><strong>The opportunity:</strong> Re-engaging just 5-10% of cold leads costs a fraction of acquiring new ones.</p>
          <div class="callout">
            <strong>42 Agency Benchmark:</strong> Structured re-engagement campaigns typically see 3-8% of cold leads return to active status, with 15-25% of those converting to opportunities within 90 days.
          </div>
        `
      },
      {
        title: 'Cold Lead Segmentation Matrix',
        content: `
          <p>Not all cold leads deserve the same treatment. Segment by ICP fit + recency:</p>
          <table>
            <tr><th></th><th>High ICP Fit</th><th>Medium ICP Fit</th><th>Low ICP Fit</th></tr>
            <tr><td><strong>Cold 90-180 days</strong></td><td>Priority 1: Full re-engagement</td><td>Priority 2: Light touch</td><td>Monitor only</td></tr>
            <tr><td><strong>Cold 180-365 days</strong></td><td>Priority 2: Re-engagement</td><td>Priority 3: Single touch</td><td>Sunset candidate</td></tr>
            <tr><td><strong>Cold 365+ days</strong></td><td>Priority 3: Reactivation</td><td>Sunset candidate</td><td>Sunset</td></tr>
          </table>
        `
      },
      {
        title: 'The Multi-Channel Re-Engagement Sequence',
        content: `
          <h3>Week 1-2: Email Sequence</h3>
          <div class="sequence">
            <p><strong>Email 1:</strong> "Still interested in [pain point]?"</p>
            <p class="example">Subject: Quick question, [First Name]<br><br>We connected a while back about [topic]. Things change fast—wanted to check if [solving pain point] is still a priority for your team this year.<br><br>If yes, I'd love to share what's new. If not, no worries—just let me know and I'll update my notes.</p>
            <p><strong>Email 2 (if no response):</strong> Share a relevant resource (benchmark, case study)</p>
            <p><strong>Email 3 (if no response):</strong> "Should I close your file?"</p>
            <p class="example">Subject: Should I close your file?<br><br>[First Name], I've reached out a few times without hearing back. Totally understand if priorities have shifted.<br><br>Should I remove you from future outreach about [topic], or is there a better time to reconnect?</p>
          </div>

          <h3>Week 2-3: Retargeting Ads</h3>
          <p>Upload cold lead list to LinkedIn/Meta for retargeting. Show:</p>
          <ul>
            <li>New product features or capabilities</li>
            <li>Fresh case studies from their industry</li>
            <li>Upcoming webinar or event</li>
          </ul>

          <h3>Week 3-4: Direct Mail (High ICP only)</h3>
          <p>For high-value, high-fit leads who haven't responded: send physical mail (book, handwritten note, creative gift).</p>
        `
      },
      {
        title: 'Re-Engagement Messaging Frameworks',
        content: `
          <h3>The "What's Changed" Framework</h3>
          <p>Position outreach around what's new on YOUR end:</p>
          <p class="example">"Since we last talked, we've [launched X / added Y / helped Z company achieve result]. Thought it might be relevant given [their situation]."</p>

          <h3>The "Trigger Event" Framework</h3>
          <p>Reference something that happened in THEIR world:</p>
          <p class="example">"Saw the news about [company expansion / new hire / funding]. We've been helping companies in similar situations with [relevant solution]."</p>

          <h3>The "Valuable Resource" Framework</h3>
          <p>Lead with pure value, no ask:</p>
          <p class="example">"Put together this [benchmark/report/guide] for [industry]. Thought you'd find the data on [specific insight] useful. No strings attached."</p>
        `
      },
      {
        title: 'Sunset Policy: When to Let Go',
        content: `
          <p>Not every lead is worth re-engaging forever. A clear sunset policy keeps your database healthy.</p>
          <h3>Recommended Sunset Criteria</h3>
          <p><strong>Move to sunset/archive if:</strong></p>
          <ul>
            <li>No engagement in 18+ months AND low ICP fit</li>
            <li>Hard bounced 2+ times</li>
            <li>Explicitly unsubscribed or requested removal</li>
            <li>Company no longer exists or was acquired</li>
            <li>3+ re-engagement attempts with zero response (low ICP fit)</li>
          </ul>

          <p><strong>Keep attempting (with reduced frequency) if:</strong></p>
          <ul>
            <li>High ICP fit regardless of engagement history</li>
            <li>Previous opportunity that didn't close</li>
            <li>Known champion who changed jobs</li>
          </ul>

          <div class="callout">
            <strong>Sunset ≠ Delete:</strong> Archive leads to a separate list. Don't delete them—you may need them for suppression lists or future reference.
          </div>
        `
      }
    ]
  },
  {
    name: 'intent-signals',
    title: 'Intent Signals Playbook',
    subtitle: 'Identify and Act on Buying Intent',
    sections: [
      {
        title: 'The Three Types of Intent Data',
        content: `
          <table>
            <tr><th>Type</th><th>Source</th><th>Reliability</th><th>Cost</th></tr>
            <tr><td><strong>First-Party</strong></td><td>Your own website, product, emails</td><td>Highest</td><td>Free (you own it)</td></tr>
            <tr><td><strong>Second-Party</strong></td><td>Review sites (G2, Capterra), partner data</td><td>High</td><td>$5K-$30K/year</td></tr>
            <tr><td><strong>Third-Party</strong></td><td>Bombora, 6sense, Demandbase</td><td>Variable</td><td>$30K-$150K/year</td></tr>
          </table>
          <div class="callout">
            <strong>42 Agency POV:</strong> Most companies should master first-party intent before spending $30K+ on third-party data. Your own website behavior is the highest-signal, lowest-cost intent data you have.
          </div>
        `
      },
      {
        title: 'Intent Signal Taxonomy',
        content: `
          <p>Score signals by buying stage and strength:</p>
          <table>
            <tr><th>Signal</th><th>Stage</th><th>Strength</th><th>Response</th></tr>
            <tr><td><strong>Demo/pricing request</strong></td><td>Decision</td><td>Very High</td><td>Immediate sales outreach</td></tr>
            <tr><td><strong>Pricing page (2+ visits)</strong></td><td>Decision</td><td>High</td><td>Sales outreach within 24h</td></tr>
            <tr><td><strong>Competitor comparison page</strong></td><td>Evaluation</td><td>High</td><td>Trigger competitor battle card email</td></tr>
            <tr><td><strong>Case study download</strong></td><td>Evaluation</td><td>Medium-High</td><td>SDR follow-up + nurture</td></tr>
            <tr><td><strong>G2/Capterra profile view</strong></td><td>Evaluation</td><td>Medium-High</td><td>Account-based retargeting</td></tr>
            <tr><td><strong>Product pages (deep)</strong></td><td>Consideration</td><td>Medium</td><td>Nurture + retargeting</td></tr>
            <tr><td><strong>Webinar attendance</strong></td><td>Consideration</td><td>Medium</td><td>Nurture sequence</td></tr>
            <tr><td><strong>Blog (3+ articles)</strong></td><td>Awareness</td><td>Low</td><td>Content retargeting</td></tr>
            <tr><td><strong>Third-party topic surge</strong></td><td>Awareness</td><td>Low-Medium</td><td>Awareness ads + SDR list</td></tr>
          </table>
        `
      },
      {
        title: 'First-Party Intent Setup Guide',
        content: `
          <h3>1. Page-Level Scoring</h3>
          <p>Assign intent scores to key pages:</p>
          <ul>
            <li><strong>/pricing</strong> → High intent (+15 points)</li>
            <li><strong>/demo</strong> → High intent (+20 points)</li>
            <li><strong>/vs-competitor</strong> → High intent (+12 points)</li>
            <li><strong>/case-studies/*</strong> → Medium intent (+8 points)</li>
            <li><strong>/product/*</strong> → Medium intent (+5 points)</li>
            <li><strong>/blog/*</strong> → Low intent (+2 points)</li>
          </ul>

          <h3>2. Event Tracking (GA4 + HubSpot)</h3>
          <p>Track these custom events:</p>
          <ul>
            <li><code>pricing_page_time</code> → Time on pricing page (>60s = high intent)</li>
            <li><code>video_watch</code> → Product video completion %</li>
            <li><code>scroll_depth</code> → Page scroll depth on key pages</li>
            <li><code>return_visit</code> → Returning visitor to high-intent pages</li>
          </ul>

          <h3>3. UTM Taxonomy</h3>
          <p>Structure UTMs to capture intent by campaign:</p>
          <code>utm_source / utm_medium / utm_campaign / utm_content / utm_term</code>
          <p>Example: <code>linkedin / paid / demo-cta / video-ad / cfo-targeting</code></p>
        `
      },
      {
        title: 'Third-Party Vendor Comparison',
        content: `
          <table>
            <tr><th>Vendor</th><th>Best For</th><th>Price Range</th><th>Pros</th><th>Cons</th></tr>
            <tr>
              <td><strong>Bombora</strong></td>
              <td>Topic-level intent</td>
              <td>$30-60K/year</td>
              <td>Largest co-op, topic granularity</td>
              <td>Requires significant volume to be useful</td>
            </tr>
            <tr>
              <td><strong>6sense</strong></td>
              <td>Full ABM platform</td>
              <td>$60-150K/year</td>
              <td>Account ID + intent + orchestration</td>
              <td>Expensive, complex implementation</td>
            </tr>
            <tr>
              <td><strong>Demandbase</strong></td>
              <td>Enterprise ABM</td>
              <td>$50-120K/year</td>
              <td>Strong account ID, ABM ads</td>
              <td>Better for large enterprises</td>
            </tr>
            <tr>
              <td><strong>G2 Buyer Intent</strong></td>
              <td>Software companies</td>
              <td>$15-40K/year</td>
              <td>High-signal (review site), category views</td>
              <td>Software/SaaS focused only</td>
            </tr>
            <tr>
              <td><strong>ZoomInfo Intent</strong></td>
              <td>Bundled with data</td>
              <td>Bundled</td>
              <td>Convenient if already using ZoomInfo</td>
              <td>Intent is add-on, not core strength</td>
            </tr>
          </table>
        `
      },
      {
        title: 'Intent-to-Action Playbook',
        content: `
          <h3>When You Detect High Intent:</h3>
          <ol>
            <li><strong>Alert sales immediately</strong> (Slack notification or task)</li>
            <li><strong>Enrich the account</strong> with additional contacts</li>
            <li><strong>Launch 1:1 retargeting</strong> to the account</li>
            <li><strong>SDR outreach within 24 hours</strong> with personalized angle</li>
          </ol>

          <h3>When You Detect Medium Intent:</h3>
          <ol>
            <li><strong>Add to nurture sequence</strong> specific to their interest</li>
            <li><strong>Launch account-based ads</strong> showing case studies</li>
            <li><strong>Monitor for escalation</strong> to high-intent behavior</li>
          </ol>

          <h3>When You Detect Low Intent (Awareness):</h3>
          <ol>
            <li><strong>Add to awareness retargeting pool</strong></li>
            <li><strong>Include in broad nurture</strong></li>
            <li><strong>Do NOT send to SDR</strong> (waste of time)</li>
          </ol>
        `
      },
      {
        title: 'ROI Measurement Framework',
        content: `
          <p>Prove intent data is working with these metrics:</p>
          <table>
            <tr><th>Metric</th><th>Formula</th><th>Target</th></tr>
            <tr><td><strong>Intent-Influenced Pipeline</strong></td><td>Pipeline $ from accounts with intent signals / Total pipeline</td><td>>50%</td></tr>
            <tr><td><strong>Speed to Opportunity</strong></td><td>Days from first intent signal to opp created</td><td>Baseline - 20%</td></tr>
            <tr><td><strong>Win Rate Lift</strong></td><td>Win rate (intent accounts) / Win rate (non-intent accounts)</td><td>>1.3x</td></tr>
            <tr><td><strong>SDR Efficiency</strong></td><td>Meetings booked from intent leads / Total meetings booked</td><td>>40%</td></tr>
          </table>
          <div class="callout">
            <strong>Proving ROI:</strong> Run a controlled test. Give half your SDR team intent data, half without. Measure meeting rates after 90 days.
          </div>
        `
      }
    ]
  },
  {
    name: 'abm-enrichment',
    title: 'ABM Enrichment Playbook',
    subtitle: 'Build Complete Account Data for Target Account Programs',
    sections: [
      {
        title: 'Why Data Quality Makes or Breaks ABM',
        content: `
          <p>ABM fails when you're targeting the wrong people at the right accounts. Most ABM lists have:</p>
          <ul>
            <li>Incomplete contacts (1-2 people per account vs. 5-8 needed)</li>
            <li>Wrong titles (outdated or incorrect)</li>
            <li>Missing firmographics (can't segment properly)</li>
            <li>Bad emails (30%+ bounce rates)</li>
          </ul>
          <div class="callout">
            <strong>The Standard:</strong> For effective ABM, you need 5-8 contacts per target account across the buying committee, with 85%+ data accuracy.
          </div>
        `
      },
      {
        title: 'Account Enrichment Framework',
        content: `
          <p>Enrich these fields for every target account:</p>
          <table>
            <tr><th>Category</th><th>Fields</th><th>Source</th></tr>
            <tr>
              <td><strong>Firmographics</strong></td>
              <td>Employee count, revenue, industry, sub-industry, HQ location, office locations</td>
              <td>ZoomInfo, Clearbit, LinkedIn</td>
            </tr>
            <tr>
              <td><strong>Technographics</strong></td>
              <td>Tech stack, tools used, platforms</td>
              <td>BuiltWith, HG Insights, 6sense</td>
            </tr>
            <tr>
              <td><strong>Org Structure</strong></td>
              <td>Reporting structure, department sizes, key executives</td>
              <td>LinkedIn Sales Nav, ZoomInfo Org Charts</td>
            </tr>
            <tr>
              <td><strong>Intent/Fit Signals</strong></td>
              <td>Funding, hiring, news, tech changes</td>
              <td>Crunchbase, LinkedIn, Bombora</td>
            </tr>
          </table>
        `
      },
      {
        title: 'Contact Acquisition: Building Buying Committees',
        content: `
          <h3>The 5-8 Contact Rule</h3>
          <p>For B2B deals, you typically need to reach:</p>
          <table>
            <tr><th>Role</th><th>Example Titles</th><th>Why They Matter</th></tr>
            <tr><td><strong>Economic Buyer</strong></td><td>CFO, VP Finance, CRO</td><td>Controls budget</td></tr>
            <tr><td><strong>Technical Buyer</strong></td><td>CTO, VP Engineering, IT Director</td><td>Evaluates fit</td></tr>
            <tr><td><strong>User Buyer</strong></td><td>Director of Ops, Team Lead</td><td>Daily user, adoption</td></tr>
            <tr><td><strong>Champion</strong></td><td>Manager, Senior IC</td><td>Internal advocate</td></tr>
            <tr><td><strong>Blocker</strong></td><td>Incumbent vendor owner, IT Security</td><td>Can kill deal</td></tr>
          </table>

          <h3>Contact Acquisition Workflow</h3>
          <ol>
            <li>Export target account list from CRM</li>
            <li>Pull org charts from LinkedIn Sales Navigator</li>
            <li>Identify 5-8 contacts per buying committee role</li>
            <li>Enrich with email + phone via ZoomInfo/Apollo/Cognism</li>
            <li>Validate emails before loading to CRM (use NeverBounce or ZeroBounce)</li>
            <li>Load to CRM with account association</li>
          </ol>
        `
      },
      {
        title: 'Data Vendor Comparison',
        content: `
          <table>
            <tr><th>Vendor</th><th>Best For</th><th>Email Accuracy</th><th>Price</th></tr>
            <tr>
              <td><strong>Clay</strong></td>
              <td>Multi-provider waterfall, workflows</td>
              <td>~90% (waterfall)</td>
              <td>$149-720/mo</td>
            </tr>
            <tr>
              <td><strong>ZoomInfo</strong></td>
              <td>Enterprise, full platform</td>
              <td>~85%</td>
              <td>$15-50K/year</td>
            </tr>
            <tr>
              <td><strong>Apollo</strong></td>
              <td>SMB/Mid-market, outbound</td>
              <td>~80%</td>
              <td>$1-5K/year</td>
            </tr>
            <tr>
              <td><strong>Cognism</strong></td>
              <td>EMEA coverage, GDPR</td>
              <td>~85%</td>
              <td>$10-30K/year</td>
            </tr>
            <tr>
              <td><strong>Lusha</strong></td>
              <td>Direct dials, quick enrichment</td>
              <td>~75%</td>
              <td>$3-10K/year</td>
            </tr>
            <tr>
              <td><strong>People Data Labs</strong></td>
              <td>API access, large volumes</td>
              <td>~80%</td>
              <td>Pay per record</td>
            </tr>
            <tr>
              <td><strong>Clearbit</strong></td>
              <td>Real-time enrichment, API</td>
              <td>~82%</td>
              <td>$12-30K/year</td>
            </tr>
          </table>
          <div class="callout">
            <strong>42 Agency Recommendation:</strong> Clay is the new gold standard for enrichment—150+ data providers with waterfall logic means higher match rates than any single vendor. Start with Clay for flexibility, use ZoomInfo for org charts, Apollo for budget-friendly prospecting.
          </div>
        `
      },
      {
        title: 'Clay: The Enrichment Orchestration Layer',
        content: `
          <p>Clay has changed the enrichment game. Instead of choosing one data vendor, Clay lets you orchestrate 150+ providers through a single interface with <strong>waterfall enrichment</strong>.</p>

          <h3>How Waterfall Enrichment Works</h3>
          <p>Traditional enrichment: Query one provider → get ~80% match rate → accept gaps.</p>
          <p>Clay waterfall: Query Provider A → if no match, query Provider B → then C → achieve 90%+ match rates.</p>

          <h3>Clay Pricing Breakdown</h3>
          <table>
            <tr><th>Plan</th><th>Monthly</th><th>Credits/Month</th><th>Best For</th></tr>
            <tr><td>Free</td><td>$0</td><td>100</td><td>Testing</td></tr>
            <tr><td>Starter</td><td>$149</td><td>2,000</td><td>Small teams</td></tr>
            <tr><td>Explorer</td><td>$349</td><td>10,000</td><td>Growth teams</td></tr>
            <tr><td>Pro</td><td>$720</td><td>50,000</td><td>Scale operations</td></tr>
          </table>
          <p><em>Credits vary by action: basic verification = 1 credit, full profile enrichment = 5-10 credits.</em></p>

          <h3>What You Can Enrich with Clay</h3>
          <ul>
            <li><strong>Company data:</strong> Revenue, employee count, industry, tech stack, funding</li>
            <li><strong>Contact data:</strong> Emails (work + personal), phone numbers, LinkedIn URLs</li>
            <li><strong>Intent signals:</strong> Job postings, tech changes, funding news, hiring velocity</li>
            <li><strong>Social profiles:</strong> LinkedIn, Twitter, company pages</li>
          </ul>

          <h3>Clay ABM Workflow</h3>
          <ol>
            <li>Import target account list (CSV or CRM sync)</li>
            <li>Enrich accounts with firmographics + technographics</li>
            <li>Find 5-8 contacts per account using waterfall</li>
            <li>Validate emails with built-in verification</li>
            <li>Score/filter based on enriched data</li>
            <li>Push to CRM or outbound tool</li>
          </ol>

          <div class="callout">
            <strong>When to Use Clay vs. Direct Vendors:</strong> Use Clay when you need flexibility across multiple data types or have complex enrichment workflows. Use direct vendors (ZoomInfo, Apollo) when you need deep integrations or unlimited access to a specific dataset.
          </div>
        `
      },
      {
        title: 'Data Hygiene Workflows',
        content: `
          <h3>Ongoing Maintenance (Monthly)</h3>
          <ul>
            <li><strong>Email validation:</strong> Re-validate emails with >30 days since last engagement</li>
            <li><strong>Bounce monitoring:</strong> Auto-suppress after 2 hard bounces</li>
            <li><strong>Job change tracking:</strong> LinkedIn Sales Nav alerts for champions</li>
            <li><strong>Firmographic refresh:</strong> Re-enrich accounts quarterly for size/revenue changes</li>
          </ul>

          <h3>Data Quality Metrics to Track</h3>
          <table>
            <tr><th>Metric</th><th>Target</th><th>Red Flag</th></tr>
            <tr><td>Email deliverability</td><td>>95%</td><td><85%</td></tr>
            <tr><td>Contact-to-account ratio</td><td>5-8 per account</td><td><3 per account</td></tr>
            <tr><td>Title accuracy (spot check)</td><td>>90%</td><td><80%</td></tr>
            <tr><td>Duplicate rate</td><td><5%</td><td>>10%</td></tr>
          </table>
        `
      },
      {
        title: 'Enrichment Budget Calculator',
        content: `
          <p>Use this formula to estimate your enrichment spend:</p>
          <div class="formula">
            <p><strong>Annual Enrichment Budget =</strong></p>
            <p>(Target Accounts × Contacts per Account × Cost per Contact) + (Refresh Rate × Records × Refresh Cost)</p>
          </div>

          <h3>Example Calculation</h3>
          <table>
            <tr><td>Target Accounts</td><td>500</td></tr>
            <tr><td>Contacts per Account</td><td>6</td></tr>
            <tr><td>Cost per Contact (Apollo)</td><td>$0.50</td></tr>
            <tr><td><strong>Initial Build Cost</strong></td><td><strong>$1,500</strong></td></tr>
            <tr><td>Quarterly Refresh (20% of records)</td><td>$300 × 4 = $1,200</td></tr>
            <tr><td><strong>Total Annual Budget</strong></td><td><strong>$2,700</strong></td></tr>
          </table>

          <div class="callout">
            <strong>Pro Tip:</strong> Start with your top 100 accounts. Build complete buying committees there first. Better to have 6 contacts per 100 accounts than 1 contact per 600 accounts.
          </div>
        `
      }
    ]
  }
];

const htmlTemplate = (playbook) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${playbook.title} | 42 Agency</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Inter', -apple-system, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #1a1a1a;
            padding: 0;
            background: white;
        }

        .cover {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
            color: white;
            padding: 3rem;
            page-break-after: always;
        }

        .cover-badge {
            background: #DFFE68;
            color: #1a1a1a;
            padding: 0.5rem 1.5rem;
            border-radius: 999px;
            font-weight: 700;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 2rem;
        }

        .cover h1 {
            font-size: 2.5rem;
            font-weight: 800;
            letter-spacing: -0.02em;
            margin-bottom: 1rem;
            max-width: 600px;
        }

        .cover .subtitle {
            font-size: 1.25rem;
            color: #ccc;
            margin-bottom: 3rem;
        }

        .cover-logo {
            margin-top: auto;
            padding-top: 3rem;
        }

        .cover-logo img {
            height: 32px;
            filter: brightness(0) invert(1);
        }

        .cover-url {
            color: #DFFE68;
            font-size: 0.9rem;
            margin-top: 0.5rem;
        }

        .content {
            padding: 2rem 3rem;
            max-width: 800px;
            margin: 0 auto;
        }

        .section {
            margin-bottom: 2.5rem;
            page-break-inside: avoid;
        }

        h2 {
            font-size: 1.5rem;
            font-weight: 800;
            color: #1a1a1a;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 3px solid #DFFE68;
        }

        h3 {
            font-size: 1.1rem;
            font-weight: 700;
            color: #1a1a1a;
            margin: 1.5rem 0 0.75rem;
        }

        p {
            margin-bottom: 0.75rem;
            color: #333;
        }

        ul, ol {
            margin: 0.75rem 0 0.75rem 1.5rem;
            color: #333;
        }

        li {
            margin-bottom: 0.5rem;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            font-size: 0.9rem;
        }

        th, td {
            padding: 0.6rem 0.75rem;
            text-align: left;
            border: 1px solid #ddd;
        }

        th {
            background: #f5f5f5;
            font-weight: 700;
        }

        tr:nth-child(even) {
            background: #fafafa;
        }

        .callout {
            background: #DFFE68;
            border-left: 4px solid #1a1a1a;
            padding: 1rem 1.25rem;
            margin: 1.25rem 0;
            border-radius: 0 8px 8px 0;
        }

        .callout strong {
            display: block;
            margin-bottom: 0.25rem;
        }

        .sequence {
            background: #f8f8f8;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 1rem 1.25rem;
            margin: 1rem 0;
        }

        .example {
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 0.75rem;
            margin: 0.5rem 0;
            font-size: 0.85rem;
            color: #555;
            font-style: italic;
        }

        .checklist p {
            margin: 0.5rem 0;
        }

        .checklist input[type="checkbox"] {
            margin-right: 0.5rem;
        }

        code {
            background: #f0f0f0;
            padding: 0.15rem 0.4rem;
            border-radius: 4px;
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 0.85em;
        }

        .formula {
            background: #1a1a1a;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            margin: 1rem 0;
        }

        .formula p {
            color: white;
            margin: 0.25rem 0;
        }

        .footer {
            margin-top: 3rem;
            padding-top: 1.5rem;
            border-top: 2px solid #1a1a1a;
            text-align: center;
            color: #666;
            font-size: 0.85rem;
        }

        .footer strong {
            color: #1a1a1a;
        }

        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .cover { height: 100vh; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="cover">
        <div class="cover-badge">42 Agency Playbook</div>
        <h1>${playbook.title}</h1>
        <p class="subtitle">${playbook.subtitle}</p>
        <div class="cover-logo">
            <div style="font-size: 1.5rem; font-weight: 800;">42</div>
            <div class="cover-url">intel.42agency.com</div>
        </div>
    </div>

    <div class="content">
        ${playbook.sections.map(section => `
            <div class="section">
                <h2>${section.title}</h2>
                ${section.content}
            </div>
        `).join('')}

        <div class="footer">
            <p><strong>42 Agency</strong> — B2B Performance Marketing</p>
            <p>intel.42agency.com | 42agency.com</p>
        </div>
    </div>
</body>
</html>
`;

async function generatePDFs() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    for (const playbook of playbooks) {
        console.log(`Generating ${playbook.name}.pdf...`);

        const html = htmlTemplate(playbook);
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const outputDir = path.join(__dirname, '..', 'playbooks', playbook.name);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputPath = path.join(outputDir, `${playbook.name}-playbook.pdf`);

        await page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true,
            margin: { top: '0', bottom: '0', left: '0', right: '0' }
        });

        console.log(`  ✓ Saved to ${outputPath}`);
        await page.close();
    }

    await browser.close();
    console.log('\nAll PDFs generated successfully!');
}

generatePDFs().catch(console.error);
