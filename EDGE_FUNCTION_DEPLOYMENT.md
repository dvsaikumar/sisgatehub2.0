# Supabase Edge Function Deployment Guide

## Prerequisites

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

## Deployment Steps

### Step 1: Link Your Project

First, you need to get your project reference ID from your Supabase dashboard:
- Go to https://app.supabase.com
- Select your project
- Go to Settings → General
- Copy your "Reference ID"

Then link your local project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### Step 2: Deploy the Edge Function

```bash
supabase functions deploy send-reminder-email
```

### Step 3: Verify Deployment

After deployment, you should see output like:
```
Deploying function send-reminder-email...
Function deployed successfully!
Function URL: https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminder-email
```

### Step 4: Test the Function

You can test the function manually using curl:

```bash
curl -i --location --request POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminder-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "reminder": {
      "id": "test-123",
      "title": "Test Reminder",
      "description": "This is a test reminder",
      "start_date": "2026-01-12T14:00:00Z",
      "priority": "High",
      "category": "Important"
    },
    "mailConfig": {
      "host": "smtp.example.com",
      "port": "587",
      "username": "your-email@example.com",
      "password": "your-password"
    },
    "userEmail": "recipient@example.com"
  }'
```

## Alternative: Quick Deploy Script

I've created a deployment script for you. Run:

```bash
chmod +x deploy-edge-function.sh
./deploy-edge-function.sh
```

## Troubleshooting

### "supabase: command not found"
Install the Supabase CLI:
```bash
npm install -g supabase
```

### "Not logged in"
Run:
```bash
supabase login
```

### "Project not linked"
Make sure you've run:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### Function deployed but emails not sending
1. Check the function logs:
   ```bash
   supabase functions logs send-reminder-email
   ```
2. Verify your SMTP credentials in the Mail Configuration
3. Check if the reminder time has passed
4. Ensure the mail config status is "Active"

## Monitoring

View real-time logs:
```bash
supabase functions logs send-reminder-email --follow
```

## Next Steps

After deployment:
1. ✅ Set a test reminder for 1-2 minutes in the future
2. ✅ Keep the app open (for the poller to run)
3. ✅ Wait for the reminder time to pass
4. ✅ Check your email inbox (and spam folder)
5. ✅ Verify the toast notification appears

## Important Notes

- The Edge Function runs on Supabase's servers, not your local machine
- SMTP credentials are securely passed from your database
- Emails will be sent even if your browser is closed (once we set up database triggers)
- The function automatically handles HTML email formatting

## Future Enhancements

Consider setting up:
1. **Database Triggers**: Automatically trigger emails without needing the app open
2. **Cron Jobs**: Run the reminder check every minute on the server
3. **Email Templates**: Store customizable email templates in the database
4. **Retry Logic**: Automatically retry failed email sends
