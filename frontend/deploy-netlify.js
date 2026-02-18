#!/usr/bin/env node
/**
 * Netlify Deploy Script - Direct API deployment (no netlify-cli needed)
 * 
 * Usage:
 *   node deploy-netlify.js --token YOUR_TOKEN
 *   OR set NETLIFY_AUTH_TOKEN environment variable
 * 
 * Get token from: https://app.netlify.com/user/applications#personal-access-tokens
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

const SITE_NAME = 'got-transportation';
const DIST_DIR = path.join(__dirname, 'dist');

// Parse CLI args
const args = process.argv.slice(2);
let token = process.env.NETLIFY_AUTH_TOKEN;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--token' && args[i + 1]) token = args[i + 1];
}

if (!token) {
  console.error('\x1b[31mERROR: No Netlify token provided.\x1b[0m');
  console.log('\nTo deploy, you need a Netlify Personal Access Token:');
  console.log('1. Go to https://app.netlify.com/user/applications#personal-access-tokens');
  console.log('2. Click "New access token"');
  console.log('3. Run: node deploy-netlify.js --token YOUR_TOKEN');
  console.log('\nOr: set NETLIFY_AUTH_TOKEN=YOUR_TOKEN');
  process.exit(1);
}

function apiRequest(method, apiPath, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.netlify.com',
      path: `/api/v1${apiPath}`,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': body && !(body instanceof Buffer) ? 'application/json' : 'application/octet-stream',
        'User-Agent': 'got-transport-deploy/1.0',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(data)); } catch { resolve(data); }
        } else {
          reject(new Error(`API ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(body instanceof Buffer ? body : JSON.stringify(body));
    }
    req.end();
  });
}

function sha1(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha1').update(content).digest('hex');
}

function getAllFiles(dir, base = dir) {
  const results = {};
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      Object.assign(results, getAllFiles(full, base));
    } else {
      const rel = '/' + path.relative(base, full).replace(/\\/g, '/');
      results[rel] = { hash: sha1(full), path: full };
    }
  }
  return results;
}

async function deploy() {
  console.log('\x1b[36m[1/5] Checking for existing site...\x1b[0m');

  // Find or create site
  let site;
  try {
    const sites = await apiRequest('GET', `/sites?name=${SITE_NAME}`);
    site = sites.find(s => s.name === SITE_NAME);
  } catch (e) { /* ignore */ }

  if (!site) {
    console.log(`\x1b[36m[2/5] Creating site "${SITE_NAME}"...\x1b[0m`);
    try {
      site = await apiRequest('POST', '/sites', { name: SITE_NAME });
    } catch {
      // Name might be taken, create without name
      site = await apiRequest('POST', '/sites', {});
    }
    console.log(`\x1b[32m  Site created: ${site.ssl_url}\x1b[0m`);
  } else {
    console.log(`\x1b[32m  Found site: ${site.ssl_url}\x1b[0m`);
  }

  // Build file manifest
  console.log('\x1b[36m[3/5] Building file manifest...\x1b[0m');
  const files = getAllFiles(DIST_DIR);
  const fileManifest = {};
  for (const [relPath, info] of Object.entries(files)) {
    fileManifest[relPath] = info.hash;
  }
  console.log(`  Found ${Object.keys(files).length} files`);

  // Create deploy
  console.log('\x1b[36m[4/5] Creating deploy...\x1b[0m');
  const deployResult = await apiRequest('POST', `/sites/${site.id}/deploys`, { files: fileManifest });
  const deployId = deployResult.id;
  const required = deployResult.required || [];
  console.log(`  Deploy ${deployId} created, ${required.length} files need uploading`);

  // Build reverse hash map
  const hashToPath = {};
  for (const [relPath, info] of Object.entries(files)) {
    hashToPath[info.hash] = { relPath, fullPath: info.path };
  }

  // Upload files
  console.log('\x1b[36m[5/5] Uploading files...\x1b[0m');
  let uploaded = 0;
  for (const hash of required) {
    const fileInfo = hashToPath[hash];
    if (fileInfo) {
      const content = fs.readFileSync(fileInfo.fullPath);
      try {
        await apiRequest('PUT', `/deploys/${deployId}/files${fileInfo.relPath}`, content);
        uploaded++;
        console.log(`  \x1b[90m(${uploaded}/${required.length}) ${fileInfo.relPath}\x1b[0m`);
      } catch (err) {
        console.error(`  \x1b[31mFAILED: ${fileInfo.relPath} - ${err.message}\x1b[0m`);
      }
    }
  }

  // Wait and check status
  await new Promise(r => setTimeout(r, 3000));
  const finalDeploy = await apiRequest('GET', `/deploys/${deployId}`);

  console.log('\n\x1b[32m========================================\x1b[0m');
  console.log('\x1b[32m  DEPLOYMENT COMPLETE!\x1b[0m');
  console.log('\x1b[32m========================================\x1b[0m');
  console.log(`\n  Site URL:   ${site.ssl_url}`);
  console.log(`  Deploy URL: ${finalDeploy.deploy_ssl_url}`);
  console.log(`  Admin:      https://app.netlify.com/sites/${site.name}`);
  console.log(`  Status:     ${finalDeploy.state}\n`);
}

deploy().catch(err => {
  console.error('\x1b[31mDeploy failed:\x1b[0m', err.message);
  process.exit(1);
});
