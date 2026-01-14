# Reminder Email System - Quick Start Guide

## ✅ What's Been Implemented

1. **Supabase Edge Function** (`supabase/functions/send-reminder-email/index.ts`)
   - Sends real SMTP emails using your mail configuration
   - Beautiful HTML email template with gradient design
   - Includes all reminder details (title, description, time, location, priority)

2. **Updated Reminder Poller** (`src/views/Calendar/useReminderPoller.js`)
   - Now calls the Edge Function instead of simulating emails
   - Runs every 60 seconds to check for due reminders
   - Shows toast notifications for email status

3. **Deployment Script** (`deploy-edge-function.sh`)
   - Automated deployment with prerequisite checks
   - Handles authentication and project linking
   - Easy one-command deployment

## 🚀 Quick Start

### Option 1: Automated Deployment (Recommended)

```bash
./deploy-edge-function.sh
```

The script will:
- ✅ Check if Supabase CLI is installed (installs if needed)
- ✅ Verify authentication (prompts login if needed)
- ✅ Link your project (asks for project ref if needed)
- ✅ Deploy the Edge Function

### Option 2: Manual Deployment

```bash
# 1. Install Supabase CLI (if not already installed)
npm install -g supabase

# 2. Login to Supabase
supabase login

# 3. Link your project (get ref from Supabase Dashboard → Settings → General)
supabase link --project-ref YOUR_PROJECT_REF

# 4. Deploy the function
supabase functions deploy send-reminder-email
```

## 📧 Testing the Email System

### Step 1: Set a Test Reminder

1. Navigate to http://localhost:5173/reminders
2. Click the "Create" button → "Set a Reminder"
3. Fill in the details:
   - **Name**: "Test Email Reminder"
   - **Description**: "Testing the email notification system"
   - **Date**: Today
   - **Time**: 1-2 minutes from now
4. Click "Add"

### Step 2: Wait for the Email

- The poller checks every 60 seconds
- When the reminder time passes, you'll see a toast notification
- Check your email inbox (and spam folder)
- Email should arrive within 1-2 minutes

### Step 3: Verify Email Content

The email will include:
- ✅ Beautiful gradient header
- ✅ Reminder title and description
- ✅ Formatted date and time
- ✅ Location (if provided)
- ✅ Priority badge (color-coded)
- ✅ Category
- ✅ Professional footer

## 🔍 Monitoring & Debugging

### View Function Logs

```bash
# Real-time logs
supabase functions logs send-reminder-email --follow

# Recent logs
supabase functions logs send-reminder-email
```

### Common Issues

**❌ "Function not found" error**
- Solution: Deploy the function first using `./deploy-edge-function.sh`

**❌ "SMTP connection failed"**
- Check your mail configuration in Settings → Configurations → Mail
- Verify SMTP credentials are correct
- Ensure the config status is "Active" and usage type is "Reminders"

**❌ "No email received"**
- Check spam/junk folder
- Verify the reminder time has passed
- Check function logs for errors
- Ensure the app is open (poller needs to run)

**❌ Toast shows error**
- Check browser console for details
- View Edge Function logs
- Verify mail configuration

## 📊 Email Template Preview

The email includes:
```
┌─────────────────────────────────────┐
│   📅 Reminder Notification          │  ← Purple gradient header
├─────────────────────────────────────┤
│                                     │
│  [Reminder Title]                   │  ← Large, bold
│  [Description]                      │  ← If provided
│                                     │
│  ⏰ Time: [Formatted Date]          │
│  📍 Location: [If provided]         │
│  ⚡ Priority: [Color-coded badge]   │
│  🏷️ Category: [Category name]       │
│                                     │
│  This is an automated reminder...   │
│                                     │
├─────────────────────────────────────┤
│  © 2026 Sisgate PRO Hub             │  ← Footer
└─────────────────────────────────────┘
```

## 🎯 Current Limitations

1. **App Must Be Open**: The poller only runs when the app is open in the browser
2. **60-Second Interval**: Reminders are checked every 60 seconds, not real-time
3. **No Retry Logic**: Failed emails won't be retried automatically

## 🚀 Future Enhancements

To make the system fully production-ready, consider:

1. **Database Triggers** - Automatically send emails when reminders are due
2. **Supabase Cron Jobs** - Run the check every minute on the server
3. **Retry Queue** - Automatically retry failed email sends
4. **Email Templates** - Store customizable templates in the database
5. **Delivery Tracking** - Track email open rates and delivery status

## 📝 Files Modified

- ✅ `supabase/functions/send-reminder-email/index.ts` - Edge Function
- ✅ `src/views/Calendar/useReminderPoller.js` - Updated to call Edge Function
- ✅ `deploy-edge-function.sh` - Deployment automation
- ✅ `EDGE_FUNCTION_DEPLOYMENT.md` - Detailed deployment guide
- ✅ `REMINDER_EMAIL_SETUP.md` - Original implementation guide

## 🆘 Need Help?

1. Check the deployment guide: `EDGE_FUNCTION_DEPLOYMENT.md`
2. View function logs: `supabase functions logs send-reminder-email`
3. Test the mail configuration in Settings → Configurations → Mail
4. Verify your SMTP credentials are correct

## ✨ Success Checklist

- [ ] Supabase CLI installed
- [ ] Logged in to Supabase
- [ ] Project linked
- [ ] Edge Function deployed
- [ ] Mail configuration is Active
- [ ] Test reminder created
- [ ] Email received successfully

Once all items are checked, your reminder email system is fully operational! 🎉
