#!/usr/bin/env node
/**
 * Register Intel Page
 *
 * Automatically adds a new page to pages-manifest.json and commits to git.
 * Call this after creating a new intel page to ensure it stays tracked.
 *
 * Usage:
 *   node scripts/register-page.js /flexor-030d27/
 *   node scripts/register-page.js flexor-030d27     # Leading/trailing slashes optional
 *   node scripts/register-page.js flexor-030d27 --category client_intel
 *   node scripts/register-page.js flexor-030d27 --commit  # Also git commit
 *   node scripts/register-page.js flexor-030d27 --deploy  # Commit + push + vercel deploy
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MANIFEST_PATH = path.join(__dirname, '..', 'pages-manifest.json');
const ROOT_DIR = path.join(__dirname, '..');

function normalizePath(pagePath) {
    // Ensure path starts and ends with /
    let normalized = pagePath.trim();
    if (!normalized.startsWith('/')) normalized = '/' + normalized;
    if (!normalized.endsWith('/')) normalized = normalized + '/';
    return normalized;
}

function detectCategory(pagePath) {
    // Auto-detect category based on path patterns
    const slug = pagePath.replace(/^\/|\/$/g, '');

    // Check for existing category prefixes
    if (slug.startsWith('tools/')) return 'tools';
    if (slug.startsWith('playbooks/')) return 'playbooks';
    if (slug.startsWith('b2b-benchmarks/')) return 'benchmarks';
    if (slug.startsWith('assessments/')) return 'assessments';
    if (slug.startsWith('aeo/')) return 'aeo';
    if (slug.startsWith('reports/')) return 'reports';
    if (slug.includes('-audit')) return 'audits';
    if (slug.includes('-sentiment')) return 'sentiment_analysis';
    if (slug.startsWith('zenabm/') || slug.startsWith('abm-')) return 'abm';
    if (slug.startsWith('mops-') || slug.startsWith('hubspot-salesforce')) return 'mops';
    if (slug.startsWith('linkedin-targeting/')) return 'linkedin_targeting';
    if (slug.startsWith('claude-code') || slug.startsWith('exitfive') || slug.includes('-ci')) return 'agents';

    // Default: client_intel for AI SDR generated pages (most common)
    // Pattern: company-hexcode or company-conquest
    if (/^[a-z0-9-]+-[a-z0-9]{6}$/.test(slug) || slug.includes('-conquest')) {
        return 'client_intel';
    }

    return 'client_intel'; // Default
}

function pageExistsLocally(pagePath) {
    const slug = pagePath.replace(/^\/|\/$/g, '');
    const dirPath = path.join(ROOT_DIR, slug);
    const indexPath = path.join(dirPath, 'index.html');
    return fs.existsSync(dirPath) && fs.existsSync(indexPath);
}

function registerPage(pagePath, options = {}) {
    const normalizedPath = normalizePath(pagePath);
    const category = options.category || detectCategory(normalizedPath);

    // Load manifest
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));

    // Check if page already registered
    const categoryPages = manifest.categories[category]?.pages || [];
    if (categoryPages.includes(normalizedPath)) {
        console.log(`✓ Page already registered: ${normalizedPath} (${category})`);
        return { alreadyExists: true, path: normalizedPath, category };
    }

    // Verify page exists locally
    if (!pageExistsLocally(normalizedPath)) {
        console.error(`✗ Page does not exist locally: ${normalizedPath}`);
        console.error(`  Expected: ${path.join(ROOT_DIR, normalizedPath.replace(/^\/|\/$/g, ''), 'index.html')}`);
        return { error: 'Page not found locally' };
    }

    // Add to manifest
    if (!manifest.categories[category]) {
        manifest.categories[category] = {
            description: `${category} pages`,
            pages: []
        };
    }
    manifest.categories[category].pages.push(normalizedPath);
    manifest.categories[category].pages.sort(); // Keep sorted
    manifest.lastUpdated = new Date().toISOString().split('T')[0];

    // Write manifest
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
    console.log(`✓ Registered: ${normalizedPath} → ${category}`);

    return { success: true, path: normalizedPath, category };
}

function commitAndDeploy(pagePath, options = {}) {
    const slug = pagePath.replace(/^\/|\/$/g, '');

    try {
        // Add the page directory and manifest
        execSync(`git add ${slug}/ pages-manifest.json`, { cwd: ROOT_DIR, stdio: 'pipe' });

        // Commit
        const commitMsg = `Add intel page: ${slug}`;
        execSync(`git commit -m "${commitMsg}"`, { cwd: ROOT_DIR, stdio: 'pipe' });
        console.log(`✓ Committed: ${commitMsg}`);

        if (options.deploy) {
            // Push to origin
            execSync('git push origin main', { cwd: ROOT_DIR, stdio: 'pipe' });
            console.log('✓ Pushed to origin/main');

            // Vercel auto-deploys on push, but we can force it
            console.log('✓ Vercel will auto-deploy from git push');
        }

        return { success: true };
    } catch (error) {
        console.error('Git error:', error.message);
        return { error: error.message };
    }
}

// Parse CLI args
const args = process.argv.slice(2);
if (args.length === 0 || args[0] === '--help') {
    console.log(`
Intel Page Registration

Usage:
  node scripts/register-page.js <page-path> [options]

Options:
  --category <name>  Specify category (auto-detected if not provided)
  --commit           Git commit the page and manifest
  --deploy           Commit + push + trigger Vercel deploy

Examples:
  node scripts/register-page.js flexor-030d27
  node scripts/register-page.js /luminai-conquest/ --category client_intel
  node scripts/register-page.js mycompany-abc123 --deploy
`);
    process.exit(0);
}

const pagePath = args[0];
const options = {
    category: null,
    commit: args.includes('--commit'),
    deploy: args.includes('--deploy')
};

const categoryIndex = args.indexOf('--category');
if (categoryIndex !== -1 && args[categoryIndex + 1]) {
    options.category = args[categoryIndex + 1];
}

// Register the page
const result = registerPage(pagePath, options);

if (result.success || result.alreadyExists) {
    if (options.commit || options.deploy) {
        commitAndDeploy(result.path, options);
    }
} else {
    process.exit(1);
}
