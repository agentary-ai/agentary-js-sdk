#!/bin/bash

# Agentary SDK - Cloudflare Pages Deployment Script
set -e

echo "🚀 Starting Cloudflare Pages deployment for Agentary SDK..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler CLI not found. Installing...${NC}"
    npm install -g wrangler
fi

# Check if user is logged in to Cloudflare
echo -e "${BLUE}🔐 Checking Cloudflare authentication...${NC}"
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Cloudflare. Please run: wrangler login${NC}"
    exit 1
fi

# Build the SDK first
echo -e "${BLUE}🔨 Building SDK...${NC}"
cd "$(dirname "$0")/.."
npm run build:prod

# Prepare files for CDN
echo -e "${BLUE}📦 Preparing CDN files...${NC}"
node cloudflare/build.js

# Deploy to Cloudflare Pages
echo -e "${BLUE}🌐 Deploying to Cloudflare Pages...${NC}"

# Check if this is a production deployment
if [[ "$1" == "production" || "$1" == "prod" ]]; then
    echo -e "${YELLOW}🎯 Deploying to PRODUCTION environment...${NC}"
    wrangler pages deploy public --project-name agentary-js-sdk --env production
else
    echo -e "${YELLOW}🧪 Deploying to STAGING environment...${NC}"
    wrangler pages deploy public --project-name agentary-js-sdk --env staging
fi

echo -e "${GREEN}✅ Deployment complete!${NC}"

# Get the deployment URL
echo -e "${BLUE}📋 Getting deployment information...${NC}"
DEPLOYMENT_URL=$(wrangler pages deployment list --project-name agentary-js-sdk --format json | jq -r '.[0].url' 2>/dev/null || echo "Check Cloudflare dashboard for URL")

echo ""
echo -e "${GREEN}🎉 Your SDK is now available at:${NC}"
echo -e "${BLUE}   ${DEPLOYMENT_URL}${NC}"
echo ""
echo -e "${GREEN}📡 CDN Endpoints:${NC}"
echo -e "${BLUE}   UMD: ${DEPLOYMENT_URL}/latest/agentary.umd.js${NC}"
echo -e "${BLUE}   ESM: ${DEPLOYMENT_URL}/latest/agentary.esm.js${NC}"
echo -e "${BLUE}   CJS: ${DEPLOYMENT_URL}/latest/agentary.js${NC}"
echo ""
echo -e "${GREEN}📖 Documentation: ${DEPLOYMENT_URL}${NC}"
echo -e "${GREEN}📊 Version Info: ${DEPLOYMENT_URL}/version.json${NC}"
echo ""
echo -e "${YELLOW}💡 Next steps:${NC}"
echo -e "   1. Test the CDN endpoints"
echo -e "   2. Configure custom domain (optional)"
echo -e "   3. Update your documentation"
echo -e "   4. Set up monitoring and alerts" 