# Agentary SDK - Cloudflare CDN Setup

This directory contains all the necessary files and scripts to deploy your Agentary JavaScript SDK to Cloudflare Pages, making it available as a CDN for easy integration via script tags.

## 🚀 Quick Start

### Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI**: Install globally with `npm install -g wrangler`
3. **Authentication**: Run `wrangler login` to authenticate with Cloudflare

### One-Command Deployment

```bash
# Deploy to staging
npm run cdn:deploy

# Deploy to production
npm run cdn:deploy:prod
```

## 📁 File Structure

```
cloudflare/
├── README.md           # This file
├── wrangler.toml       # Cloudflare configuration
├── build.js            # CDN preparation script
├── deploy.sh           # Automated deployment script
└── example.html        # Usage example
```

## 🔧 Setup Process

### 1. Initial Setup

```bash
# Install Wrangler CLI (if not already installed)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create a new Pages project (optional - can be done via dashboard)
wrangler pages project create agentary-js-sdk
```

### 2. Build and Deploy

```bash
# Build the SDK and prepare CDN files
npm run cdn:build

# Deploy to Cloudflare Pages
npm run cdn:deploy
```

### 3. Custom Domain (Optional)

1. Go to your Cloudflare dashboard
2. Navigate to Pages → agentary-js-sdk → Custom domains
3. Add your domain (e.g., `sdk.yourdomain.com`)
4. Update DNS records as instructed

## 📡 CDN Structure

After deployment, your SDK will be available at:

### Latest Version (Auto-updating)
- `https://your-domain.pages.dev/latest/agentary.umd.js`
- `https://your-domain.pages.dev/latest/agentary.esm.js`
- `https://your-domain.pages.dev/latest/agentary.js`

### Specific Version (Immutable)
- `https://your-domain.pages.dev/v1.0.0/agentary.umd.js`
- `https://your-domain.pages.dev/v1.0.0/agentary.esm.js`
- `https://your-domain.pages.dev/v1.0.0/agentary.js`

### Additional Files
- `https://your-domain.pages.dev/version.json` - Version information
- `https://your-domain.pages.dev/` - Documentation and examples

## 🌐 Usage Examples

### Basic Script Tag (UMD)

```html
<!DOCTYPE html>
<html>
<head>
    <title>My App</title>
</head>
<body>
    <script src="https://your-domain.pages.dev/latest/agentary.umd.js"></script>
    <script>
        const sdk = new Agentary({
            apiKey: 'your-api-key',
            baseUrl: 'https://api.agentary.com'
        });
    </script>
</body>
</html>
```

### ES Module

```html
<script type="module">
    import { Agentary } from 'https://your-domain.pages.dev/latest/agentary.esm.js';
    
    const sdk = new Agentary({
        apiKey: 'your-api-key',
        baseUrl: 'https://api.agentary.com'
    });
</script>
```

### With Subresource Integrity (Recommended for Production)

```html
<script 
    src="https://your-domain.pages.dev/v1.0.0/agentary.umd.js"
    integrity="sha384-[hash]"
    crossorigin="anonymous">
</script>
```

## 🔒 Security Features

### CORS Headers
All files are served with appropriate CORS headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, HEAD, OPTIONS`

### Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### Content Type Headers
- JavaScript files: `application/javascript; charset=utf-8`
- Source maps: `application/json; charset=utf-8`

## ⚡ Performance Optimizations

### Caching Strategy
- **Latest files**: 1 hour cache (`max-age=3600`)
- **Versioned files**: 1 year cache with immutable flag (`max-age=31536000, immutable`)

### Compression
- Automatic gzip/brotli compression via Cloudflare
- Optimized file sizes through Rollup + Terser

### Global CDN
- Served from Cloudflare's global edge network
- Automatic geographic optimization

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy SDK to CDN

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build and deploy to CDN
        run: npm run cdn:deploy:prod
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

### Environment Variables

Set these in your CI/CD environment:
- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID (optional)

## 📊 Monitoring and Analytics

### Built-in Monitoring
- Cloudflare Analytics (free tier includes basic metrics)
- Real User Monitoring (RUM) available in paid plans

### Custom Monitoring
Add monitoring to your SDK usage:

```javascript
// Track SDK loads
window.addEventListener('load', () => {
    if (typeof Agentary !== 'undefined') {
        // Report successful load to your analytics
        analytics.track('SDK Loaded', { version: Agentary.version });
    }
});
```

## 🛠 Troubleshooting

### Common Issues

1. **404 Errors**
   - Check if deployment was successful
   - Verify the correct domain and path
   - Ensure files were built properly

2. **CORS Errors**
   - Headers should be automatically configured
   - Check browser console for specific error messages

3. **Version Mismatch**
   - Clear browser cache
   - Check if you're using the correct version URL

### Debug Commands

```bash
# Check deployment status
wrangler pages deployment list --project-name agentary-js-sdk

# View logs
wrangler pages deployment tail --project-name agentary-js-sdk

# Test local build
npm run cdn:build && cd public && python -m http.server 8000
```

## 🔄 Update Process

### For New Releases

1. Update version in `package.json`
2. Build and test locally: `npm run cdn:build`
3. Deploy: `npm run cdn:deploy:prod`
4. Update documentation with new version URLs

### Rollback Process

```bash
# List recent deployments
wrangler pages deployment list --project-name agentary-js-sdk

# Rollback to specific deployment
wrangler pages deployment rollback [DEPLOYMENT_ID] --project-name agentary-js-sdk
```

## 📈 Best Practices

### For SDK Consumers

1. **Pin to specific versions** in production
2. **Use SRI hashes** for security
3. **Implement error handling** for CDN failures
4. **Monitor performance** and usage

### For SDK Maintainers

1. **Test thoroughly** before deploying to production
2. **Use semantic versioning** for predictable updates
3. **Maintain backward compatibility** when possible
4. **Document breaking changes** clearly

## 🔗 Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

## 📞 Support

If you encounter issues with the CDN setup:

1. Check the [troubleshooting section](#-troubleshooting)
2. Review Cloudflare Pages logs
3. Open an issue in the repository
4. Contact the development team

---

**Happy deploying! 🚀** 