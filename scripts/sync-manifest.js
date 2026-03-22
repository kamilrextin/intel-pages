#!/usr/bin/env node
/**
 * Sync Manifest with Local Files
 *
 * Scans the intel-pages directory and ensures all pages are registered
 * in pages-manifest.json. Run this periodically to catch untracked pages.
 *
 * Usage:
 *   node scripts/sync-manifest.js           # Show what would be added (dry-run)
 *   node scripts/sync-manifest.js --write   # Actually update manifest
 *   node scripts/sync-manifest.js --prune   # Remove pages that don't exist locally
 */

const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, '..', 'pages-manifest.json');
const ROOT_DIR = path.join(__dirname, '..');

// Directories to skip
const SKIP_DIRS = [
    'node_modules', '.git', '.vercel', '.github', 'scripts', 'api', 'js',
    'og-templates', 'email-drafts'
];

// Files that indicate a valid page
const PAGE_INDICATORS = ['index.html'];

function getAllLocalPages() {
    const pages = [];

    function scanDir(dir, prefix = '') {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            if (!entry.isDirectory()) continue;
            if (SKIP_DIRS.includes(entry.name)) continue;
            if (entry.name.startsWith('.')) continue;

            const fullPath = path.join(dir, entry.name);
            const relativePath = prefix + '/' + entry.name;

            // Check if this directory is a page (has index.html)
            const hasIndex = PAGE_INDICATORS.some(file =>
                fs.existsSync(path.join(fullPath, file))
            );

            if (hasIndex) {
                pages.push(relativePath + '/');
            }

            // Recurse into subdirectories
            scanDir(fullPath, relativePath);
        }
    }

    scanDir(ROOT_DIR);
    return pages.sort();
}

function getAllManifestPages(manifest) {
    const pages = [];
    for (const category of Object.values(manifest.categories)) {
        pages.push(...category.pages);
    }
    return pages.sort();
}

function detectCategory(pagePath) {
    const slug = pagePath.replace(/^\/|\/$/g, '');

    if (slug.startsWith('tools/')) return 'tools';
    if (slug.startsWith('playbooks/')) return 'playbooks';
    if (slug.startsWith('b2b-benchmarks/')) return 'benchmarks';
    if (slug.startsWith('assessments/')) return 'assessments';
    if (slug.startsWith('assess/')) return 'assessments';
    if (slug.startsWith('aeo/')) return 'aeo';
    if (slug.startsWith('reports/')) return 'reports';
    if (slug.includes('-audit')) return 'audits';
    if (slug.includes('-sentiment')) return 'sentiment_analysis';
    if (slug.startsWith('zenabm') || slug.startsWith('abm-')) return 'abm';
    if (slug.startsWith('mops-') || slug.startsWith('hubspot-salesforce')) return 'mops';
    if (slug.startsWith('linkedin-targeting')) return 'linkedin_targeting';
    if (slug.startsWith('claude-code') || slug.startsWith('exitfive') || slug.endsWith('-ci')) return 'agents';
    if (slug === 'ci-agent') return 'agents';

    // Test pages
    if (slug.includes('test') || slug.includes('temp')) return 'test';

    // Default to client_intel
    return 'client_intel';
}

function syncManifest(options = {}) {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));

    const localPages = getAllLocalPages();
    const manifestPages = getAllManifestPages(manifest);

    // Find untracked pages (in local but not in manifest)
    const untracked = localPages.filter(p => !manifestPages.includes(p));

    // Find missing pages (in manifest but not local)
    const missing = manifestPages.filter(p => !localPages.includes(p));

    console.log('\n📊 Intel Pages Sync Report');
    console.log('─'.repeat(50));
    console.log(`Local pages:    ${localPages.length}`);
    console.log(`Manifest pages: ${manifestPages.length}`);
    console.log('─'.repeat(50));

    if (untracked.length > 0) {
        console.log(`\n⚠️  Untracked pages (${untracked.length}):`);
        for (const page of untracked) {
            const category = detectCategory(page);
            console.log(`   ${page} → ${category}`);
        }

        if (options.write) {
            console.log('\n📝 Adding to manifest...');
            for (const page of untracked) {
                const category = detectCategory(page);
                if (!manifest.categories[category]) {
                    manifest.categories[category] = {
                        description: `${category} pages`,
                        pages: []
                    };
                }
                manifest.categories[category].pages.push(page);
                console.log(`   ✓ Added: ${page} → ${category}`);
            }

            // Sort all category pages
            for (const cat of Object.values(manifest.categories)) {
                cat.pages.sort();
            }
            manifest.lastUpdated = new Date().toISOString().split('T')[0];

            fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
            console.log(`\n✅ Manifest updated with ${untracked.length} new pages`);
        } else {
            console.log('\n   Run with --write to add these pages to manifest');
        }
    } else {
        console.log('\n✅ No untracked pages');
    }

    if (missing.length > 0) {
        console.log(`\n❌ Missing pages (in manifest but not local) (${missing.length}):`);
        for (const page of missing) {
            console.log(`   ${page}`);
        }

        if (options.prune) {
            console.log('\n🗑️  Removing from manifest...');
            for (const category of Object.values(manifest.categories)) {
                category.pages = category.pages.filter(p => !missing.includes(p));
            }
            manifest.lastUpdated = new Date().toISOString().split('T')[0];

            fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
            console.log(`\n✅ Removed ${missing.length} missing pages from manifest`);
        } else {
            console.log('\n   Run with --prune to remove these from manifest');
        }
    } else {
        console.log('✅ No missing pages');
    }

    console.log('');

    return {
        local: localPages.length,
        manifest: manifestPages.length,
        untracked: untracked.length,
        missing: missing.length
    };
}

// Parse CLI args
const args = process.argv.slice(2);
const options = {
    write: args.includes('--write'),
    prune: args.includes('--prune')
};

syncManifest(options);
