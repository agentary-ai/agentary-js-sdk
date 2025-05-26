#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create public directory structure
const publicDir = path.join(__dirname, '..', 'public');
const distDir = path.join(__dirname, '..', 'dist');

// Clean and create public directory
if (fs.existsSync(publicDir)) {
    fs.rmSync(publicDir, { recursive: true });
}
fs.mkdirSync(publicDir, { recursive: true });

// Create version directories
const version = require('../package.json').version;
const versionDir = path.join(publicDir, 'v' + version);
const latestDir = path.join(publicDir, 'latest');

fs.mkdirSync(versionDir, { recursive: true });
fs.mkdirSync(latestDir, { recursive: true });

// Copy SDK files
const filesToCopy = [
    'agentary.umd.js',
    'agentary.umd.js.map',
    'agentary.esm.js',
    'agentary.esm.js.map',
    'agentary.js',
    'agentary.js.map',
    'webllm-worker.js',
    'webllm-worker.js.map'
];

filesToCopy.forEach(file => {
    const srcPath = path.join(distDir, file);
    if (fs.existsSync(srcPath)) {
        // Copy to versioned directory
        fs.copyFileSync(srcPath, path.join(versionDir, file));
        // Copy to latest directory
        fs.copyFileSync(srcPath, path.join(latestDir, file));
        console.log(`Copied ${file} to both versioned and latest directories`);
    }
});

// Create _headers file for Cloudflare Pages
const headersContent = `/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, HEAD, OPTIONS
  Access-Control-Allow-Headers: *
  Cache-Control: public, max-age=31536000
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block

/*.js
  Content-Type: application/javascript; charset=utf-8

/*.map
  Content-Type: application/json; charset=utf-8

/latest/*
  Cache-Control: public, max-age=3600

/v*/
  Cache-Control: public, max-age=31536000, immutable
`;

fs.writeFileSync(path.join(publicDir, '_headers'), headersContent);

// Create index.html with SDK documentation and examples
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agentary JavaScript SDK - CDN</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 40px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px;
        }
        .section {
            margin-bottom: 40px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #007bff;
        }
        .code-block {
            background: #2d3748;
            color: #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 10px 0;
        }
        .endpoint {
            background: #e3f2fd;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            margin: 5px 0;
        }
        .version-badge {
            background: #28a745;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
        }
        .warning {
            background: #fff3cd;
            border-left-color: #ffc107;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Agentary JavaScript SDK</h1>
        <p>CDN Distribution <span class="version-badge">v${version}</span></p>
    </div>

    <div class="section">
        <h2>🚀 Quick Start</h2>
        <p>Include the SDK in your HTML page using a script tag:</p>
        
        <h3>UMD (Universal Module Definition) - Recommended for script tags</h3>
        <div class="code-block">
&lt;script src="https://your-domain.pages.dev/latest/agentary.umd.js">&lt;/script>
&lt;script>
  const sdk = new Agentary({
    apiKey: 'your-api-key',
    baseUrl: 'https://api.agentary.com'
  });
&lt;/script>
        </div>

        <h3>ES Module - For modern browsers</h3>
        <div class="code-block">
&lt;script type="module">
  import { Agentary } from 'https://your-domain.pages.dev/latest/agentary.esm.js';
  
  const sdk = new Agentary({
    apiKey: 'your-api-key',
    baseUrl: 'https://api.agentary.com'
  });
&lt;/script>
        </div>
    </div>

    <div class="section">
        <h2>📡 CDN Endpoints</h2>
        
        <h3>Latest Version (Auto-updating)</h3>
        <div class="endpoint">https://your-domain.pages.dev/latest/agentary.umd.js</div>
        <div class="endpoint">https://your-domain.pages.dev/latest/agentary.esm.js</div>
        <div class="endpoint">https://your-domain.pages.dev/latest/agentary.js</div>
        
        <h3>Specific Version (Immutable)</h3>
        <div class="endpoint">https://your-domain.pages.dev/v${version}/agentary.umd.js</div>
        <div class="endpoint">https://your-domain.pages.dev/v${version}/agentary.esm.js</div>
        <div class="endpoint">https://your-domain.pages.dev/v${version}/agentary.js</div>
    </div>

    <div class="section warning">
        <h2>⚠️ Production Recommendations</h2>
        <ul>
            <li><strong>Pin to specific versions</strong> in production to avoid breaking changes</li>
            <li><strong>Use your own domain</strong> instead of pages.dev for better reliability</li>
            <li><strong>Implement SRI</strong> (Subresource Integrity) for security</li>
            <li><strong>Monitor usage</strong> and set up proper error handling</li>
        </ul>
    </div>

    <div class="section">
        <h2>🔧 Integration Examples</h2>
        
        <h3>Basic HTML Integration</h3>
        <div class="code-block">
&lt;!DOCTYPE html>
&lt;html>
&lt;head>
    &lt;title>My App&lt;/title>
&lt;/head>
&lt;body>
    &lt;script src="https://your-domain.pages.dev/v${version}/agentary.umd.js">&lt;/script>
    &lt;script>
        const sdk = new Agentary({
            apiKey: 'your-api-key-here',
            baseUrl: 'https://api.agentary.com',
            debug: true
        });

        sdk.on('initialized', () => {
            console.log('SDK ready!');
        });

        // Your app logic here
    &lt;/script>
&lt;/body>
&lt;/html>
        </div>

        <h3>With Subresource Integrity (SRI)</h3>
        <div class="code-block">
&lt;script 
    src="https://your-domain.pages.dev/v${version}/agentary.umd.js"
    integrity="sha384-[hash-will-be-generated]"
    crossorigin="anonymous">
&lt;/script>
        </div>
    </div>

    <div class="section">
        <h2>📊 File Sizes</h2>
        <p>All files are served with gzip compression enabled:</p>
        <ul>
            <li><strong>agentary.umd.js</strong> - Universal build for script tags</li>
            <li><strong>agentary.esm.js</strong> - ES Module build for modern bundlers</li>
            <li><strong>agentary.js</strong> - CommonJS build for Node.js</li>
            <li><strong>webllm-worker.js</strong> - Web Worker for ML operations</li>
        </ul>
    </div>

    <div class="section">
        <h2>🔗 Resources</h2>
        <ul>
            <li><a href="https://github.com/yourusername/agentary-js-sdk">GitHub Repository</a></li>
            <li><a href="https://docs.agentary.com">Documentation</a></li>
            <li><a href="https://github.com/yourusername/agentary-js-sdk/issues">Report Issues</a></li>
        </ul>
    </div>
</body>
</html>`;

fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtml);

// Create a simple API endpoint for version info
const versionInfo = {
    version: version,
    files: filesToCopy.map(file => ({
        name: file,
        size: fs.statSync(path.join(distDir, file)).size,
        urls: {
            latest: `/latest/${file}`,
            versioned: `/v${version}/${file}`
        }
    })),
    timestamp: new Date().toISOString()
};

fs.writeFileSync(path.join(publicDir, 'version.json'), JSON.stringify(versionInfo, null, 2));

console.log(`\n✅ Build complete!`);
console.log(`📁 Files prepared in: ${publicDir}`);
console.log(`🔗 Version: ${version}`);
console.log(`📊 Total files: ${filesToCopy.length}`);
console.log(`\nNext steps:`);
console.log(`1. Deploy to Cloudflare Pages`);
console.log(`2. Configure custom domain (optional)`);
console.log(`3. Update your documentation with the CDN URLs`); 