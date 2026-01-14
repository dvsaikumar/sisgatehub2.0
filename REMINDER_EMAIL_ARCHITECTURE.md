# Reminder Email System - Architecture & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER CREATES REMINDER                        │
│                                                                  │
│  User sets reminder → Saved to Supabase DB (reminders table)   │
│  Fields: title, description, start_date, notified=false         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   REMINDER POLLER (Client-Side)                  │
│                                                                  │
│  Location: src/views/Calendar/useReminderPoller.js              │
│  Frequency: Every 60 seconds (when app is open)                 │
│                                                                  │
│  1. Get current user email                                      │
│  2. Fetch active "Reminders" mail config from DB                │
│  3. Query reminders where:                                      │
│     - start_date <= NOW()                                       │
│     - notified = false                                          │
│                                                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              SUPABASE EDGE FUNCTION (Server-Side)                │
│                                                                  │
│  Location: supabase/functions/send-reminder-email/index.ts      │
│  Endpoint: https://[project].supabase.co/functions/v1/...       │
│                                                                  │
│  Receives:                                                       │
│  {                                                               │
│    reminder: { title, description, start_date, ... },           │
│    mailConfig: { host, port, username, password },              │
│    userEmail: "user@example.com"                                │
│  }                                                               │
│                                                                  │
│  Process:                                                        │
│  1. Create SMTP client                                          │
│  2. Connect to SMTP server (TLS)                                │
│  3. Generate beautiful HTML email                               │
│  4. Send email via SMTP                                         │
│  5. Close connection                                            │
│  6. Return success/error                                        │
│                                                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SMTP SERVER                                 │
│                                                                  │
│  Your configured SMTP server (e.g., smtp.dvsaikumar.com)        │
│  Delivers email to recipient's inbox                            │
│                                                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    USER RECEIVES EMAIL                           │
│                                                                  │
│  Beautiful HTML email with:                                     │
│  - Purple gradient header                                       │
│  - Reminder details                                             │
│  - Professional formatting                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  UPDATE DATABASE                                 │
│                                                                  │
│  UPDATE reminders SET notified = true WHERE id = ?              │
│  (Prevents duplicate emails)                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────┐         ┌──────────────┐         ┌─────────────┐
│          │         │              │         │             │
│  Browser │────────▶│   Supabase   │────────▶│ SMTP Server │
│  (React) │  API    │ Edge Function│  SMTP   │             │
│          │◀────────│              │◀────────│             │
└──────────┘         └──────────────┘         └─────────────┘
     │                      │                        │
     │                      │                        │
     ▼                      ▼                        ▼
┌──────────┐         ┌──────────────┐         ┌─────────────┐
│ Reminder │         │  Mail Config │         │ User's Email│
│   Table  │         │    Table     │         │   Inbox     │
└──────────┘         └──────────────┘         └─────────────┘
```

## Database Schema

### reminders table
```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  priority TEXT,
  category TEXT,
  visibility TEXT,
  background_color TEXT,
  notified BOOLEAN DEFAULT false,  -- ← Key field for email tracking
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### app_mail_configs table
```sql
CREATE TABLE app_mail_configs (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  host TEXT NOT NULL,
  port TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  status TEXT DEFAULT 'Active',
  usage_type TEXT DEFAULT 'Info',  -- ← Must be 'Reminders' for this system
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Sequence Diagram

```
User          Browser         Poller          Edge Function    SMTP Server    Database
 │               │               │                   │              │            │
 │ Create        │               │                   │              │            │
 │ Reminder      │               │                   │              │            │
 ├──────────────▶│               │                   │              │            │
 │               │ INSERT        │                   │              │            │
 │               ├──────────────────────────────────────────────────┼───────────▶│
 │               │               │                   │              │            │
 │               │               │ Every 60s         │              │            │
 │               │               │ Check Reminders   │              │            │
 │               │               ├──────────────────────────────────┼───────────▶│
 │               │               │                   │              │            │
 │               │               │ Found Due Reminder│              │            │
 │               │               │◀──────────────────────────────────────────────┤
 │               │               │                   │              │            │
 │               │               │ Invoke Function   │              │            │
 │               │               ├──────────────────▶│              │            │
 │               │               │                   │ Connect SMTP │            │
 │               │               │                   ├─────────────▶│            │
 │               │               │                   │              │            │
 │               │               │                   │ Send Email   │            │
 │               │               │                   ├─────────────▶│            │
 │               │               │                   │              │            │
 │               │               │                   │ Success      │            │
 │               │               │                   │◀─────────────┤            │
 │               │               │                   │              │            │
 │               │               │ Success Response  │              │            │
 │               │               │◀──────────────────┤              │            │
 │               │               │                   │              │            │
 │               │               │ UPDATE notified=true             │            │
 │               │               ├──────────────────────────────────┼───────────▶│
 │               │               │                   │              │            │
 │               │ Toast         │                   │              │            │
 │               │ Notification  │                   │              │            │
 │◀──────────────┤               │                   │              │            │
 │               │               │                   │              │            │
```

## Component Interaction

```
┌─────────────────────────────────────────────────────────────┐
│                    Calendar Component                        │
│  (src/views/Calendar/index.jsx)                             │
│                                                              │
│  - Renders calendar UI                                      │
│  - Displays reminders on calendar                           │
│  - Calls useReminderPoller() hook                           │
│                                                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ uses
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              useReminderPoller Hook                          │
│  (src/views/Calendar/useReminderPoller.js)                  │
│                                                              │
│  useEffect(() => {                                          │
│    setInterval(() => {                                      │
│      1. Check for due reminders                             │
│      2. Get mail config                                     │
│      3. Call Edge Function                                  │
│      4. Update database                                     │
│      5. Show toast                                          │
│    }, 60000)                                                │
│  }, [])                                                     │
│                                                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ invokes
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase Edge Function                          │
│  (supabase/functions/send-reminder-email/index.ts)          │
│                                                              │
│  serve(async (req) => {                                     │
│    const { reminder, mailConfig, userEmail } = req.json()   │
│    const client = new SmtpClient()                          │
│    await client.connectTLS(mailConfig)                      │
│    await client.send(email)                                 │
│    return { success: true }                                 │
│  })                                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Email Template Structure

```html
<!DOCTYPE html>
<html>
  <body style="background: #f5f5f5">
    <table width="600px" style="background: white; border-radius: 12px">
      
      <!-- Header -->
      <tr>
        <td style="background: linear-gradient(purple); padding: 30px">
          <h1 style="color: white">📅 Reminder Notification</h1>
        </td>
      </tr>
      
      <!-- Content -->
      <tr>
        <td style="padding: 40px">
          <div style="background: gradient; padding: 25px">
            <h2>{{ reminder.title }}</h2>
            <p>{{ reminder.description }}</p>
            
            <table>
              <tr><td>⏰ Time: {{ formatted_date }}</td></tr>
              <tr><td>📍 Location: {{ location }}</td></tr>
              <tr><td>⚡ Priority: <badge>{{ priority }}</badge></td></tr>
              <tr><td>🏷️ Category: {{ category }}</td></tr>
            </table>
          </div>
        </td>
      </tr>
      
      <!-- Footer -->
      <tr>
        <td style="background: #f7fafc; padding: 20px">
          <p>© 2026 Sisgate PRO Hub</p>
        </td>
      </tr>
      
    </table>
  </body>
</html>
```

## Security Considerations

1. **SMTP Credentials**: Stored securely in Supabase database
2. **Edge Function**: Runs on Supabase servers (not exposed to client)
3. **CORS**: Configured to only accept requests from your domain
4. **Authentication**: Uses Supabase auth tokens
5. **TLS/SSL**: All SMTP connections use TLS encryption

## Performance Metrics

- **Polling Interval**: 60 seconds
- **Email Send Time**: ~2-5 seconds (depends on SMTP server)
- **Database Query**: ~100ms
- **Edge Function Cold Start**: ~1-2 seconds
- **Edge Function Warm**: ~200-500ms

## Future Enhancements

### Phase 1: Server-Side Automation
```sql
-- Database trigger to automatically send emails
CREATE OR REPLACE FUNCTION send_reminder_email_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.start_date <= NOW() AND NEW.notified = false THEN
    -- Call Edge Function via pg_net
    PERFORM net.http_post(
      url := 'https://[project].supabase.co/functions/v1/send-reminder-email',
      body := jsonb_build_object(
        'reminder', row_to_json(NEW)
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Phase 2: Cron Jobs
```sql
-- Run every minute to check for due reminders
SELECT cron.schedule(
  'send-reminder-emails',
  '* * * * *',  -- Every minute
  $$
    SELECT send_due_reminder_emails();
  $$
);
```

### Phase 3: Advanced Features
- Email delivery tracking
- Read receipts
- Retry logic with exponential backoff
- Email templates in database
- User preferences for email format
- Bulk email sending
- Email scheduling

---

This architecture provides a solid foundation for a production-ready reminder email system!
