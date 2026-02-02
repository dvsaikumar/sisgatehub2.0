import { supabase } from '../configs/supabaseClient';
import { AuditLog } from '../models';

export const AuditService = {
    /**
     * Log a user action to the database.
     * @param action The action name (e.g., 'LOGIN', 'VIEW_PAGE')
     * @param resource The target resource (e.g., '/dashboard', 'Doc: 123')
     * @param details Additional JSON metadata
     */
    logAction: async (action: string, resource?: string, details: any = {}) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const actionUpper = action.toUpperCase();
            const VALID_ACTIONS = ['LOGIN', 'LOGOUT', 'SIGNUP', 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'SEARCH', 'EXPORT', 'IMPORT', 'DOWNLOAD', 'UPLOAD', 'SHARE', 'UNSHARE', 'ARCHIVE', 'RESTORE', 'SEND_EMAIL', 'SEND_REMINDER', 'CHANGE_PASSWORD', 'CHANGE_SETTINGS', 'GRANT_ACCESS', 'REVOKE_ACCESS', 'OTHER'];

            let action_type = 'OTHER';
            if (VALID_ACTIONS.includes(actionUpper)) {
                action_type = actionUpper;
            } else if (actionUpper.includes('VIEW')) {
                action_type = 'VIEW';
            } else if (actionUpper.includes('CREATE')) {
                action_type = 'CREATE';
            } else if (actionUpper.includes('UPDATE')) {
                action_type = 'UPDATE';
            } else if (actionUpper.includes('DELETE')) {
                action_type = 'DELETE';
            }

            const { error } = await supabase
                .from('audit_logs')
                .insert({
                    user_id: session.user.id,
                    user_email: session.user.email,
                    action_type,
                    resource_name: resource,
                    action_description: action,
                    metadata: details,
                    created_at: new Date().toISOString(),
                });

            if (error) {
                console.error('Failed to log action:', error);
            }
        } catch (err: any) {
            // Ignore AbortError as it's common during navigation/unmount
            if (err?.name === 'AbortError' || err?.message?.includes('aborted') || err?.code === '20') {
                return;
            }
            console.error('AuditService Error:', err);
        }
    },

    /**
     * Fetch audit logs with optional filtering.
     * @param filters Object containing date range or user_id
     */
    fetchLogs: async ({ page = 0, pageSize = 20, userId, startDate, endDate }: any) => {
        let query = supabase
            .from('audit_logs')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (userId) {
            query = query.eq('user_id', userId);
        }

        if (startDate) {
            query = query.gte('created_at', startDate);
        }

        if (endDate) {
            query = query.lte('created_at', endDate);
        }

        const { data, count, error } = await query;

        if (error) throw error;

        return { data: (data as AuditLog[]) || [], count: count || 0 };
    },

    /**
     * Export all logs as CSV
     */
    exportLogs: async () => {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*, user:user_id(email)')
            .order('created_at', { ascending: false })
            .limit(10000); // Limit export size for safety

        if (error) throw error;
        return data;
    }
};
