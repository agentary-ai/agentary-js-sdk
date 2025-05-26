# 🌐 Agentary SDK - Cloudflare CDN Setup

Your Agentary JavaScript SDK is now ready to be deployed as a CDN using Cloudflare Pages! This setup allows anyone to include your SDK in their website using a simple script tag.

## 🚀 Quick Deployment

### 1. Prerequisites
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

### 2. Deploy Your SDK
```bash
# Deploy to staging
npm run cdn:deploy

# Deploy to production
npm run cdn:deploy:prod
```

## 📡 How Users Will Access Your SDK

Once deployed, users can include your SDK in their websites like this:

### Option 1: UMD Build (Recommended for most users)
```html
<script src="https://your-domain.pages.dev/latest/agentary.umd.js"></script>
<script>
  const sdk = new Agentary({
    apiKey: 'user-api-key',
    baseUrl: 'https://api.agentary.com'
  });
</script>
```

### Option 2: ES Module (For modern browsers)
```html
<script type="module">
  import { Agentary } from 'https://your-domain.pages.dev/latest/agentary.esm.js';
  
  const sdk = new Agentary({
    apiKey: 'user-api-key',
    baseUrl: 'https://api.agentary.com'
  });
</script>
```

## 🔗 CDN Endpoints

Your SDK will be available at these URLs:

### Latest Version (Auto-updating)
- **UMD**: `https://your-domain.pages.dev/latest/agentary.umd.js`
- **ESM**: `https://your-domain.pages.dev/latest/agentary.esm.js`
- **CJS**: `https://your-domain.pages.dev/latest/agentary.js`

### Specific Version (Recommended for production)
- **UMD**: `https://your-domain.pages.dev/v1.0.0/agentary.umd.js`
- **ESM**: `https://your-domain.pages.dev/v1.0.0/agentary.esm.js`
- **CJS**: `https://your-domain.pages.dev/v1.0.0/agentary.js`

### Additional Resources
- **Documentation**: `https://your-domain.pages.dev/`
- **Version Info**: `https://your-domain.pages.dev/version.json`

## 🛠 What Was Created

The setup created these files in your project:

```
cloudflare/
├── README.md           # Detailed documentation
├── wrangler.toml       # Cloudflare configuration
├── build.js            # CDN preparation script
├── deploy.sh           # Automated deployment script
└── example.html        # Working example for users

public/                 # Generated CDN files
├── index.html          # Documentation page
├── version.json        # Version information API
├── _headers            # Cloudflare headers configuration
├── latest/             # Auto-updating files
│   ├── agentary.umd.js
│   ├── agentary.esm.js
│   └── agentary.js
└── v1.0.0/            # Version-specific files
    ├── agentary.umd.js
    ├── agentary.esm.js
    └── agentary.js
```

## ⚡ Key Features

### 🔒 Security
- CORS headers configured for cross-origin requests
- Security headers (XSS protection, content type sniffing prevention)
- Support for Subresource Integrity (SRI)

### 🚀 Performance
- Global CDN distribution via Cloudflare
- Automatic compression (gzip/brotli)
- Optimized caching strategy:
  - Latest files: 1 hour cache
  - Versioned files: 1 year cache (immutable)

### 🔄 Version Management
- Both latest and versioned endpoints
- Automatic version detection from package.json
- Easy rollback capabilities

## 📖 Usage Documentation

### For Your Users

Provide this example to your SDK users:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My App with Agentary SDK</title>
</head>
<body>
    <!-- Include the SDK -->
    <script src="https://your-domain.pages.dev/v1.0.0/agentary.umd.js"></script>
    
    <script>
        // Initialize the SDK
        const sdk = new Agentary({
            apiKey: 'your-api-key-here',
            baseUrl: 'https://api.agentary.com',
            debug: true
        });

        // Set up event listeners
        sdk.on('initialized', () => {
            console.log('Agentary SDK ready!');
            // Your app logic here
        });

        sdk.on('error', (error) => {
            console.error('SDK Error:', error);
        });
    </script>
</body>
</html>
```

### Production Recommendations

For production use, recommend users:

1. **Pin to specific versions** instead of using `/latest/`
2. **Use SRI hashes** for security
3. **Implement error handling** for CDN failures
4. **Monitor performance** and usage

Example with SRI:
```html
<script 
    src="https://your-domain.pages.dev/v1.0.0/agentary.umd.js"
    integrity="sha384-[hash-will-be-generated]"
    crossorigin="anonymous">
</script>
```

## 🔄 Updating Your SDK

When you release a new version:

1. Update version in `package.json`
2. Run `npm run cdn:deploy:prod`
3. The new version will be available at both:
   - `/latest/` (immediately updated)
   - `/v[new-version]/` (new versioned endpoint)

## 🌐 Custom Domain Setup

To use your own domain instead of `.pages.dev`:

1. Go to Cloudflare Dashboard → Pages → agentary-js-sdk
2. Click "Custom domains"
3. Add your domain (e.g., `sdk.yourdomain.com`)
4. Update your DNS as instructed
5. Update documentation with new URLs

## 📊 Monitoring

Monitor your CDN usage through:
- Cloudflare Analytics dashboard
- Custom analytics in your SDK
- Error tracking and performance monitoring

## 🆘 Need Help?

- Check `cloudflare/README.md` for detailed documentation
- Review the example in `cloudflare/example.html`
- Test locally with `npm run cdn:build`
- Check Cloudflare Pages logs for deployment issues

## 🎉 You're Ready!

Your SDK is now ready to be distributed via CDN! Users can easily include it in their projects with a simple script tag, and you have full control over versioning, caching, and distribution.

**Next Steps:**
1. Deploy to Cloudflare: `npm run cdn:deploy`
2. Test the CDN endpoints
3. Update your documentation with the CDN URLs
4. Share with your users!

---

*Happy coding! 🚀* 