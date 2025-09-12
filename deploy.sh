#!/bin/bash

echo "🚀 Starting ShopKart Deployment..."

# Build frontend
echo "📦 Building frontend..."
cd client
npm run build
echo "✅ Frontend build complete!"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy frontend to Vercel
echo "🌐 Deploying frontend to Vercel..."
vercel --prod --yes

echo "🎉 Deployment complete!"
echo "📋 Next steps:"
echo "1. Update CORS settings in server/index.js with your Vercel URL"
echo "2. Deploy backend to Railway"
echo "3. Set up MongoDB Atlas"
echo "4. Update environment variables"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
