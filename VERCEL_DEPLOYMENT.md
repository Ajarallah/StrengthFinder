# Deploying to Vercel

## 🚀 Quick Deploy

### Step 1: Connect Your Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository: `Ajarallah/StrengthFinder`
4. Vercel will auto-detect it's a Vite project

### Step 2: Configure Environment Variables

**CRITICAL:** In the Vercel project settings, add this environment variable:

```
GEMINI_API_KEY=AIzaSyATWuKmbLGWY0MyWg3-sx2qenuRT9xzOlg
```

**How to add it:**
1. In Vercel project settings → Environment Variables
2. Add variable name: `GEMINI_API_KEY`
3. Add value: `AIzaSyATWuKmbLGWY0MyWg3-sx2qenuRT9xzOlg`
4. Select all environments (Production, Preview, Development)
5. Click "Save"

### Step 3: Deploy

Click "Deploy" and Vercel will:
- Install dependencies
- Build the project with `npm run build`
- Deploy to your custom domain

## ⚙️ Build Configuration

Vercel should automatically detect:
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

If it doesn't auto-detect, set these manually in Project Settings → Build & Development Settings.

## ⚠️ Security Warning

**IMPORTANT:** This deployment method embeds your API key in the client-side JavaScript bundle, which means:

- ❌ Anyone can extract your API key from the browser
- ❌ Unlimited API usage by anyone who finds the key
- ❌ Potential quota exhaustion and billing issues

### Recommended Production Setup

For a secure production deployment:

1. **Create a Serverless API** (Vercel Functions)
2. **Move API calls to backend**
3. **Add authentication**
4. **Implement rate limiting**

Example Vercel Function (`/api/gemini.js`):
```javascript
export default async function handler(req, res) {
  // Verify user authentication here

  const { GoogleGenAI } = require('@google/genai');
  const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY // Server-side only
  });

  // Process request and call Gemini
  // Return response
}
```

## 📊 Monitoring

After deployment:
- Check [Google AI Studio](https://aistudio.google.com/) for API usage
- Monitor Vercel Analytics for traffic
- Set up API quota alerts in Google Cloud Console

## 🔄 Redeployment

When you push changes to your GitHub repository:
- **Main branch** → Auto-deploys to production
- **Other branches** → Creates preview deployments

## 📝 Custom Domain

To add a custom domain:
1. Go to Project Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions
