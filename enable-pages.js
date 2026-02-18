const { execSync } = require('child_process');
const https = require('https');

// Step 1: Get token from git credential manager
const input = 'protocol=https\nhost=github.com\n\n';
let token;
try {
  const result = execSync('git credential fill', { input: input, encoding: 'utf8' });
  const match = result.match(/password=(.+)/);
  if (match) {
    token = match[1].trim();
    console.log('Got token from git credential manager (' + token.substring(0, 8) + '...)');
  } else {
    console.log('No password found in credential output');
    console.log('Output:', result.substring(0, 200));
    process.exit(1);
  }
} catch (e) {
  console.log('Failed to get credentials:', e.message.substring(0, 200));
  process.exit(1);
}

// Step 2: Enable GitHub Pages on gh-pages branch
const postData = JSON.stringify({
  source: {
    branch: 'gh-pages',
    path: '/'
  }
});

const options = {
  hostname: 'api.github.com',
  path: '/repos/css-intel/got-transportation/pages',
  method: 'POST',
  headers: {
    'Authorization': 'token ' + token,
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'got-transportation-deploy',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Enabling GitHub Pages on gh-pages branch...');
const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const json = JSON.parse(data);
      if (json.html_url) {
        console.log('\n=== SUCCESS! ===');
        console.log('Your site is deploying to:', json.html_url);
        console.log('It may take 1-2 minutes to go live.');
      } else if (res.statusCode === 409) {
        console.log('Pages already enabled, updating source...');
        // Try PUT to update
        const putOptions = { ...options, method: 'PUT' };
        const req2 = https.request(putOptions, (res2) => {
          let d2 = '';
          res2.on('data', (c) => d2 += c);
          res2.on('end', () => {
            console.log('Update status:', res2.statusCode);
            try {
              const j2 = JSON.parse(d2);
              console.log('URL:', j2.html_url || 'Check https://css-intel.github.io/got-transportation/');
            } catch(e) { console.log(d2.substring(0, 300)); }
          });
        });
        req2.write(postData);
        req2.end();
      } else {
        console.log('Response:', JSON.stringify(json, null, 2).substring(0, 500));
      }
    } catch (e) {
      console.log('Raw response:', data.substring(0, 500));
    }
  });
});
req.on('error', (e) => console.error('Request error:', e.message));
req.write(postData);
req.end();
