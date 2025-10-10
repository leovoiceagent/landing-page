# Quick Start: Email Notifications

## ⚡ Quick Setup (5 minutes)

### Step 1: Get Your Resend API Key
1. Go to https://resend.com/api-keys
2. Create a new API key
3. Copy it (starts with `re_`)

### Step 2: Add to Your Project
Create a `.env` file in your project root and add:

```env
VITE_RESEND_API_KEY=re_your_key_here
```

### Step 3: Restart Development Server
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## ✅ That's It!

Now when someone signs up:
- You'll get an email at **leovoiceagent@gmail.com** 📧
- It includes: user name, email, and signup time

## 🧪 Test It

1. Go to http://localhost:5173/register
2. Create a test account
3. Check leovoiceagent@gmail.com

## 📧 Email Preview

You'll receive emails that look like this:

**Subject:** 🎉 New User Registration - Leo Voice Agent

```
Great news! A new user has just signed up.

Name: John Doe
Email: john@example.com
Registration Time: Friday, October 10, 2025 at 1:30 PM
```

## Need More Details?

See `EMAIL_SETUP.md` for full documentation and troubleshooting.

