# 🚀 Automated Deployment Pipeline

This document explains how the automated deployment pipeline works for ShopKart.

## 📋 Overview

The automated deployment pipeline uses GitHub Actions to automatically deploy your application whenever you push changes to the main branch.

## 🔧 Workflows

### 1. **Frontend Deployment** (`deploy-frontend.yml`)
- **Triggers**: Push to main branch with changes in `client/` directory
- **Actions**: 
  - Installs dependencies
  - Builds the React app
  - Deploys to Vercel
- **Environment Variables Required**:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`
  - `VITE_BACKEND_URL`
  - `VITE_REACT_APP_REMOVEBG_KEY`
  - `VITE_STRIPE_PUBLISHABLE_KEY`

### 2. **Backend Deployment** (`deploy-backend.yml`)
- **Triggers**: Push to main branch with changes in `server/` directory
- **Actions**:
  - Installs dependencies
  - Runs tests (if available)
  - Deploys to Railway
- **Environment Variables Required**:
  - `RAILWAY_TOKEN`
  - `RAILWAY_SERVICE_NAME`

### 3. **Full Stack Deployment** (`deploy-fullstack.yml`)
- **Triggers**: Push to main branch or manual trigger
- **Actions**:
  - Deploys backend first
  - Then deploys frontend
  - Provides deployment status
- **Smart Deployment**: Only deploys changed services

### 4. **Environment Setup** (`setup-env.yml`)
- **Triggers**: Manual trigger only
- **Actions**: Sets up environment variables for different environments

## 🔑 Required GitHub Secrets

Add these secrets to your GitHub repository:

### Vercel Secrets
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

### Railway Secrets
```
RAILWAY_TOKEN=your_railway_token
RAILWAY_SERVICE_NAME=your_service_name
```

### Application Secrets
```
VITE_BACKEND_URL=https://your-railway-backend-url
VITE_REACT_APP_REMOVEBG_KEY=your_removebg_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## 📝 How to Add GitHub Secrets

1. Go to your GitHub repository
2. Click on **Settings** tab
3. Click on **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret with the exact name and value

## 🚀 How It Works

### Automatic Deployment
1. **Push to main branch** → GitHub Actions triggers
2. **Detects changes** → Only deploys changed services
3. **Builds and tests** → Ensures code quality
4. **Deploys** → Updates live application
5. **Notifies** → Shows deployment status

### Manual Deployment
1. Go to **Actions** tab in GitHub
2. Select **Deploy Full Stack Application**
3. Click **Run workflow**
4. Choose environment and run

## 🔍 Monitoring Deployments

### GitHub Actions
- Go to **Actions** tab in your repository
- View deployment logs and status
- Debug any deployment issues

### Vercel Dashboard
- Monitor frontend deployments
- View build logs and performance

### Railway Dashboard
- Monitor backend deployments
- View application logs and metrics

## 🛠️ Troubleshooting

### Common Issues

1. **Deployment Fails**
   - Check GitHub Actions logs
   - Verify all secrets are set correctly
   - Ensure environment variables are valid

2. **Build Errors**
   - Check for syntax errors in code
   - Verify all dependencies are installed
   - Check for missing environment variables

3. **Service Not Updating**
   - Wait a few minutes for deployment to complete
   - Check service-specific dashboards
   - Verify webhook configurations

### Debug Commands

```bash
# Check GitHub Actions status
gh run list

# View specific workflow logs
gh run view <run-id>

# Check Vercel deployment status
vercel ls

# Check Railway deployment status
railway status
```

## 📊 Deployment Status

- ✅ **Frontend**: Automatically deployed to Vercel
- ✅ **Backend**: Automatically deployed to Railway
- ✅ **Database**: MongoDB Atlas (manual setup required)
- ✅ **CDN**: Vercel Edge Network
- ✅ **SSL**: Automatic HTTPS certificates

## 🔄 Rollback Process

If a deployment causes issues:

1. **Vercel Rollback**:
   - Go to Vercel dashboard
   - Select previous deployment
   - Click "Promote to Production"

2. **Railway Rollback**:
   - Go to Railway dashboard
   - Select previous deployment
   - Click "Deploy"

3. **GitHub Rollback**:
   - Revert the problematic commit
   - Push to main branch
   - Automated deployment will trigger

## 📈 Performance Monitoring

- **Frontend**: Vercel Analytics
- **Backend**: Railway Metrics
- **Database**: MongoDB Atlas Monitoring
- **Errors**: GitHub Actions logs

## 🎯 Best Practices

1. **Test Locally** before pushing
2. **Use Feature Branches** for major changes
3. **Monitor Deployments** after each push
4. **Keep Secrets Secure** and rotate regularly
5. **Document Changes** in commit messages

---

**Your ShopKart application now has a fully automated deployment pipeline! 🎉**

Every push to the main branch will automatically deploy your changes to production.
