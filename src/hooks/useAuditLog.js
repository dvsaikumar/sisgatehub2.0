import { supabase } from '../configs/supabaseClient';

/**
 * Audit Logger Hook
 * Provides functions to log user actions throughout the application
 */

// Action types enum
export const AuditActionType = {
    CREATE: 'CREATE',
    READ: 'READ',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    SIGNUP: 'SIGNUP',
    EXPORT: 'EXPORT',
    IMPORT: 'IMPORT',
    DOWNLOAD: 'DOWNLOAD',
    UPLOAD: 'UPLOAD',
    SHARE: 'SHARE',
    UNSHARE: 'UNSHARE',
    ARCHIVE: 'ARCHIVE',
    RESTORE: 'RESTORE',
    SEND_EMAIL: 'SEND_EMAIL',
    SEND_REMINDER: 'SEND_REMINDER',
    CHANGE_PASSWORD: 'CHANGE_PASSWORD',
    CHANGE_SETTINGS: 'CHANGE_SETTINGS',
    GRANT_ACCESS: 'GRANT_ACCESS',
    REVOKE_ACCESS: 'REVOKE_ACCESS',
    OTHER: 'OTHER'
};

// Resource types enum
export const AuditResourceType = {
    REMINDER: 'reminder',
    DOCUMENT: 'document',
    USER: 'user',
    GROUP: 'group',
    MAIL_CONFIG: 'mail_config',
    TEMPLATE: 'template',
    SETTINGS: 'settings',
    AUDIT_LOG: 'audit_log',
    OTHER: 'other'
};

// Action status enum
export const AuditActionStatus = {
    SUCCESS: 'success',
    FAILED: 'failed',
    PENDING: 'pending'
};

/**
 * Log an audit action
 * @param {Object} params - Audit log parameters
 * @returns {Promise<Object>} - Result of the audit log operation
 */
export const logAuditAction = async ({
    actionType,
    resourceType,
    resourceId = null,
    resourceName = null,
    actionDescription = null,
    oldValues = null,
    newValues = null,
    metadata = null,
    actionStatus = AuditActionStatus.SUCCESS,
    errorMessage = null
}) => {
    try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.warn('Cannot log audit action: No authenticated user');
            return { success: false, error: 'No authenticated user' };
        }

        // Get user profile for additional info
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('display_name')
            .eq('id', user.id)
            .single();

        // Prepare audit log entry
        const auditLog = {
            user_id: user.id,
            user_email: user.email,
            user_name: profile?.display_name || null,
            action_type: actionType,
            resource_type: resourceType,
            resource_id: resourceId,
            resource_name: resourceName,
            action_description: actionDescription,
            action_status: actionStatus,
            old_values: oldValues,
            new_values: newValues,
            metadata: {
                ...metadata,
                user_agent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                screen_resolution: `${window.screen.width}x${window.screen.height}`
            },
            error_message: errorMessage
        };

        // Insert audit log
        const { data, error } = await supabase
            .from('audit_logs')
            .insert([auditLog])
            .select()
            .single();

        if (error) {
            console.error('Failed to log audit action:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error in logAuditAction:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Log a CREATE action
 */
export const logCreate = async (resourceType, resourceId, resourceName, newValues = null, metadata = null) => {
    return logAuditAction({
        actionType: AuditActionType.CREATE,
        resourceType,
        resourceId,
        resourceName,
        actionDescription: `Created ${resourceType}: ${resourceName}`,
        newValues,
        metadata
    });
};

/**
 * Log an UPDATE action
 */
export const logUpdate = async (resourceType, resourceId, resourceName, oldValues = null, newValues = null, metadata = null) => {
    return logAuditAction({
        actionType: AuditActionType.UPDATE,
        resourceType,
        resourceId,
        resourceName,
        actionDescription: `Updated ${resourceType}: ${resourceName}`,
        oldValues,
        newValues,
        metadata
    });
};

/**
 * Log a DELETE action
 */
export const logDelete = async (resourceType, resourceId, resourceName, oldValues = null, metadata = null) => {
    return logAuditAction({
        actionType: AuditActionType.DELETE,
        resourceType,
        resourceId,
        resourceName,
        actionDescription: `Deleted ${resourceType}: ${resourceName}`,
        oldValues,
        metadata
    });
};

/**
 * Log a READ action (for sensitive data access)
 */
export const logRead = async (resourceType, resourceId, resourceName, metadata = null) => {
    return logAuditAction({
        actionType: AuditActionType.READ,
        resourceType,
        resourceId,
        resourceName,
        actionDescription: `Viewed ${resourceType}: ${resourceName}`,
        metadata
    });
};

/**
 * Log an EXPORT action
 */
export const logExport = async (resourceType, resourceName, format, metadata = null) => {
    return logAuditAction({
        actionType: AuditActionType.EXPORT,
        resourceType,
        resourceName,
        actionDescription: `Exported ${resourceType} as ${format}`,
        metadata: { ...metadata, format }
    });
};

/**
 * Log a LOGIN action
 */
export const logLogin = async (metadata = null) => {
    return logAuditAction({
        actionType: AuditActionType.LOGIN,
        resourceType: AuditResourceType.USER,
        actionDescription: 'User logged in',
        metadata
    });
};

/**
 * Log a LOGOUT action
 */
export const logLogout = async (metadata = null) => {
    return logAuditAction({
        actionType: AuditActionType.LOGOUT,
        resourceType: AuditResourceType.USER,
        actionDescription: 'User logged out',
        metadata
    });
};

/**
 * Log a failed action
 */
export const logFailedAction = async (actionType, resourceType, errorMessage, metadata = null) => {
    return logAuditAction({
        actionType,
        resourceType,
        actionDescription: `Failed to ${actionType.toLowerCase()} ${resourceType}`,
        actionStatus: AuditActionStatus.FAILED,
        errorMessage,
        metadata
    });
};

/**
 * Get audit logs for current user
 */
export const getUserAuditLogs = async (daysBack = 30, limit = 100) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'No authenticated user' };
        }

        const { data, error } = await supabase
            .rpc('get_user_activity', {
                p_user_id: user.id,
                p_days_back: daysBack,
                p_limit: limit
            });

        if (error) {
            console.error('Failed to get user audit logs:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error in getUserAuditLogs:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get all audit logs (admin only)
 */
export const getAllAuditLogs = async (filters = {}) => {
    try {
        let query = supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false });

        // Apply filters
        if (filters.userId) {
            query = query.eq('user_id', filters.userId);
        }
        if (filters.actionType) {
            query = query.eq('action_type', filters.actionType);
        }
        if (filters.resourceType) {
            query = query.eq('resource_type', filters.resourceType);
        }
        if (filters.actionStatus) {
            query = query.eq('action_status', filters.actionStatus);
        }
        if (filters.startDate) {
            query = query.gte('created_at', filters.startDate);
        }
        if (filters.endDate) {
            query = query.lte('created_at', filters.endDate);
        }
        if (filters.limit) {
            query = query.limit(filters.limit);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Failed to get audit logs:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error in getAllAuditLogs:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get audit log summary
 */
export const getAuditLogSummary = async (daysBack = 30) => {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);

        const { data, error } = await supabase
            .from('audit_logs_summary')
            .select('*')
            .gte('date', startDate.toISOString().split('T')[0])
            .order('date', { ascending: false });

        if (error) {
            console.error('Failed to get audit log summary:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error in getAuditLogSummary:', error);
        return { success: false, error: error.message };
    }
};

// Export default object with all functions
const useAuditLog = {
    logAuditAction,
    logCreate,
    logUpdate,
    logDelete,
    logRead,
    logExport,
    logLogin,
    logLogout,
    logFailedAction,
    getUserAuditLogs,
    getAllAuditLogs,
    getAuditLogSummary,
    AuditActionType,
    AuditResourceType,
    AuditActionStatus
};

export default useAuditLog;
