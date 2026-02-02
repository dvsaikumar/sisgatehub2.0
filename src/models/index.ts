export interface User {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
}

export interface Document {
    id: string;
    name: string;
    type: string;
    content?: any; // strict typing for content can be added later if structure is known
    created_at: string;
    updated_at: string;
    user_id: string;
}

export interface Reminder {
    id: string;
    title: string;
    description?: string;
    schedule_at: string;
    created_at: string;
    user_id: string;
    is_completed?: boolean;
}

export interface DashboardStats {
    totalDocuments: number;
    upcomingReminders: number;
    recentActivity: number;
    storageUsed: string;
    teamMemberCount: number;
    efficiency: number;
}

export interface AuditLog {
    id: string;
    user_id: string;
    action_type: 'LOGIN' | 'LOGOUT' | 'SIGNUP' | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'SEARCH' | 'EXPORT' | 'IMPORT' | 'DOWNLOAD' | 'UPLOAD' | 'SHARE' | 'UNSHARE' | 'ARCHIVE' | 'RESTORE' | 'SEND_EMAIL' | 'SEND_REMINDER' | 'CHANGE_PASSWORD' | 'CHANGE_SETTINGS' | 'GRANT_ACCESS' | 'REVOKE_ACCESS' | 'OTHER';
    resource_type?: string;
    resource_id?: string;
    resource_name?: string;
    metadata?: any;
    ip_address?: string;
    created_at: string;
    user?: User; // Joined user data
}
