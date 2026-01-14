-- =====================================================
-- AUDIT LOG SYSTEM FOR SISGATE HUB
-- =====================================================
-- This script creates a comprehensive audit logging system
-- that tracks all user actions and system events
-- =====================================================

-- 1. Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User Information
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    user_name TEXT,
    
    -- Action Details
    action_type TEXT NOT NULL, -- 'CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT', etc.
    resource_type TEXT NOT NULL, -- 'reminder', 'document', 'user', 'group', 'mail_config', etc.
    resource_id TEXT, -- ID of the affected resource
    resource_name TEXT, -- Name/title of the affected resource
    
    -- Action Context
    action_description TEXT, -- Human-readable description
    action_status TEXT DEFAULT 'success', -- 'success', 'failed', 'pending'
    
    -- Request Details
    ip_address TEXT,
    user_agent TEXT,
    request_method TEXT, -- 'GET', 'POST', 'PUT', 'DELETE'
    request_path TEXT,
    
    -- Data Changes (for UPDATE actions)
    old_values JSONB, -- Previous state
    new_values JSONB, -- New state
    changes JSONB, -- Specific fields that changed
    
    -- Additional Metadata
    metadata JSONB, -- Any additional context
    error_message TEXT, -- If action failed
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexing for performance
    CONSTRAINT valid_action_type CHECK (action_type IN (
        'CREATE', 'READ', 'UPDATE', 'DELETE', 
        'LOGIN', 'LOGOUT', 'SIGNUP',
        'EXPORT', 'IMPORT', 'DOWNLOAD', 'UPLOAD',
        'SHARE', 'UNSHARE', 'ARCHIVE', 'RESTORE',
        'SEND_EMAIL', 'SEND_REMINDER',
        'CHANGE_PASSWORD', 'CHANGE_SETTINGS',
        'GRANT_ACCESS', 'REVOKE_ACCESS',
        'OTHER'
    )),
    CONSTRAINT valid_action_status CHECK (action_status IN ('success', 'failed', 'pending'))
);

-- 2. Create indexes for fast querying
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_action_status ON audit_logs(action_status);
CREATE INDEX idx_audit_logs_user_email ON audit_logs(user_email);

-- Composite indexes for common queries
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action_type, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id, created_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Note: Admin policy disabled since user_profiles doesn't have a role column
-- To enable admin access, add a 'role' column to user_profiles first
 CREATE POLICY "Admins can view all audit logs"
 ON audit_logs FOR SELECT
 TO authenticated
 USING (
     EXISTS (
        SELECT 1 FROM user_profiles
         WHERE user_profiles.id = auth.uid()
         AND user_profiles.role = 'admin'
     )
);

-- Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Only system/service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
ON audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Prevent updates and deletes (audit logs are immutable)
CREATE POLICY "Audit logs cannot be updated"
ON audit_logs FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Audit logs cannot be deleted"
ON audit_logs FOR DELETE
TO authenticated
USING (false);

-- 5. Create function to log actions
CREATE OR REPLACE FUNCTION log_audit_action(
    p_action_type TEXT,
    p_resource_type TEXT,
    p_resource_id TEXT DEFAULT NULL,
    p_resource_name TEXT DEFAULT NULL,
    p_action_description TEXT DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL,
    p_action_status TEXT DEFAULT 'success',
    p_error_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_user_name TEXT;
    v_changes JSONB;
    v_audit_id UUID;
BEGIN
    -- Get current user info
    v_user_id := auth.uid();
    
    IF v_user_id IS NOT NULL THEN
        SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
        SELECT display_name INTO v_user_name FROM user_profiles WHERE id = v_user_id;
    END IF;
    
    -- Calculate changes if both old and new values provided
    IF p_old_values IS NOT NULL AND p_new_values IS NOT NULL THEN
        v_changes := jsonb_object_agg(
            key,
            jsonb_build_object(
                'old', p_old_values->key,
                'new', p_new_values->key
            )
        )
        FROM jsonb_each(p_new_values)
        WHERE p_old_values->key IS DISTINCT FROM p_new_values->key;
    END IF;
    
    -- Insert audit log
    INSERT INTO audit_logs (
        user_id,
        user_email,
        user_name,
        action_type,
        resource_type,
        resource_id,
        resource_name,
        action_description,
        action_status,
        old_values,
        new_values,
        changes,
        metadata,
        error_message
    ) VALUES (
        v_user_id,
        v_user_email,
        v_user_name,
        p_action_type,
        p_resource_type,
        p_resource_id,
        p_resource_name,
        p_action_description,
        p_action_status,
        p_old_values,
        p_new_values,
        v_changes,
        p_metadata,
        p_error_message
    ) RETURNING id INTO v_audit_id;
    
    RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create automatic triggers for key tables

-- Trigger function for reminders table
CREATE OR REPLACE FUNCTION audit_reminders_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM log_audit_action(
            'CREATE',
            'reminder',
            NEW.id::TEXT,
            NEW.title,
            'Created new reminder',
            NULL,
            to_jsonb(NEW),
            jsonb_build_object('trigger', 'auto')
        );
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM log_audit_action(
            'UPDATE',
            'reminder',
            NEW.id::TEXT,
            NEW.title,
            'Updated reminder',
            to_jsonb(OLD),
            to_jsonb(NEW),
            jsonb_build_object('trigger', 'auto')
        );
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM log_audit_action(
            'DELETE',
            'reminder',
            OLD.id::TEXT,
            OLD.title,
            'Deleted reminder',
            to_jsonb(OLD),
            NULL,
            jsonb_build_object('trigger', 'auto')
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to reminders table
DROP TRIGGER IF EXISTS audit_reminders_trigger ON reminders;
CREATE TRIGGER audit_reminders_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reminders
    FOR EACH ROW EXECUTE FUNCTION audit_reminders_changes();

-- Trigger function for user_profiles table
CREATE OR REPLACE FUNCTION audit_user_profiles_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM log_audit_action(
            'CREATE',
            'user_profile',
            NEW.id::TEXT,
            NEW.display_name,
            'Created user profile',
            NULL,
            to_jsonb(NEW),
            jsonb_build_object('trigger', 'auto')
        );
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM log_audit_action(
            'UPDATE',
            'user_profile',
            NEW.id::TEXT,
            NEW.display_name,
            'Updated user profile',
            to_jsonb(OLD),
            to_jsonb(NEW),
            jsonb_build_object('trigger', 'auto')
        );
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM log_audit_action(
            'DELETE',
            'user_profile',
            OLD.id::TEXT,
            OLD.display_name,
            'Deleted user profile',
            to_jsonb(OLD),
            NULL,
            jsonb_build_object('trigger', 'auto')
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to user_profiles table
DROP TRIGGER IF EXISTS audit_user_profiles_trigger ON user_profiles;
CREATE TRIGGER audit_user_profiles_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION audit_user_profiles_changes();

-- Trigger function for app_mail_configs table
CREATE OR REPLACE FUNCTION audit_mail_configs_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_new_safe JSONB;
    v_old_safe JSONB;
BEGIN
    -- Remove sensitive data (password) from logs
    IF NEW IS NOT NULL THEN
        v_new_safe := to_jsonb(NEW) - 'password';
    END IF;
    
    IF OLD IS NOT NULL THEN
        v_old_safe := to_jsonb(OLD) - 'password';
    END IF;
    
    IF TG_OP = 'INSERT' THEN
        PERFORM log_audit_action(
            'CREATE',
            'mail_config',
            NEW.id::TEXT,
            NEW.name,
            'Created mail configuration',
            NULL,
            v_new_safe,
            jsonb_build_object('trigger', 'auto')
        );
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM log_audit_action(
            'UPDATE',
            'mail_config',
            NEW.id::TEXT,
            NEW.name,
            'Updated mail configuration',
            v_old_safe,
            v_new_safe,
            jsonb_build_object('trigger', 'auto')
        );
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM log_audit_action(
            'DELETE',
            'mail_config',
            OLD.id::TEXT,
            OLD.name,
            'Deleted mail configuration',
            v_old_safe,
            NULL,
            jsonb_build_object('trigger', 'auto')
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to app_mail_configs table
DROP TRIGGER IF EXISTS audit_mail_configs_trigger ON app_mail_configs;
CREATE TRIGGER audit_mail_configs_trigger
    AFTER INSERT OR UPDATE OR DELETE ON app_mail_configs
    FOR EACH ROW EXECUTE FUNCTION audit_mail_configs_changes();

-- 7. Create view for audit log summary
CREATE OR REPLACE VIEW audit_logs_summary AS
SELECT 
    DATE(created_at) as date,
    action_type,
    resource_type,
    action_status,
    COUNT(*) as count,
    COUNT(DISTINCT user_id) as unique_users
FROM audit_logs
GROUP BY DATE(created_at), action_type, resource_type, action_status
ORDER BY date DESC, count DESC;

-- 8. Create view for recent user activity
CREATE OR REPLACE VIEW recent_user_activity AS
SELECT 
    al.user_id,
    al.user_email,
    al.user_name,
    al.action_type,
    al.resource_type,
    al.resource_name,
    al.action_description,
    al.created_at,
    al.action_status
FROM audit_logs al
WHERE al.created_at > NOW() - INTERVAL '7 days'
ORDER BY al.created_at DESC
LIMIT 100;

-- 9. Create function to get user activity
CREATE OR REPLACE FUNCTION get_user_activity(
    p_user_id UUID DEFAULT NULL,
    p_days_back INTEGER DEFAULT 30,
    p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
    id UUID,
    action_type TEXT,
    resource_type TEXT,
    resource_name TEXT,
    action_description TEXT,
    created_at TIMESTAMPTZ,
    action_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.id,
        al.action_type,
        al.resource_type,
        al.resource_name,
        al.action_description,
        al.created_at,
        al.action_status
    FROM audit_logs al
    WHERE 
        (p_user_id IS NULL OR al.user_id = p_user_id)
        AND al.created_at > NOW() - (p_days_back || ' days')::INTERVAL
    ORDER BY al.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create function to clean old audit logs (optional - for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(p_days_to_keep INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs
    WHERE created_at < NOW() - (p_days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Example 1: Log a manual action
-- SELECT log_audit_action(
--     'EXPORT',
--     'document',
--     'doc-123',
--     'Annual Report 2024',
--     'User exported document as PDF',
--     NULL,
--     NULL,
--     jsonb_build_object('format', 'pdf', 'size', '2.5MB')
-- );

-- Example 2: Get user activity for last 7 days
-- SELECT * FROM get_user_activity(auth.uid(), 7, 50);

-- Example 3: View audit summary
-- SELECT * FROM audit_logs_summary WHERE date > CURRENT_DATE - 30;

-- Example 4: Clean logs older than 1 year
-- SELECT cleanup_old_audit_logs(365);
