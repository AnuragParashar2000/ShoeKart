# 🔐 GitHub Secrets Setup Guide

This guide will help you set up all the required secrets for automated deployment.

## 📋 Required Secrets

### **Vercel Secrets**
| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `VERCEL_TOKEN` | Your Vercel API token | See instructions below |
| `VERCEL_ORG_ID` | `anuragparashar2000s-projects` | Your Vercel team/org ID |
| `VERCEL_PROJECT_ID` | `prj_otrMyfvtX4FbD3pkboQUaxII6HrH` | Your Vercel project ID |

### **Railway Secrets**
| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `RAILWAY_TOKEN` | Your Railway API token | See instructions below |
| `RAILWAY_SERVICE_NAME` | `ShoeKart` | Your Railway service name |

### **Application Secrets**
| Secret Name | Value | Current Value |
|-------------|-------|---------------|
| `VITE_BACKEND_URL` | `https://shoekart-production.up.railway.app` | Your Railway backend URL |
| `VITE_REACT_APP_REMOVEBG_KEY` | `ZiGFnjdFnHB6AQZuj9YXURE3` | Your Remove.bg API key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_51S59RM1iaWe9mCVG7d3DaixntuICxj1s9gBbVvsgzZp593OOocYH1gXLkg42g40u4N8GXJgA6CT8RjEKeTPAo6XD00FO18J5ap` | Your Stripe publishable key |

## 🔑 How to Get Vercel Token

1. Go to [Vercel Dashboard](https://vercel.com/account/tokens)
2. Click **Create Token**
3. Name it: `GitHub Actions - ShopKart`
4. Scope: **Full Account**
5. Copy the token (starts with `vercel_`)

## 🚂 How to Get Railway Token

1. Go to [Railway Dashboard](https://railway.app/account/tokens)
2. Click **New Token**
3. Name it: `GitHub Actions - ShopKart`
4. Copy the token

## 📝 How to Add Secrets to GitHub

1. Go to your GitHub repository: `https://github.com/yourusername/your-repo`
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret:

### Step-by-Step:

1. **VERCEL_TOKEN**
   - Name: `VERCEL_TOKEN`
   - Value: `vercel_your_token_here`

2. **VERCEL_ORG_ID**
   - Name: `VERCEL_ORG_ID`
   - Value: `anuragparashar2000s-projects`

3. **VERCEL_PROJECT_ID**
   - Name: `VERCEL_PROJECT_ID`
   - Value: `prj_otrMyfvtX4FbD3pkboQUaxII6HrH`

4. **RAILWAY_TOKEN**
   - Name: `RAILWAY_TOKEN`
   - Value: `your_railway_token_here`

5. **RAILWAY_SERVICE_NAME**
   - Name: `RAILWAY_SERVICE_NAME`
   - Value: `ShoeKart`

6. **VITE_BACKEND_URL**
   - Name: `VITE_BACKEND_URL`
   - Value: `https://shoekart-production.up.railway.app`

7. **VITE_REACT_APP_REMOVEBG_KEY**
   - Name: `VITE_REACT_APP_REMOVEBG_KEY`
   - Value: `ZiGFnjdFnHB6AQZuj9YXURE3`

8. **VITE_STRIPE_PUBLISHABLE_KEY**
   - Name: `VITE_STRIPE_PUBLISHABLE_KEY`
   - Value: `pk_test_51S59RM1iaWe9mCVG7d3DaixntuICxj1s9gBbVvsgzZp593OOocYH1gXLkg42g40u4N8GXJgA6CT8RjEKeTPAo6XD00FO18J5ap`

## ✅ Verification

After adding all secrets:

1. Go to **Actions** tab in your GitHub repository
2. You should see the workflow files
3. Try running a manual deployment:
   - Go to **Actions** → **Deploy Full Stack Application**
   - Click **Run workflow**
   - Select **main** branch
   - Click **Run workflow**

## 🔍 Troubleshooting

### Common Issues:

1. **"Token is invalid"**
   - Regenerate the token
   - Make sure you copied it correctly
   - Check token permissions

2. **"Project not found"**
   - Verify project ID is correct
   - Check organization ID
   - Ensure you have access to the project

3. **"Service not found"**
   - Verify Railway service name
   - Check Railway token permissions
   - Ensure service exists

### Debug Commands:

```bash
# Test Vercel connection
npx vercel whoami

# Test Railway connection
npx @railway/cli whoami

# Check project details
npx vercel project inspect shoe
```

## 🎯 Next Steps

1. ✅ Add all secrets to GitHub
2. ✅ Test manual deployment
3. ✅ Push a small change to trigger automatic deployment
4. ✅ Monitor deployment logs
5. ✅ Verify application is working

---

**Once all secrets are added, your automated deployment pipeline will be fully functional! 🚀**
