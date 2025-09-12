# 🚀 ShopKart Deployment Guide

## 📋 Prerequisites
- GitHub account
- Vercel account (free)
- Railway account (free)
- MongoDB Atlas account (free)

## 🎯 Deployment Steps

### 1. Frontend Deployment (Vercel)

#### Option A: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to client directory
cd client

# Deploy to Vercel
vercel --prod
```

#### Option B: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Set Root Directory to `client`
6. Build Command: `npm run build`
7. Output Directory: `dist`
8. Deploy!

### 2. Backend Deployment (Railway)

#### Option A: Deploy via Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Navigate to server directory
cd server

# Login to Railway
railway login

# Deploy
railway up
```

#### Option B: Deploy via Railway Dashboard
1. Go to [railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Set Root Directory to `server`
7. Add Environment Variables (see below)
8. Deploy!

### 3. Database Setup (MongoDB Atlas)

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update environment variables

## 🔧 Environment Variables

### Frontend (.env)
```env
VITE_BACKEND_URL=https://your-railway-app.railway.app
VITE_REACT_APP_REMOVEBG_KEY=ZiGFnjdFnHB6AQZuj9YXURE3
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### Backend (Railway Environment Variables)
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/shopkart
JWT_SECRET=your_jwt_secret_key_here_please_change_this_in_production
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
CLIENT_URL=https://your-vercel-app.vercel.app
PORT=5001
```

## 🔄 Post-Deployment Steps

1. **Update Frontend Environment Variables**
   - Update `VITE_BACKEND_URL` to your Railway backend URL

2. **Update CORS Settings**
   - Add your Vercel frontend URL to CORS origins in backend

3. **Test the Application**
   - Test user registration/login
   - Test product browsing
   - Test cart functionality
   - Test payment processing
   - Test admin panel

## 📱 Custom Domain (Optional)

### Vercel Custom Domain
1. Go to your Vercel project dashboard
2. Click "Domains"
3. Add your custom domain
4. Update DNS settings

### Railway Custom Domain
1. Go to your Railway project dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS settings

## 🛠️ Troubleshooting

### Common Issues:
1. **CORS Errors**: Update CORS origins in backend
2. **Environment Variables**: Double-check all env vars are set
3. **Database Connection**: Verify MongoDB Atlas connection string
4. **Build Errors**: Check build logs in deployment platform

### Support:
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com

## 🎉 Success!
Your ShopKart application should now be live and accessible to users worldwide!
