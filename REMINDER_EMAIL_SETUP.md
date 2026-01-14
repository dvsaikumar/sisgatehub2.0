# Reminder Email Implementation Guide

## Current Status
Your reminder system is configured correctly with:
- ✅ Active "Reminders" email configuration (SD Email)
- ✅ Reminder polling system running every 60 seconds
- ❌ **Email sending is currently SIMULATED only** (no actual emails sent)

## Why Emails Aren't Being Sent

The current code in `src/views/Calendar/useReminderPoller.js` (lines 43-73) only **simulates** email sending:
```javascript
// Simulate network delay for SMTP
await new Promise(r => setTimeout(r, 2000));
```

It shows a toast notification but doesn't actually send emails via SMTP.

---

## Solution Options

### Option 1: Quick Client-Side Solution (Development Only)
**Limitations**: 
- Requires user to have the app open
- Won't work if browser is closed
- Not suitable for production
- Security risk (exposes SMTP credentials to client)

### Option 2: Supabase Edge Function (Recommended for Production)
**Benefits**:
- ✅ Sends real emails via SMTP
- ✅ Works even when app is closed
- ✅ Secure (credentials stay on server)
- ✅ Can be triggered by database webhooks or cron jobs
- ✅ Production-ready

---

## Implementation: Supabase Edge Function

### Step 1: Create the Edge Function

Create a new directory structure:
```
supabase/
  functions/
    send-reminder-email/
      index.ts
```

### Step 2: Edge Function Code

**File: `supabase/functions/send-reminder-email/index.ts`**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { reminder, mailConfig, userEmail } = await req.json()

    // Create SMTP client
    const client = new SmtpClient()

    await client.connectTLS({
      hostname: mailConfig.host,
      port: parseInt(mailConfig.port),
      username: mailConfig.username,
      password: mailConfig.password,
    })

    // Send email
    await client.send({
      from: mailConfig.username,
      to: userEmail,
      subject: `Reminder: ${reminder.title}`,
      content: `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #2563eb;">📅 Reminder Notification</h2>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">${reminder.title}</h3>
              ${reminder.description ? `<p>${reminder.description}</p>` : ''}
              <p><strong>Time:</strong> ${new Date(reminder.start_date).toLocaleString()}</p>
              ${reminder.location ? `<p><strong>Location:</strong> ${reminder.location}</p>` : ''}
              <p><strong>Priority:</strong> <span style="color: #dc2626;">${reminder.priority}</span></p>
            </div>
            <p style="color: #6b7280; font-size: 12px;">
              This is an automated reminder from Sisgate PRO Hub.
            </p>
          </body>
        </html>
      `,
      html: true,
    })

    await client.close()

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

### Step 3: Deploy the Edge Function

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy send-reminder-email
```

### Step 4: Update the Reminder Poller

Update `src/views/Calendar/useReminderPoller.js` to call the Edge Function:

```javascript
// Replace lines 43-73 with:
for (const reminder of dueReminders) {
    toast.promise(
        (async () => {
            // Call the Edge Function
            const { data, error } = await supabase.functions.invoke('send-reminder-email', {
                body: {
                    reminder,
                    mailConfig,
                    userEmail: user.email
                }
            });

            if (error) throw error;

            // Mark as notified in DB
            const { error: updateError } = await supabase
                .from('reminders')
                .update({ notified: true })
                .eq('id', reminder.id);

            if (updateError) throw updateError;

            return data;
        })(),
        {
            loading: `Sending reminder "${reminder.title}" to ${user.email}...`,
            success: `✅ Reminder email sent to ${user.email}!`,
            error: `❌ Failed to send reminder email`,
        },
        {
            id: `reminder-${reminder.id}`,
        }
    );
}
```

---

## Alternative: Use a Third-Party Email Service

Instead of direct SMTP, you could use services like:
- **Resend** (https://resend.com) - Modern email API
- **SendGrid** - Popular email service
- **Mailgun** - Transactional email service
- **AWS SES** - Amazon's email service

These services provide better deliverability and simpler APIs.

---

## Testing the Email System

1. **Set a reminder** for 1-2 minutes in the future
2. **Keep the app open** (for the poller to run)
3. **Wait for the reminder time** to pass
4. **Check your email** (and spam folder)
5. **Verify the toast notification** appears

---

## Troubleshooting

### No emails received?
1. Check if the mail configuration is Active
2. Verify SMTP credentials are correct
3. Check spam/junk folder
4. Ensure the reminder time has passed
5. Check browser console for errors

### Toast shows but no email?
- The Edge Function may not be deployed
- SMTP credentials might be incorrect
- Firewall blocking SMTP port

### Want to test immediately?
Set a reminder for the current time or 1 minute ago, and the poller will detect it on the next check (within 60 seconds).

---

## Next Steps

1. ✅ Set up Supabase Edge Function
2. ✅ Deploy the function
3. ✅ Update the reminder poller code
4. ✅ Test with a sample reminder
5. ✅ Monitor logs for any errors

Would you like me to help you implement the Edge Function or set up a third-party email service?
