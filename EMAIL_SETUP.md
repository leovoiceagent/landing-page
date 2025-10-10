# Email Notification Setup

This document explains how to set up email notifications for new user registrations.

## Overview

When a new user signs up for Leo Voice Agent, an automatic email notification is sent to `leovoiceagent@gmail.com` with the user's details.

## Setup Instructions

### 1. Get Your Resend API Key

1. Go to [Resend](https://resend.com)
2. Sign in or create an account
3. Navigate to **API Keys** in your dashboard
4. Create a new API key
5. Copy the API key (it starts with `re_`)

### 2. Add Environment Variable

Create a `.env` file in the root of your project (if it doesn't exist) and add:

```env
VITE_RESEND_API_KEY=re_your_actual_api_key_here
```

**Important:** Make sure your `.env` file is in your `.gitignore` to keep your API key secure!

### 3. Configure Sender Email (Optional)

By default, Resend uses `onboarding@resend.dev` as the sender. To use your own domain:

1. Add and verify your domain in Resend dashboard
2. Update the `from` field in `src/lib/email.ts`:

```typescript
from: 'Leo Voice Agent <notifications@yourdomain.com>',
```

### 4. Test the Setup

1. Start your development server: `npm run dev`
2. Go to the registration page
3. Create a new user account
4. Check your email at `leovoiceagent@gmail.com`

## What Gets Sent

When a new user registers, the notification email includes:

- ✉️ **User's Name** - The full name they provided
- ✉️ **User's Email** - Their email address
- ✉️ **Registration Time** - When they signed up
- ✉️ **Next Steps** - Reminder that they need to be assigned to an organization

## Email Content Example

```
Subject: 🎉 New User Registration - Leo Voice Agent

Great news! A new user has just signed up for Leo Voice Agent.

Name: John Doe
Email: john@example.com
Registration Time: Friday, October 10, 2025 at 1:30 PM EST

This user has been added to your system and will need to be assigned 
to an organization to access the dashboard features.
```

## Files Modified

- **`src/lib/email.ts`** - Email sending functions using Resend
- **`src/lib/auth.ts`** - Updated signup function to trigger email notification

## Troubleshooting

### Email not sending?

1. **Check API Key**: Make sure your `VITE_RESEND_API_KEY` is correct in `.env`
2. **Restart Dev Server**: After adding the API key, restart your dev server
3. **Check Console**: Look for error messages in the browser console
4. **Resend Limits**: Free tier has sending limits - check your Resend dashboard

### API Key not loading?

- Vite requires environment variables to start with `VITE_`
- Restart the dev server after adding new environment variables
- Make sure `.env` file is in the project root

## Security Note

⚠️ **Important**: Exposing API keys in frontend code is not ideal for production. Consider:

1. Creating a backend API endpoint that handles email sending
2. Using Supabase Edge Functions to send emails server-side
3. Moving sensitive API keys to a secure backend

For now, this implementation works for development and small-scale production use.

## Optional: Welcome Email for Users

The code also includes a `sendWelcomeEmail()` function that can send a welcome email to new users. To enable it, uncomment the call in `src/lib/auth.ts`:

```typescript
// Also send welcome email to the user
sendWelcomeEmail(data.user.email || email, fullName).catch(error => {
  console.error('Failed to send welcome email:', error);
});
```

## Resend Free Tier Limits

- **100 emails per day**
- **3,000 emails per month**
- For higher volume, upgrade to a paid plan

## Support

If you encounter issues:
- Check [Resend Documentation](https://resend.com/docs)
- Review the implementation in `src/lib/email.ts`
- Check browser console and network tab for errors

