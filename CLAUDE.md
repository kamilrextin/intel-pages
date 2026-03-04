# Intel Pages - B2B Marketing Resources

**URL:** https://intel.42agency.com
**Hosting:** Vercel (project: `intel-pages`)
**Deploy:** `cd /Users/42agency/intel-pages && vercel --prod`

---

## ⚠️ intel-pages vs ads-tracker

| Project | URL | Purpose |
|---------|-----|---------|
| **intel-pages** (THIS REPO) | intel.42agency.com | Public: assessments, benchmarks, tools, playbooks |
| **ads-tracker** | linkedin-ads-intel-v2.vercel.app | Internal: LinkedIn Ad Library scraper |

**Key differences:**
- `intel-pages` = Static site, no database, public lead magnets
- `ads-tracker` = Full-stack Next.js app with auth, database, LinkedIn API

**The HubSpot Health Assessment lives here** (`/assessments/hubspot-health/index.html`).

**Domain:** `intel.42agency.com` → `intel-pages`. Do NOT alias to ads-tracker.

---

## IMPORTANT: This is the Main Hub

**Intel Pages is the central hub for ALL 42 Agency tools, resources, assessments, and diagnostics.**

When building:
- **New tools** → Build in intel-pages `/tools/`
- **Lead magnets** → Build in intel-pages with appropriate structure
- **Assessments/Quizzes** → Build in intel-pages `/assess/` or `/assessments/`
- **Any interactive content** → Build in intel-pages

**DO NOT** build these in separate Next.js apps or Vercel projects. Use intel-pages to ensure:
- Consistent design system
- Discovery paths and interlinking
- Shared header/footer navigation
- Unified analytics (GTM + HubSpot + Vercel Analytics)

---

## ⚠️ Pages Manifest & Validation

**All 135+ pages are tracked in `pages-manifest.json`**

### After Creating/Modifying Pages:

```bash
cd ~/intel-pages

# 1. Add new page to pages-manifest.json under appropriate category
# 2. Validate before deploy
node scripts/validate-pages.js

# 3. Deploy
vercel --prod

# 4. Validate production (confirms all pages are live)
node scripts/validate-pages.js
```

### Validation Commands:

```bash
# Check all 135 pages
node scripts/validate-pages.js

# Check only critical pages (faster)
node scripts/validate-pages.js --critical

# Check specific category
node scripts/validate-pages.js --category tools
node scripts/validate-pages.js --category playbooks
node scripts/validate-pages.js --category benchmarks
```

### Manifest Categories:

| Category | Description |
|----------|-------------|
| `core` | Main hub pages (/, /assess/, /tools/, etc.) |
| `assessments` | Interactive diagnostic tools |
| `tools` | AI-powered calculators |
| `playbooks` | Soft-gated B2B playbooks |
| `benchmarks` | Industry benchmark data |
| `audits` | Audit template downloads |
| `client_intel` | AI SDR generated intel pages |
| `sentiment_analysis` | Market sentiment pages |
| `agents` | Claude Code agent pages |
| `test` | Non-critical test pages |

---

## Site Architecture

### Information Architecture (User Intent)

| Section | URL | Purpose | User Intent |
|---------|-----|---------|-------------|
| **Assess** | `/assess/` | Diagnostic tools hub | "How am I doing?" |
| **Benchmarks** | `/b2b-benchmarks/` | Data & industry benchmarks | "What's good?" |
| **AI Tools** | `/tools/` | Interactive AI-powered tools | "Help me do it" |
| **Playbooks** | `/playbooks/` | Soft-gated B2B playbooks | "Show me how" |
| **Resources** | `/` (main index) | All templates & toolkits | "Give me templates" |

### URL Structure

```
intel.42agency.com/
├── /                           # Main resources hub
├── /tools/                     # AI Tools hub
│   ├── /company-sampler/       # B2B Company Sample Builder
│   ├── /company-resolver/      # Company Name to LinkedIn Resolver
│   ├── /linkedin-budget-calculator/   # LinkedIn Ads Budget Calculator
│   ├── /linkedin-inmail-calculator/   # InMail ROI Calculator
│   ├── /google-ads-budget-calculator/ # Google Ads Budget Calculator
│   └── /meta-budget-calculator/       # Meta Ads Budget Calculator
├── /assess/                    # Assessments & diagnostics hub
│   └── /calculator/            # B2B Benchmark Calculator
├── /assessments/
│   └── /hubspot-health/        # HubSpot CRM Health Assessment
├── /playbooks/                 # B2B Playbooks hub
│   ├── /closed-lost-revival/   # Closed Lost Revival Playbook
│   ├── /lead-scoring-framework/ # Lead Scoring Framework Builder
│   ├── /lead-reengagement/     # Lead Re-Engagement Playbook
│   ├── /intent-signals/        # Intent Signals Playbook
│   └── /abm-enrichment/        # ABM Enrichment Playbook
├── /b2b-benchmarks/            # Benchmarks hub (data)
│   ├── /linkedin-ads-benchmarks/
│   ├── /google-ads-benchmarks/
│   ├── /meta-ads-benchmarks/
│   ├── /linkedin-inmail-benchmarks/
│   ├── /legal-tech-linkedin-ads/           # Industry pSEO
│   ├── /healthcare-tech-linkedin-ads/
│   ├── /fintech-linkedin-ads/
│   ├── /devops-linkedin-ads/
│   ├── /privacy-security-linkedin-ads/
│   ├── /logistics-linkedin-ads/
│   ├── /construction-tech-linkedin-ads/
│   ├── /ecommerce-retail-linkedin-ads/
│   ├── /digital-workplace-linkedin-ads/
│   ├── /edtech-hrtech-linkedin-ads/
│   ├── /martech-salestech-linkedin-ads/
│   ├── /life-sciences-linkedin-ads/
│   ├── /ucaas-telecom-linkedin-ads/
│   └── /consumer-b2b-linkedin-ads/
├── /linkedin-audit/            # Audit templates
├── /google-ads-audit/
├── /meta-audit/
├── /hubspot-audit/
├── /mops-funnel/
├── /zenabm/                    # ABM toolkit
└── /exitfive/                  # Claude Code workshop
```

### Redirects (vercel.json)

| From | To | Type |
|------|----|------|
| `/b2b-benchmarks/calculator/` | `/assess/calculator/` | 301 Permanent |

---

## Tech Stack

- Static HTML/CSS (no framework)
- Vercel Edge Functions for APIs
- Vercel Web Analytics (free tier: 50k events/month)
- HubSpot CRM API + Collected Forms API
- Resend for transactional email + Audiences
- GTM Container: `GTM-MM5BTNS`
- HubSpot Portal: `44888286`

### Analytics

**Vercel Web Analytics** enabled on all 105 HTML pages (Feb 2026).
- Script: `/_vercel/insights/script.js` (auto-served by Vercel)
- Dashboard: https://vercel.com/42agency/intel-pages/analytics
- Free tier: 50k events/month, 1 month retention
- No npm package needed for static HTML - just the script tag before `</body>`

### API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/assessment-results` | HubSpot Assessment → Email + HubSpot CRM + Resend |
| `/api/calculator-results` | Benchmark Calculator → Email + HubSpot CRM + Resend |
| `/api/validate-email` | Email validation via mails.so |
| `/api/linkedin-budget` | LinkedIn Budget Calculator → Email + HubSpot CRM + Resend |
| `/api/google-budget` | Google Ads Budget Calculator → Email + HubSpot CRM + Resend |
| `/api/inmail-calculator` | InMail ROI Calculator → Email + HubSpot CRM + Resend |
| `/api/meta-budget` | Meta Budget Calculator → Email + HubSpot CRM + Resend |
| `/api/playbook-download` | Playbook unlock → Email with PDF + HubSpot CRM + Resend |

### Environment Variables (Vercel)

```
RESEND_API_KEY=re_xxx
RESEND_AUDIENCE_ID=xxx
HUBSPOT_ACCESS_TOKEN=pat-na1-xxx
```

---

## Design System

### Colors

```css
:root {
    --accent: #DFFE68;        /* Lime yellow - CTAs, highlights */
    --accent-hover: #C8E85C;
    --black: #1a1a1a;         /* Text, borders */
    --gray: #4a4a4a;          /* Body text */
    --muted: #6b6b6b;         /* Secondary text */
    --light-gray: #f5f5f5;    /* Backgrounds */
    --green: #10B981;         /* Success, "Excellent" */
    --orange: #F59E0B;        /* Warning, "Average" */
    --red: #EF4444;           /* Error, "Poor" */
    --blue: #3B82F6;          /* Info, "Good" */
    --linkedin: #0A66C2;
    --google: #4285F4;
    --meta: #0668E1;
}
```

### Typography

- **Font:** Inter (Google Fonts)
- **Headings:** font-weight: 800, letter-spacing: -0.02em
- **Body:** font-weight: 400

### Components

**Cards:**
```css
.card {
    background: white;
    border: 2px solid var(--black);
    border-radius: 16px;
    box-shadow: 4px 4px 0px 0px var(--black);
}
.card:hover {
    box-shadow: 6px 6px 0px 0px var(--black);
    transform: translate(-2px, -2px);
}
```

**Buttons:**
```css
.btn-primary {
    background: var(--accent);
    border: 2px solid var(--black);
    border-radius: 8px;
    font-weight: 700;
    box-shadow: 4px 4px 0px 0px var(--black);
}
```

---

## Global Header (Required on ALL pages)

```html
<header class="header">
    <div class="header-inner">
        <a href="/" class="logo">
            <img src="/42-logo.png" alt="42 Agency">
        </a>
        <nav class="nav">
            <a href="/assess/">Assess</a>
            <a href="/b2b-benchmarks/">Benchmarks</a>
            <a href="/tools/">Tools</a>
            <a href="/playbooks/">Playbooks</a>
            <a href="https://www.42agency.com/contact-us" target="_blank" class="nav-cta">Contact Us</a>
        </nav>
    </div>
</header>
```

**Header CSS:**
```css
.header {
    border-bottom: 2px solid var(--black);
    padding: 0.75rem 1.5rem;
    background: white;
    position: sticky;
    top: 0;
    z-index: 50;
}
.header-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.logo img { height: 28px; width: auto; }
.nav { display: flex; align-items: center; gap: 0.25rem; }
.nav a {
    padding: 0.5rem 1rem;
    color: var(--gray);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    border-radius: 6px;
    transition: all 0.15s;
}
.nav a:hover { color: var(--black); background: var(--light-gray); }
.nav a.active { color: var(--black); font-weight: 600; background: var(--accent); }
.nav-cta {
    margin-left: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--black);
    color: white !important;
    border-radius: 6px;
    font-weight: 600;
}
@media (max-width: 768px) { .nav { display: none; } }
```

---

## Global Footer (Required on ALL pages)

**5-column structure:**
1. **Brand** - Logo, description, social links
2. **Assess** - All diagnostic tools
3. **Benchmarks** - All benchmark pages + industry sub-links
4. **AI Tools + Resources** - Copilot links + templates
5. **42 Agency** - Main site links

```html
<footer class="footer">
    <div class="footer-inner">
        <div class="footer-grid">
            <!-- Column 1: Brand -->
            <div class="footer-brand">
                <img src="/42-logo.png" alt="42 Agency">
                <p>B2B performance marketing for companies that sell to enterprises.</p>
                <div class="footer-social">
                    <a href="https://linkedin.com/company/42agency" target="_blank">LinkedIn</a>
                    <a href="https://x.com/42aboratory" target="_blank">X</a>
                    <a href="https://www.youtube.com/@Get42Agency" target="_blank">YouTube</a>
                </div>
            </div>

            <!-- Column 2: Assess -->
            <div class="footer-col">
                <h4>Assess</h4>
                <a href="/assessments/hubspot-health/">HubSpot Health Check</a>
                <a href="/assess/calculator/">Benchmark Calculator</a>
                <a href="/linkedin-audit/">LinkedIn Ads Audit</a>
                <a href="/google-ads-audit/">Google Ads Audit</a>
                <a href="/meta-audit/">Meta Ads Audit</a>
                <a href="/hubspot-audit/">HubSpot Audit</a>
            </div>

            <!-- Column 3: Benchmarks -->
            <div class="footer-col">
                <h4>Benchmarks</h4>
                <a href="/b2b-benchmarks/">All B2B Benchmarks</a>
                <a href="/b2b-benchmarks/linkedin-ads-benchmarks/">LinkedIn Ads</a>
                <a href="/b2b-benchmarks/google-ads-benchmarks/">Google Ads</a>
                <a href="/b2b-benchmarks/linkedin-inmail-benchmarks/">InMail Benchmarks</a>
                <a href="/b2b-benchmarks/legal-tech-linkedin-ads/" class="sublink">Legal Tech</a>
                <a href="/b2b-benchmarks/healthcare-tech-linkedin-ads/" class="sublink">Healthcare Tech</a>
                <a href="/b2b-benchmarks/fintech-linkedin-ads/" class="sublink">FinTech</a>
            </div>

            <!-- Column 4: AI Tools + Resources -->
            <div class="footer-col">
                <h4>AI Tools</h4>
                <a href="https://copilot.42agency.com" target="_blank">LinkedIn Ads Copilot</a>
                <a href="https://copilot.42agency.com/linkedin-ads-targeting" target="_blank">Targeting Guide</a>
                <h4 style="margin-top: 1.5rem;">Resources</h4>
                <a href="/zenabm/">ABM Toolkit</a>
                <a href="/mops-funnel/">MOPS Funnel Workbook</a>
                <a href="/exitfive/">Claude Code 101</a>
            </div>

            <!-- Column 5: 42 Agency -->
            <div class="footer-col">
                <h4>42 Agency</h4>
                <a href="https://42agency.com" target="_blank">Website</a>
                <a href="https://www.42agency.com/contact-us" target="_blank">Contact Us</a>
                <a href="https://42agency.com/case-studies" target="_blank">Case Studies</a>
                <a href="https://42slash.com" target="_blank">42/ Essays</a>
                <a href="https://42agency.com/careers" target="_blank">Careers</a>
            </div>
        </div>

        <div class="footer-bottom">
            <p>© 2026 42 Agency. All rights reserved.</p>
            <p><a href="https://42agency.com/privacy">Privacy</a> · <a href="https://42agency.com/terms">Terms</a></p>
        </div>
    </div>
</footer>
```

**Footer CSS:**
```css
.footer {
    border-top: 2px solid var(--black);
    background: var(--black);
    padding: 4rem 1.5rem 2rem;
}
.footer-inner { max-width: 1200px; margin: 0 auto; }
.footer-grid {
    display: grid;
    grid-template-columns: 1.5fr repeat(4, 1fr);
    gap: 3rem;
    padding-bottom: 3rem;
    border-bottom: 1px solid #333;
}
.footer-brand img { height: 24px; filter: brightness(0) invert(1); margin-bottom: 1rem; }
.footer-brand p { font-size: 0.85rem; color: #999; line-height: 1.6; }
.footer-col h4 {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 1rem;
    color: var(--accent);
}
.footer-col a {
    display: block;
    color: #999;
    text-decoration: none;
    font-size: 0.85rem;
    margin-bottom: 0.6rem;
}
.footer-col a:hover { color: white; }
.footer-col .sublink { padding-left: 0.75rem; font-size: 0.8rem; color: #666; }
.footer-bottom {
    padding-top: 2rem;
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #666;
}
@media (max-width: 900px) { .footer-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 500px) { .footer-grid { grid-template-columns: 1fr; } }
```

---

## Lead Capture Flow (Interactive Tools)

For interactive assessments and calculators, use this flow:

### 1. Multi-Step Form → Email Gate → Results + LinkedIn Share

```
Step 1: User Input (questions/metrics)
    ↓
Step 2: Email Gate (email only - minimal friction)
    ↓
Step 3: Show Results + "Share to LinkedIn" button
    ↓
Background: API call to /api/[tool]-results
    → Send email via Resend
    → Push to HubSpot CRM
    → Add to Resend Audience
```

### 2. API Endpoint Pattern (Email-Only)

```javascript
// /api/[tool]-results.js
export const config = { runtime: 'edge' };

export default async function handler(request) {
    const { email, result } = await request.json();

    // 1. Send results email via Resend
    await sendResultsEmail(email, result);

    // 2. Push to HubSpot CRM with tool-specific properties
    await pushToHubSpot(email, result);

    // 3. Add to Resend Audience for future marketing
    await pushToResendAudience(email);

    return Response.json({ success: true });
}
```

### 3. LinkedIn Share Button (Downloads PNG + Copies Text + Opens LinkedIn)

Include html-to-image CDN:
```html
<script src="https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.min.js"></script>
```

Share to LinkedIn function (downloads image, copies post text, opens LinkedIn):
```javascript
async function shareToLinkedIn() {
    const card = document.getElementById('shareableCard');

    // 1. Generate and download PNG
    const dataUrl = await htmlToImage.toPng(card, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff'
    });
    const link = document.createElement('a');
    link.download = `[tool-name]-results.png`;
    link.href = dataUrl;
    link.click();

    // 2. Copy post text to clipboard
    const postText = `Just [took assessment/ran calculator]...

Score: XX/100

[Brief insight]

Try it yourself: intel.42agency.com/[tool-path]`;

    await navigator.clipboard.writeText(postText);

    // 3. Show toast notification
    const toast = document.getElementById('toast');
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 5000);

    // 4. Open LinkedIn feed
    setTimeout(() => {
        window.open('https://www.linkedin.com/feed/', '_blank');
    }, 500);
}
```

Toast HTML (add to results section):
```html
<div id="toast" style="display: none; position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); background: #1a1a1a; color: white; padding: 1rem 1.5rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 1000; max-width: 400px; text-align: center;">
    <div style="font-weight: 700; margin-bottom: 0.25rem;">Image downloaded, text copied!</div>
    <div style="font-size: 0.85rem; color: #ccc;">Paste the text and attach your image to post.</div>
</div>
```

---

## Creating New Pages Checklist

### Required Elements

- [ ] Use global header with nav (copy from `/assess/index.html`)
- [ ] Use comprehensive footer (copy from `/assess/index.html`)
- [ ] Include GTM snippet in `<head>`
- [ ] Include HubSpot tracking script in `<head>`
- [ ] Add page to appropriate nav section (Assess, Benchmarks, Resources)
- [ ] Update footer links if adding new category

### For Gated Downloads

- [ ] Form has `id="downloadForm"` and `class="email-form"`
- [ ] Include `/js/email-validation.js` before `</body>`
- [ ] Submit to HubSpot Collected Forms API
- [ ] Test email validation blocks disposable emails

### For Interactive Tools (Assessments/Calculators)

- [ ] Email-only gate (no name/company required)
- [ ] Create `/api/[tool]-results.js` endpoint
- [ ] Send results email via Resend
- [ ] Push to HubSpot CRM with tool-specific properties
- [ ] Push to Resend Audience
- [ ] Add "Share to LinkedIn" button (downloads PNG + copies text + opens LinkedIn)
- [ ] Include toast notification for share confirmation
- [ ] Track GTM events for funnel analysis

---

## HubSpot Properties

### Assessment Tools
| Property | Type | Used By |
|----------|------|---------|
| `hubspot_health_score` | Number | HubSpot Assessment |
| `hubspot_health_grade` | Dropdown (A-F) | HubSpot Assessment |
| `hubspot_health_assessment_date` | Date | HubSpot Assessment |
| `hubspot_health_critical_issues` | Number | HubSpot Assessment |
| `hubspot_health_weakest_category` | Text | HubSpot Assessment |

### Calculator Tools
| Property | Type | Used By |
|----------|------|---------|
| `benchmark_calculator_score` | Number | Benchmark Calculator |
| `benchmark_calculator_industry` | Dropdown | Benchmark Calculator |
| `benchmark_calculator_date` | Date | Benchmark Calculator |
| `benchmark_calculator_weakest_metric` | Text | Benchmark Calculator |

---

## Email Validation

**API:** mails.so
**Endpoint:** `/api/validate-email?email=...`

Include on all gated pages:
```html
<script src="/js/email-validation.js"></script>
```

| Result | Action |
|--------|--------|
| `deliverable` | Allow |
| `catch_all` | Allow |
| `unknown` | Allow (fail open) |
| `is_disposable: true` | Block |
| `invalid` | Block |
| `undeliverable` | Block |

---

## File Structure

```
intel-pages/
├── api/
│   ├── assessment-results.js    # HubSpot Assessment API
│   ├── calculator-results.js    # Benchmark Calculator API
│   ├── linkedin-budget.js       # LinkedIn Budget Calculator API
│   ├── google-budget.js         # Google Ads Budget Calculator API
│   ├── inmail-calculator.js     # InMail ROI Calculator API
│   ├── meta-budget.js           # Meta Budget Calculator API
│   ├── playbook-download.js     # Playbook unlock + email API
│   ├── share.js                 # LinkedIn share OG meta endpoint
│   └── validate-email.js        # Email validation proxy
├── scripts/
│   └── generate-playbook-pdfs.js # Puppeteer PDF generator
├── js/
│   └── email-validation.js      # Client-side validation
├── tools/
│   ├── index.html               # Tools hub
│   ├── company-sampler/         # B2B Company Sample Builder
│   ├── company-resolver/        # Company Name to LinkedIn Resolver
│   ├── linkedin-budget-calculator/
│   ├── linkedin-inmail-calculator/
│   ├── google-ads-budget-calculator/
│   └── meta-budget-calculator/
├── playbooks/
│   ├── index.html               # Playbooks hub
│   ├── closed-lost-revival/     # Soft-gated playbook + PDF
│   ├── lead-scoring-framework/  # Soft-gated playbook + PDF
│   ├── lead-reengagement/       # Soft-gated playbook + PDF
│   ├── intent-signals/          # Soft-gated playbook + PDF
│   └── abm-enrichment/          # Soft-gated playbook + PDF
├── assess/
│   ├── index.html               # Assessments hub
│   └── calculator/index.html    # Benchmark Calculator
├── assessments/
│   ├── index.html               # Legacy assessments index
│   └── hubspot-health/index.html
├── b2b-benchmarks/
│   ├── index.html               # Benchmarks hub
│   ├── calculator/index.html    # Redirects to /assess/calculator/
│   └── [industry]-linkedin-ads/ # pSEO pages
├── [audit-templates]/           # LinkedIn, Google, Meta, HubSpot
├── vercel.json                  # Redirects + headers
├── 42-logo.png                  # Horizontal logo
└── CLAUDE.md                    # This file
```

---

## Related Properties

- **Copilot:** https://copilot.42agency.com (separate repo/deployment)
- **Main Site:** https://42agency.com
- **Essays:** https://42slash.com

---

---

## LinkedIn Share System (Feb 21, 2026)

### How It Works
1. User completes assessment → enters email only → sees results
2. Clicks "Share to LinkedIn" button
3. Opens LinkedIn share dialog with auto-generated preview
4. User just clicks "Post"

### Technical Flow
```
User clicks Share → generateShareUrl() encodes results in base64 →
Opens linkedin.com/sharing/share-offsite/?url=[encoded-url] →
LinkedIn scrapes /api/share?d=[data]&t=[tool] →
Edge Function returns HTML with dynamic OG meta tags →
LinkedIn shows preview with actual score in title
```

### Key Files
- `/api/share.js` - Dynamic OG meta tag endpoint
- `/og-share.png` - Static branded image for LinkedIn previews
- Assessment pages have `shareToLinkedIn()` function

### Data Encoded in Share URL
**Calculator:** `{ score, industry }`
**HubSpot:** `{ percentage, grade, criticalIssues, weakestCategory }`

### OG Tags Generated
```html
<meta property="og:title" content="B2B Benchmark Score: 72/100">
<meta property="og:description" content="SaaS - See how your paid media performance compares...">
<meta property="og:image" content="https://intel.42agency.com/og-share.png">
```

---

## Budget Calculators (Feb 21, 2026)

### LinkedIn Budget Calculator
**URL:** `/tools/linkedin-budget-calculator/`
**API:** `/api/linkedin-budget.js`

**Features:**
- ICP parsing with Claude → LinkedIn Marketing API for pricing
- Chart.js graphs: Budget vs Reach/Clicks/Leads/Views (4 charts)
- Gated results: Only audience size visible, everything else blurred until email entered
- Floating sticky CTA for email unlock
- Max reach: 40% of audience per month
- Budget tiers: Test (5%), Growth (15%), Scale (40%)

**User Flow:**
1. Enter ICP → Click "Get Estimates"
2. See preview (audience size visible, details blurred)
3. Enter email in floating gate → Unlock full results
4. HubSpot contact created, email sent via Resend

### Google Ads Budget Calculator
**URL:** `/tools/google-ads-budget-calculator/`
**API:** `/api/google-budget.js`

**Features:**
- Keyword generation with Claude → DataForSEO for CPCs
- Chart.js graphs: Budget Tiers bar chart + CPC Distribution donut
- Gated results: Only stats visible (keyword count, searches, avg CPC)
- Floating sticky CTA for email unlock
- Budget tiers: Min (30%), Ideal (50%), Aggressive (100%)

**User Flow:**
1. Enter product/service → Click "Get Keywords & CPCs"
2. See preview (stats visible, keywords/budgets blurred)
3. Enter email in floating gate → Unlock full results
4. HubSpot contact created, email sent via Resend

### HubSpot Properties (must exist in HubSpot)

**LinkedIn:**
- `linkedin_budget_icp` (text) - ICP description
- `linkedin_budget_audience` (text) - Audience size
- `linkedin_budget_cpm` (text) - Awareness CPM
- `linkedin_budget_date` (text) - Calculation date

**Google:**
- `google_budget_target` (text) - Product/service description
- `google_budget_keywords` (text) - Keyword count
- `google_budget_avg_cpc` (text) - Average CPC
- `google_budget_date` (text) - Calculation date

### Technical Notes
- APIs use Edge Functions (`runtime: 'edge'`)
- Must `await Promise.all()` for background tasks (HubSpot, Resend) or they get cut off
- Preview calls use placeholder email, unlock calls use real email
- Chart.js loaded via CDN: `https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js`

---

## Playbooks (Soft-Gated Content) - Feb 21, 2026

### Overview
B2B marketing playbooks with soft-gated content model: 30% visible ungated, 70% blurred behind email gate.

**URL:** `/playbooks/`
**API:** `/api/playbook-download.js`

### Available Playbooks

| Playbook | Badge Color | Ungated Content | Gated Content |
|----------|-------------|-----------------|---------------|
| **Closed Lost Revival** | Orange | Why closed-lost = gold + benchmarks | Timing triggers, sequences, champion tracking, checklist |
| **Lead Scoring Framework** | Blue | Why scoring fails + two-axis model | ICP scoring, engagement scoring, decay logic, MQL calibration |
| **Lead Re-Engagement** | Purple | Hidden cost + segmentation matrix | Multi-channel sequence, messaging frameworks, sunset policy |
| **Intent Signals** | Red | Three types + signal taxonomy | First-party setup, vendor comparison, intent-to-action |
| **ABM Enrichment** | Teal | Why data quality matters | Enrichment framework, buying committees, Clay workflows, vendor sentiment |

### Soft-Gate Implementation

**CSS Classes:**
```css
.gated-wrapper { position: relative; }
.gated-content { filter: blur(5px); pointer-events: none; user-select: none; }
.gated-content.unlocked { filter: none; pointer-events: auto; user-select: auto; }
.gate-overlay { /* gradient overlay with email form */ }
.gate-overlay.hidden { display: none; }
```

**localStorage Persistence:**
```javascript
// On page load
if (localStorage.getItem('playbook_unlocked_[slug]')) {
    document.getElementById('gatedContent').classList.add('unlocked');
    document.getElementById('gateOverlay').classList.add('hidden');
    document.getElementById('downloadBanner').classList.add('visible');
}

// On unlock
localStorage.setItem('playbook_unlocked_[slug]', 'true');
```

### PDF Generation

**Script:** `/scripts/generate-playbook-pdfs.js`
**Requires:** Puppeteer (`npm install puppeteer`)

```bash
cd /Users/42agency/intel-pages
node scripts/generate-playbook-pdfs.js
```

Generates PDFs to: `/playbooks/[slug]/[slug]-playbook.pdf`

**PDF Structure:**
- Cover page (dark background, lime accent badge)
- Content sections with tables, callouts, checklists
- Footer with 42 Agency branding

### ABM Vendor Sentiment (included in ABM Enrichment)

**Positive Vendors:** Seam AI, UserGems, Mutiny, Clay, Warmly, Common Room
**Negative/Mixed:** 6sense, Demandbase, Terminus, RollWorks

Key insight: Best-of-breed point solutions winning over monolithic ABM platforms.

### User Flow

```
1. User sees hero + stats + 30% content (ungated)
2. Scrolls down → sees blurred content with gradient overlay
3. Enters email in gate card → clicks "Unlock Full Playbook"
4. API call to /api/playbook-download
   → Sends email via Resend with PDF attachment
   → Pushes contact to HubSpot CRM
   → Adds to Resend Audience
5. localStorage set → content revealed → download banner appears
6. Returning visitors see full content immediately (localStorage check)
```

### HubSpot Properties

| Property | Type | Description |
|----------|------|-------------|
| `playbook_downloaded` | Text | Comma-separated list of playbook slugs |
| `playbook_download_date` | Date | Most recent download date |

---

---

## HubSpot CRM Health Assessment (Feb 2026)

**URL:** `/assessments/hubspot-health/`
**API:** `/api/assessment-results.js`

### Format (Refactored Feb 22, 2026)
- **20 questions total** (reduced from 42)
- **Multi-option answers** (3-4 options per question with partial credit scoring)
- **Weighted scoring** - Questions have weights 1-3 based on impact

### Question Structure
Each question has:
```javascript
{
  id: "rd-1",
  text: "Question text here",
  weight: 3,  // 1 = Nice to have, 2 = Important, 3 = Critical
  options: [
    { label: "Full answer", score: 3, desc: "Description of what this means" },
    { label: "Partial answer", score: 2, desc: "Description" },
    { label: "Minimal answer", score: 1, desc: "Description" },
    { label: "Not at all", score: 0, desc: "Description" }
  ]
}
```

### 7 Categories (Priority Order)

| # | Category | Questions | Focus |
|---|----------|-----------|-------|
| 1 | **Reporting & Dashboards** | 3 | Pipeline dashboards, revenue reporting, cross-system data |
| 2 | **Lifecycle Management** | 3 | Automated lifecycle stages, definitions, SLAs |
| 3 | **Attribution & Tracking** | 3 | Multi-touch attribution, UTM parameters, offline tracking |
| 4 | **System Integrations** | 3 | Salesforce sync, outbound tools (Outreach/Salesloft/Apollo), data enrichment |
| 5 | **Data Hygiene** | 3 | Deduplication, data standardization, decay management |
| 6 | **Lead Scoring** | 2 | Scoring model, threshold calibration |
| 7 | **Sales & Marketing Alignment** | 3 | Lead routing, SLAs, feedback loops |

### Scoring System

**Option Colors:**
- Green (`#10B981`) - Full credit (score = weight)
- Orange (`#F59E0B`) - Partial credit (mid-range scores)
- Red (`#EF4444`) - No credit (score = 0)

**Grade Thresholds:**
| Grade | Percentage | Status |
|-------|------------|--------|
| A | 90-100% | Excellent |
| B | 75-89% | Good |
| C | 60-74% | Average |
| D | 40-59% | Below Average |
| F | 0-39% | Critical |

### Category Scoring
Each category shows individual percentage with status indicator:
- **Critical** (< 50%) - Red badge
- **Needs Work** (50-74%) - Orange badge
- **Good** (≥ 75%) - Green badge

### User Flow
```
1. Landing page → Click "Start Assessment"
2. Answer 20 questions across 7 categories
3. Progress bar shows current position
4. After all questions → Email gate (required)
5. Enter email → See full results
6. Results show: Overall grade, percentage, category breakdown
7. Option to "Share to LinkedIn"
```

### HubSpot CRM Properties
| Property | Type | Description |
|----------|------|-------------|
| `hubspot_health_score` | Number | Total percentage (0-100) |
| `hubspot_health_grade` | Dropdown | A, B, C, D, F |
| `hubspot_health_assessment_date` | Date | Completion date |
| `hubspot_health_critical_issues` | Number | Count of categories < 50% |
| `hubspot_health_weakest_category` | Text | Lowest scoring category name |

---

*Last updated: February 22, 2026 - Refactored HubSpot Assessment to 20 questions with multi-option answers*
