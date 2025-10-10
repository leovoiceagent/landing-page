# Deployment Guide - Leo Voice Agent

This guide covers deploying the Leo Voice Agent landing page to Netlify.

## Table of Contents
- [Netlify Configuration](#netlify-configuration)
- [Environment Variables](#environment-variables)
- [React Router & Redirects](#react-router--redirects)
- [Troubleshooting](#troubleshooting)

---

## Netlify Configuration

### Build Settings

When setting up your Netlify site, use these build settings:

- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Node Version:** 18 or later

### Automatic Deployments

Netlify automatically deploys when you push to the `main` branch on GitHub.

---

## Environment Variables

**IMPORTANT:** You must add these environment variables in your Netlify dashboard for the app to work in production.

### Required Environment Variables:

Go to: **Site Settings → Environment Variables**

Add these three variables:

1. **`VITE_SUPABASE_URL`**
   - Your Supabase project URL
   - Format: `https://xxxxx.supabase.co`
   - Found in: Supabase Dashboard → Project Settings → API

2. **`VITE_SUPABASE_ANON_KEY`**
   - Your Supabase anonymous/public key
   - Found in: Supabase Dashboard → Project Settings → API

3. **`VITE_RESEND_API_KEY`**
   - Your Resend API key for email notifications
   - Format: starts with `re_`
   - Found in: Resend Dashboard → API Keys

### After Adding Variables:

⚠️ **You MUST redeploy** after adding or changing environment variables!

Netlify only bakes environment variables into the build during deployment. To trigger a new deployment:
- Go to: **Deploys → Trigger Deploy → Deploy Site**
- Or push a new commit to trigger automatic deployment

---

## React Router & Redirects

### The `public/_redirects` File

**Location:** `public/_redirects`

**Contents:**
```
/*    /index.html   200
```

### Why This Is Needed

**The Problem:**
- Your app is a Single Page Application (SPA) using React Router
- All routes (`/login`, `/app`, `/admin`, etc.) are handled by JavaScript
- When users visit `yourdomain.com/login` directly, Netlify looks for a file called `login.html`
- Since that file doesn't exist, users get a **404 Page Not Found** error

**The Solution:**
- The `_redirects` file tells Netlify to send ALL requests to `index.html`
- React Router then takes over and shows the correct page
- The `200` status code means it's a rewrite (not a redirect), so the URL stays the same

### Routes That Need This:
- `/login` - Login page
- `/register` - Registration page
- `/app` - User dashboard
- `/admin` - Admin dashboard
- `/auth/callback` - OAuth callback (Google sign-in)
- `/reset-password` - Password reset page

### Without `_redirects`:
❌ Direct page visits = 404 errors
❌ Google OAuth callback fails
❌ Refreshing the page on any route = 404

### With `_redirects`:
✅ All routes work correctly
✅ OAuth callbacks work
✅ Refreshing pages works
✅ Direct links work

---

## Git Configuration

### Netlify Contributor Issues

Netlify tracks Git contributors by email. If you get deployment errors about "unrecognized Git contributor":

**Check your Git email:**
```bash
git config user.email
```

**Should be:** `leovoiceagent@gmail.com`

**If it's wrong, fix it:**
```bash
git config user.email "leovoiceagent@gmail.com"
```

**For private repos:** You may need to link your Git account in Netlify:
- Go to: https://app.netlify.com/user/applications#git
- Link your GitHub account

**Best solution:** Make the repository public (recommended for landing pages)
- No contributor limits
- Faster deployment
- Your environment variables stay secure!

---

## Troubleshooting

### Issue: "Page Not Found" on deployed site

**Cause:** Missing or incorrect `_redirects` file

**Solution:**
1. Verify `public/_redirects` exists
2. Content should be: `/*    /index.html   200`
3. Redeploy the site

---

### Issue: Dashboard shows no data

**Cause:** Missing environment variables in Netlify

**Solution:**
1. Go to Netlify: **Site Settings → Environment Variables**
2. Verify all three variables are set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RESEND_API_KEY`
3. Trigger a new deployment

---

### Issue: Email notifications not working

**Possible Causes:**
1. Missing `VITE_RESEND_API_KEY` in Netlify
2. Invalid or expired Resend API key
3. Resend free tier limits exceeded

**Solution:**
1. Check environment variable is set correctly in Netlify
2. Verify API key is valid in Resend dashboard
3. Check Resend dashboard for sending limits/errors

---

### Issue: Google OAuth fails with "localhost:3000" error

**Cause:** Supabase OAuth redirect URLs not configured for production

**Solution:**

1. **In Supabase Dashboard:**
   - Go to: **Authentication → URL Configuration**
   - **Site URL:** `https://leovoiceagent-landing.netlify.app`
   - **Redirect URLs:** Add both:
     - `http://localhost:5173/auth/callback` (local dev)
     - `https://leovoiceagent-landing.netlify.app/auth/callback` (production)

2. **In Google Cloud Console:**
   - Go to: **APIs & Services → Credentials**
   - Click your OAuth 2.0 Client ID
   - **Authorized redirect URIs:** Add:
     - `https://[your-project-id].supabase.co/auth/v1/callback`

---

### Issue: Deployment blocked - "unrecognized Git contributor"

**Cause:** Git commits from email not linked to Netlify account

**Solutions:**

1. **Make repo public** (easiest):
   - GitHub repo → Settings → Change visibility → Make public
   - No contributor restrictions on public repos

2. **Fix Git email:**
   ```bash
   git config user.email "leovoiceagent@gmail.com"
   git commit --amend --reset-author --no-edit
   git push origin main --force-with-lease
   ```

3. **Link account in Netlify:**
   - https://app.netlify.com/user/applications#git
   - Authorize GitHub
   - Add yourself as contributor

---

## Deployment Checklist

Before deploying to production, ensure:

- [ ] All environment variables added to Netlify
- [ ] `public/_redirects` file exists
- [ ] Supabase OAuth URLs configured for production domain
- [ ] Google OAuth URLs configured for production domain
- [ ] Git email set to `leovoiceagent@gmail.com`
- [ ] Repository is public (recommended)
- [ ] Test locally with `npm run build && npm run preview`

---

## Quick Deploy

To deploy changes:

1. **Make your changes**
2. **Commit:**
   ```bash
   git add .
   git commit -m "Your commit message"
   ```
3. **Push:**
   ```bash
   git push origin main
   ```
4. **Wait 2-3 minutes** for Netlify to build and deploy
5. **Check:** https://leovoiceagent-landing.netlify.app

---

## Production URLs

- **Live Site:** https://leovoiceagent-landing.netlify.app
- **Netlify Dashboard:** https://app.netlify.com/sites/leovoiceagent-landing
- **GitHub Repo:** https://github.com/leovoiceagent/landing-page

---

## Need Help?

Common resources:
- [Netlify Redirects Documentation](https://docs.netlify.com/routing/redirects/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [React Router Documentation](https://reactrouter.com/)

---

**Last Updated:** October 10, 2025

