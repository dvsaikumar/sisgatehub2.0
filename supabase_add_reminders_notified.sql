-- Add notified column to reminders to track sent emails
ALTER TABLE public.reminders 
ADD COLUMN IF NOT EXISTS notified BOOLEAN DEFAULT FALSE;

-- Create an index for performance on the poller
CREATE INDEX IF NOT EXISTS idx_reminders_notified_start_date 
ON public.reminders(notified, start_date);
