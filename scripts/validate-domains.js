#!/usr/bin/env node
/**
 * Domain Validation Script for Intel Pages
 *
 * Validates all domains in an intel page before deployment.
 * Checks DNS resolution and HTTP response.
 *
 * Usage:
 *   node scripts/validate-domains.js <path-to-html>
 *   node scripts/validate-domains.js envera/index.html
 *   node scripts/validate-domains.js --domains domain1.com,domain2.org
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');
const http = require('http');
const dns = require('dns').promises;

// ANSI colors
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

async function checkDNS(domain) {
    try {
        const addresses = await dns.resolve4(domain);
        return { valid: true, addresses };
    } catch (err) {
        if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
            return { valid: false, error: 'NXDOMAIN' };
        }
        return { valid: false, error: err.code || err.message };
    }
}

async function checkHTTP(domain, timeout = 5000) {
    return new Promise((resolve) => {
        const url = `https://${domain}`;
        const req = https.get(url, { timeout }, (res) => {
            resolve({ valid: true, status: res.statusCode, redirect: res.headers.location });
        });

        req.on('error', (err) => {
            // Try HTTP if HTTPS fails
            const httpReq = http.get(`http://${domain}`, { timeout }, (res) => {
                resolve({ valid: true, status: res.statusCode, redirect: res.headers.location, protocol: 'http' });
            });
            httpReq.on('error', () => {
                resolve({ valid: false, error: err.code || err.message });
            });
            httpReq.on('timeout', () => {
                httpReq.destroy();
                resolve({ valid: false, error: 'TIMEOUT' });
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({ valid: false, error: 'TIMEOUT' });
        });
    });
}

function extractDomainsFromHTML(htmlPath) {
    const content = fs.readFileSync(htmlPath, 'utf8');

    // Match domain patterns in the HTML (looking for patterns like "domain.com • Location")
    const domainPattern = /([a-zA-Z0-9][-a-zA-Z0-9]*\.)+[a-zA-Z]{2,}(?=\s*[•·]|\s*<)/g;
    const matches = content.match(domainPattern) || [];

    // Filter out common false positives
    const excludePatterns = [
        /fonts\.googleapis\.com/,
        /fonts\.gstatic\.com/,
        /cdn\.tailwindcss\.com/,
        /42agency\.com/,
        /vercel\.app/,
        /linkedin\.com/,
        /twitter\.com/,
        /facebook\.com/,
        /youtube\.com/,
        /intel\.42agency\.com/,
        /copilot\.42agency\.com/,
    ];

    const domains = [...new Set(matches)].filter(domain => {
        return !excludePatterns.some(pattern => pattern.test(domain));
    });

    return domains;
}

async function validateDomain(domain) {
    const result = {
        domain,
        dns: null,
        http: null,
        status: 'unknown'
    };

    // Check DNS first
    result.dns = await checkDNS(domain);

    if (!result.dns.valid) {
        result.status = 'invalid';
        result.reason = `DNS: ${result.dns.error}`;
        return result;
    }

    // Check HTTP
    result.http = await checkHTTP(domain);

    if (!result.http.valid) {
        result.status = 'unreachable';
        result.reason = `HTTP: ${result.http.error}`;
        return result;
    }

    if (result.http.status >= 400) {
        result.status = 'error';
        result.reason = `HTTP ${result.http.status}`;
        return result;
    }

    result.status = 'valid';
    return result;
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log(`${BOLD}Usage:${RESET}`);
        console.log('  node scripts/validate-domains.js <path-to-html>');
        console.log('  node scripts/validate-domains.js --domains domain1.com,domain2.org');
        console.log('');
        console.log(`${BOLD}Examples:${RESET}`);
        console.log('  node scripts/validate-domains.js envera/index.html');
        console.log('  node scripts/validate-domains.js --domains keystonepacific.com,actionpm.com');
        process.exit(1);
    }

    let domains = [];

    if (args[0] === '--domains') {
        domains = args[1].split(',').map(d => d.trim());
    } else {
        const htmlPath = path.resolve(process.cwd(), args[0]);
        if (!fs.existsSync(htmlPath)) {
            console.error(`${RED}Error: File not found: ${htmlPath}${RESET}`);
            process.exit(1);
        }
        console.log(`${CYAN}Extracting domains from: ${htmlPath}${RESET}\n`);
        domains = extractDomainsFromHTML(htmlPath);
    }

    if (domains.length === 0) {
        console.log(`${YELLOW}No domains found to validate.${RESET}`);
        process.exit(0);
    }

    console.log(`${BOLD}Validating ${domains.length} domains...${RESET}\n`);

    const results = {
        valid: [],
        invalid: [],
        unreachable: [],
        error: []
    };

    for (const domain of domains) {
        process.stdout.write(`  Checking ${domain}... `);
        const result = await validateDomain(domain);

        results[result.status === 'valid' ? 'valid' : result.status].push(result);

        if (result.status === 'valid') {
            console.log(`${GREEN}✓${RESET}`);
        } else if (result.status === 'invalid') {
            console.log(`${RED}✗ ${result.reason}${RESET}`);
        } else if (result.status === 'unreachable') {
            console.log(`${YELLOW}⚠ ${result.reason}${RESET}`);
        } else {
            console.log(`${YELLOW}⚠ ${result.reason}${RESET}`);
        }
    }

    // Summary
    console.log(`\n${BOLD}Summary:${RESET}`);
    console.log(`  ${GREEN}Valid:${RESET} ${results.valid.length}`);

    if (results.invalid.length > 0) {
        console.log(`  ${RED}Invalid (NXDOMAIN):${RESET} ${results.invalid.length}`);
        results.invalid.forEach(r => {
            console.log(`    ${RED}✗${RESET} ${r.domain} - ${r.reason}`);
        });
    }

    if (results.unreachable.length > 0) {
        console.log(`  ${YELLOW}Unreachable:${RESET} ${results.unreachable.length}`);
        results.unreachable.forEach(r => {
            console.log(`    ${YELLOW}⚠${RESET} ${r.domain} - ${r.reason}`);
        });
    }

    if (results.error.length > 0) {
        console.log(`  ${YELLOW}HTTP Errors:${RESET} ${results.error.length}`);
        results.error.forEach(r => {
            console.log(`    ${YELLOW}⚠${RESET} ${r.domain} - ${r.reason}`);
        });
    }

    // Exit with error code if any invalid domains
    if (results.invalid.length > 0) {
        console.log(`\n${RED}${BOLD}FAILED:${RESET} ${results.invalid.length} invalid domain(s) found.`);
        console.log(`${YELLOW}Remove or fix these domains before deploying.${RESET}`);
        process.exit(1);
    }

    if (results.unreachable.length > 0 || results.error.length > 0) {
        console.log(`\n${YELLOW}${BOLD}WARNING:${RESET} Some domains may have issues. Review before deploying.`);
        process.exit(0);
    }

    console.log(`\n${GREEN}${BOLD}All domains validated successfully!${RESET}`);
    process.exit(0);
}

main().catch(err => {
    console.error(`${RED}Error: ${err.message}${RESET}`);
    process.exit(1);
});
