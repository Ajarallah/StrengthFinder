<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1V2fTK-2w4cpltlxxqhy4tvNZQG7UgQNM

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## ⚠️ Security Warning

**IMPORTANT:** This application currently embeds the Gemini API key directly in the production bundle (via `vite.config.ts`). This means:

- ❌ Your API key is visible in the compiled JavaScript
- ❌ Anyone can extract it from browser DevTools
- ❌ Unauthorized users can abuse your API quota

**For production deployment**, you should:
1. **Create a backend API** to proxy Gemini requests
2. **Store the API key server-side** (never in frontend code)
3. **Remove the `define` block** from `vite.config.ts` that embeds the key
4. **Implement authentication** to control access to your backend
5. **Add rate limiting** to prevent quota abuse

This current setup is **only suitable for local development**, not production use.
