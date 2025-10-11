# Automatic User Profile Creation - Setup Guide

This guide explains how to automatically create `user_profiles` records when users sign up, eliminating manual data entry.

## The Problem

Currently, when a new user signs up:
1. ✅ User account is created in `auth.users`
2. ❌ You must manually create a record in `user_profiles`
3. ❌ You must manually assign them to an organization

This is tedious and error-prone!

## The Solution

Use a **Supabase Database Trigger** that automatically creates `user_profiles` records when users sign up.

---

## Setup Instructions

### Step 1: Allow NULL organization_id

Run this SQL in your Supabase SQL Editor:

**File:** `modify_user_profiles_allow_null_org.sql`

```sql
ALTER TABLE public.user_profiles 
ALTER COLUMN organization_id DROP NOT NULL;
```

**Why:** New users won't have an organization yet. Admins will assign them later.

### Step 2: Create the Automatic Trigger

Run this SQL in your Supabase SQL Editor:

**File:** `create_user_profile_trigger.sql`

This creates a trigger function that:
- Watches for new users in `auth.users`
- Automatically extracts their name from metadata
- Creates a matching `user_profiles` record
- Sets `organization_id` to `NULL` (to be assigned by admin)

---

## How It Works

### When Someone Signs Up:

**Email/Password Signup:**
```
User fills out form:
  - Email: john@example.com
  - Password: ********
  - Full Name: John Doe

1. Supabase creates auth.users record
2. Trigger automatically fires
3. Creates user_profiles:
     - first_name: "John"
     - last_name: "Doe"
     - organization_id: NULL
     - is_active: true
```

**Google OAuth Signup:**
```
User clicks "Sign in with Google"

1. Google provides: name, email, avatar
2. Supabase creates auth.users record
3. Trigger automatically fires
4. Creates user_profiles:
     - first_name: (from Google)
     - last_name: (from Google)
     - organization_id: NULL
     - is_active: true
```

### Name Extraction Logic:

The trigger tries these sources in order:
1. `display_name` from user metadata (used by your signup form)
2. `full_name` from user metadata (used by Google OAuth)
3. `name` from user metadata (another OAuth fallback)
4. Email username as last resort (john@example.com → "john")

---

## Admin Workflow After Setup

### Old Workflow (Manual) ❌

1. User signs up
2. Check `auth.users` for new user
3. Manually create `user_profiles` record
4. Copy user_id, enter first_name, last_name
5. Assign to organization

**Time:** ~2-3 minutes per user

### New Workflow (Automatic) ✅

1. User signs up
2. `user_profiles` record created automatically
3. Admin assigns user to organization (1 click in admin panel)

**Time:** ~10 seconds per user

---

## Admin Panel - Assigning Organizations

After the trigger is set up, your admin panel should show:

**Unassigned Users Tab:**
```
┌───────────────────────────────────────────────────┐
│ Users Pending Organization Assignment             │
├───────────────────────────────────────────────────┤
│ John Doe (john@example.com)                       │
│ Created: 2 minutes ago                            │
│ [Assign to Organization ▼] [Deactivate]          │
├───────────────────────────────────────────────────┤
│ Jane Smith (jane@example.com)                     │
│ Created: 1 hour ago                               │
│ [Assign to Organization ▼] [Deactivate]          │
└───────────────────────────────────────────────────┘
```

---

## Email Notifications

### Current Issue: Emails Not Sending

**Possible Causes:**

1. **Missing Resend API Key**
   - Check local `.env` file has: `VITE_RESEND_API_KEY=re_xxx`
   - Check Netlify has the environment variable set
   - Redeploy after adding to Netlify

2. **Only Sends on Email Signup**
   - Email notifications trigger ONLY for email/password signups
   - Google OAuth signups don't trigger email (user is already verified by Google)

3. **Browser Console Errors**
   - Open F12 console during signup
   - Look for: "Resend not configured" or "Failed to send notification email"

### To Test Email Notifications:

1. Make sure `VITE_RESEND_API_KEY` is set (locally or Netlify)
2. Sign up a NEW user with email/password
3. Check browser console for errors
4. Check leovoiceagent@gmail.com for notification

---

## Database Schema Changes

### user_profiles Table

**Before:**
```sql
CREATE TABLE user_profiles (
  organization_id uuid NOT NULL  -- Required!
  ...
)
```

**After:**
```sql
CREATE TABLE user_profiles (
  organization_id uuid NULL  -- Optional until assigned
  ...
)
```

---

## Verification

### Test the Automatic Creation:

1. **Run the SQL files** in Supabase SQL Editor:
   - `modify_user_profiles_allow_null_org.sql`
   - `create_user_profile_trigger.sql`

2. **Create a test user** (use a temporary email):
   - Go to your site `/register`
   - Sign up with: test@example.com / SecurePass123 / "Test User"

3. **Check Supabase:**
   ```sql
   SELECT * FROM auth.users 
   WHERE email = 'test@example.com';
   
   SELECT * FROM user_profiles 
   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@example.com');
   ```

4. **Verify:**
   - ✅ `user_profiles` record exists
   - ✅ `first_name` = "Test"
   - ✅ `last_name` = "User"
   - ✅ `organization_id` = NULL
   - ✅ `is_active` = true

---

## Troubleshooting

### Issue: user_profiles record not created

**Check:**
1. Trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
2. Function exists: `SELECT * FROM pg_proc WHERE proname = 'handle_new_user';`
3. Check trigger logs in Supabase Dashboard → Database → Logs

### Issue: Names not extracted correctly

**Check user metadata:**
```sql
SELECT 
  email,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'user@example.com';
```

The trigger looks for: `display_name`, `full_name`, or `name` in metadata.

---

## Benefits

### Before Trigger:
- ❌ Manual data entry required
- ❌ Risk of forgetting to create profile
- ❌ Users can't access dashboard until profile created
- ❌ Time-consuming for admin

### After Trigger:
- ✅ Automatic profile creation
- ✅ No risk of missing profiles
- ✅ Users ready for organization assignment
- ✅ Admin only assigns organization (quick!)
- ✅ Scalable for many users

---

## Summary

### What You Need To Do:

1. **Run SQL files in Supabase** (in this order):
   - `modify_user_profiles_allow_null_org.sql`
   - `create_user_profile_trigger.sql`

2. **Test with a new signup**

3. **Assign users to organizations** via admin panel

4. **Check email notifications:**
   - Verify `VITE_RESEND_API_KEY` is set in Netlify
   - Test with email/password signup (not Google OAuth)

That's it! User profiles will now be created automatically! 🎉

---

## Files Included

- `modify_user_profiles_allow_null_org.sql` - Allows NULL organization_id
- `create_user_profile_trigger.sql` - Creates automatic trigger
- `AUTO_USER_PROFILE_SETUP.md` - This guide

---

**Last Updated:** October 10, 2025

