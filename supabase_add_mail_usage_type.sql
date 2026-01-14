ALTER TABLE app_mail_configs 
ADD COLUMN IF NOT EXISTS usage_type TEXT DEFAULT 'Info';
