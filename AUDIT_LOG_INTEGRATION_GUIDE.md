# 🔍 Audit Log System - Integration Guide

## Overview

The Audit Log system tracks all user actions and system events in your Sisgate Hub application. This guide shows you how to integrate audit logging into your existing features.

---

## 📋 Table of Contents

1. [Setup Instructions](#setup-instructions)
2. [Basic Usage](#basic-usage)
3. [Integration Examples](#integration-examples)
4. [Best Practices](#best-practices)
5. [Viewing Audit Logs](#viewing-audit-logs)

---

## 🚀 Setup Instructions

### Step 1: Run the SQL Setup Script

Execute the SQL script to create the audit log infrastructure:

```bash
# Option 1: Using Supabase Dashboard
1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql
2. Copy the contents of AUDIT_LOG_SETUP.sql
3. Paste and run the script

# Option 2: Using Supabase CLI (if you have it installed)
supabase db push
```

### Step 2: Verify Tables Created

Check that these tables/functions were created:
- ✅ `audit_logs` table
- ✅ `audit_logs_summary` view
- ✅ `recent_user_activity` view
- ✅ `log_audit_action()` function
- ✅ Triggers on `reminders`, `user_profiles`, `app_mail_configs`

### Step 3: Add Audit Logs Route

Update your routing configuration to include the Audit Logs page:

```javascript
// In your RouteList.jsx or routes configuration
import AuditLogs from '../views/AuditLogs';

// Add this route
{
  path: '/audit-logs',
  element: <AuditLogs />,
  name: 'Audit Logs'
}
```

### Step 4: Add to Sidebar Menu

```javascript
// In your SidebarMenu.jsx or navigation config
{
  icon: 'activity',
  label: 'Audit Logs',
  to: '/audit-logs',
  // Optional: Only show for admins
  visible: userRole === 'admin'
}
```

---

## 📖 Basic Usage

### Import the Hook

```javascript
import useAuditLog, { 
  AuditActionType, 
  AuditResourceType 
} from '../hooks/useAuditLog';
```

### Log a Simple Action

```javascript
// Log a CREATE action
await useAuditLog.logCreate(
  AuditResourceType.REMINDER,
  reminderId,
  reminderTitle
);

// Log an UPDATE action
await useAuditLog.logUpdate(
  AuditResourceType.DOCUMENT,
  documentId,
  documentName,
  oldData,  // Previous state
  newData   // New state
);

// Log a DELETE action
await useAuditLog.logDelete(
  AuditResourceType.USER,
  userId,
  userName
);
```

---

## 🔧 Integration Examples

### Example 1: Reminder Creation (SetReminder.jsx)

```javascript
import useAuditLog, { AuditResourceType } from '../../hooks/useAuditLog';

const handleAddReminder = async () => {
  try {
    // Create the reminder
    const { data, error } = await supabase
      .from('reminders')
      .insert([newReminder])
      .select()
      .single();

    if (error) throw error;

    // ✅ Log the action
    await useAuditLog.logCreate(
      AuditResourceType.REMINDER,
      data.id,
      data.title,
      data, // Store the full reminder data
      {
        start_date: data.start_date,
        has_notification: true
      }
    );

    toast.success('Reminder created successfully!');
  } catch (error) {
    // ✅ Log the failure
    await useAuditLog.logFailedAction(
      'CREATE',
      AuditResourceType.REMINDER,
      error.message
    );
    
    toast.error('Failed to create reminder');
  }
};
```

### Example 2: Document Export

```javascript
import useAuditLog, { AuditResourceType } from '../../hooks/useAuditLog';

const handleExportDocument = async (documentId, documentName, format) => {
  try {
    // Export logic here
    const blob = await exportDocument(documentId, format);
    
    // ✅ Log the export
    await useAuditLog.logExport(
      AuditResourceType.DOCUMENT,
      documentName,
      format,
      {
        file_size: blob.size,
        export_time: new Date().toISOString()
      }
    );

    toast.success(`Document exported as ${format}`);
  } catch (error) {
    await useAuditLog.logFailedAction(
      'EXPORT',
      AuditResourceType.DOCUMENT,
      error.message
    );
  }
};
```

### Example 3: User Login/Logout

```javascript
import useAuditLog from '../../hooks/useAuditLog';

// On Login
const handleLogin = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // ✅ Log successful login
    await useAuditLog.logLogin({
      login_method: 'email',
      ip_address: await getClientIP()
    });

    navigate('/dashboard');
  } catch (error) {
    await useAuditLog.logFailedAction(
      'LOGIN',
      'user',
      error.message,
      { attempted_email: email }
    );
  }
};

// On Logout
const handleLogout = async () => {
  // ✅ Log before logging out
  await useAuditLog.logLogout();
  
  await supabase.auth.signOut();
  navigate('/login');
};
```

### Example 4: Settings Changes

```javascript
import useAuditLog, { AuditActionType, AuditResourceType } from '../../hooks/useAuditLog';

const handleUpdateSettings = async (newSettings) => {
  try {
    const oldSettings = { ...currentSettings };

    // Update settings
    const { error } = await supabase
      .from('user_settings')
      .update(newSettings)
      .eq('user_id', userId);

    if (error) throw error;

    // ✅ Log the settings change
    await useAuditLog.logUpdate(
      AuditResourceType.SETTINGS,
      userId,
      'User Settings',
      oldSettings,
      newSettings,
      {
        changed_fields: Object.keys(newSettings)
      }
    );

    toast.success('Settings updated successfully');
  } catch (error) {
    await useAuditLog.logFailedAction(
      AuditActionType.CHANGE_SETTINGS,
      AuditResourceType.SETTINGS,
      error.message
    );
  }
};
```

### Example 5: Sensitive Data Access (Admin Only)

```javascript
import useAuditLog, { AuditActionType, AuditResourceType } from '../../hooks/useAuditLog';

const viewUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    // ✅ Log sensitive data access
    await useAuditLog.logRead(
      AuditResourceType.USER,
      userId,
      data.full_name,
      {
        access_type: 'admin_view',
        fields_accessed: ['email', 'phone', 'address']
      }
    );

    return data;
  } catch (error) {
    console.error('Failed to view user profile:', error);
  }
};
```

---

## 🎯 Best Practices

### 1. **Always Log Critical Actions**

Log these actions without exception:
- ✅ User authentication (login, logout, signup)
- ✅ Data modifications (create, update, delete)
- ✅ Permission changes (grant/revoke access)
- ✅ Sensitive data access
- ✅ Export/download operations
- ✅ Email sending
- ✅ Settings changes

### 2. **Include Meaningful Metadata**

```javascript
await useAuditLog.logCreate(
  AuditResourceType.DOCUMENT,
  documentId,
  documentName,
  documentData,
  {
    // Good metadata examples:
    file_size: '2.5MB',
    file_type: 'PDF',
    upload_source: 'drag_drop',
    processing_time: '1.2s',
    tags: ['invoice', 'client-abc']
  }
);
```

### 3. **Log Both Success and Failure**

```javascript
try {
  // Perform action
  await performAction();
  
  // ✅ Log success
  await useAuditLog.logCreate(...);
} catch (error) {
  // ✅ Log failure
  await useAuditLog.logFailedAction(
    'CREATE',
    resourceType,
    error.message
  );
}
```

### 4. **Don't Log Sensitive Data**

```javascript
// ❌ BAD - Logging passwords
await useAuditLog.logUpdate(
  AuditResourceType.USER,
  userId,
  userName,
  { password: 'old_password' },  // DON'T DO THIS
  { password: 'new_password' }   // DON'T DO THIS
);

// ✅ GOOD - Exclude sensitive fields
await useAuditLog.logUpdate(
  AuditResourceType.USER,
  userId,
  userName,
  null,
  null,
  { action: 'password_changed' }  // Just log that it happened
);
```

### 5. **Use Descriptive Action Descriptions**

```javascript
// ❌ BAD
await useAuditLog.logCreate(
  AuditResourceType.DOCUMENT,
  docId,
  'Document'
);

// ✅ GOOD
await useAuditLog.logCreate(
  AuditResourceType.DOCUMENT,
  docId,
  'Annual Report 2024.pdf',
  documentData,
  {
    description: 'User uploaded annual financial report for 2024',
    category: 'Financial Documents'
  }
);
```

---

## 👀 Viewing Audit Logs

### For Regular Users

Users can view their own activity:

```javascript
// Get my activity for the last 30 days
const { data } = await useAuditLog.getUserAuditLogs(30, 100);
```

### For Admins

Admins can view all logs with filters:

```javascript
// Get all failed login attempts in the last 7 days
const { data } = await useAuditLog.getAllAuditLogs({
  actionType: 'LOGIN',
  actionStatus: 'failed',
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  limit: 100
});

// Get all actions by a specific user
const { data } = await useAuditLog.getAllAuditLogs({
  userId: 'user-uuid-here',
  limit: 200
});
```

### Using the Audit Logs Page

Navigate to `/audit-logs` to use the visual interface:

1. **Filter by Action Type**: CREATE, UPDATE, DELETE, etc.
2. **Filter by Resource**: reminder, document, user, etc.
3. **Filter by Status**: success, failed, pending
4. **Search**: Free text search across descriptions
5. **Export**: Download logs as CSV for external analysis

---

## 📊 Querying Audit Data

### Get Summary Statistics

```javascript
const { data: summary } = await useAuditLog.getAuditLogSummary(30);

// Returns daily counts grouped by action type and resource
console.log(summary);
// [
//   { date: '2026-01-12', action_type: 'CREATE', resource_type: 'reminder', count: 15 },
//   { date: '2026-01-12', action_type: 'UPDATE', resource_type: 'document', count: 8 },
//   ...
// ]
```

### Direct SQL Queries (Advanced)

```sql
-- Find all failed actions in the last 24 hours
SELECT * FROM audit_logs
WHERE action_status = 'failed'
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Count actions by user
SELECT user_email, action_type, COUNT(*) as count
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY user_email, action_type
ORDER BY count DESC;

-- Find who deleted a specific resource
SELECT user_email, user_name, created_at, old_values
FROM audit_logs
WHERE action_type = 'DELETE'
  AND resource_id = 'your-resource-id'
ORDER BY created_at DESC
LIMIT 1;
```

---

## 🔒 Security Considerations

1. **Audit logs are immutable** - They cannot be updated or deleted by users
2. **RLS policies** ensure users can only see their own logs (unless admin)
3. **Sensitive data** (like passwords) should never be logged
4. **Service role** is required for automatic triggers
5. **Regular cleanup** can be scheduled using `cleanup_old_audit_logs(365)`

---

## 🎓 Quick Reference

### Common Actions

```javascript
// Login
await useAuditLog.logLogin();

// Logout
await useAuditLog.logLogout();

// Create
await useAuditLog.logCreate(resourceType, id, name, data);

// Update
await useAuditLog.logUpdate(resourceType, id, name, oldData, newData);

// Delete
await useAuditLog.logDelete(resourceType, id, name, oldData);

// Export
await useAuditLog.logExport(resourceType, name, format);

// Failed Action
await useAuditLog.logFailedAction(actionType, resourceType, errorMessage);
```

### Resource Types

```javascript
AuditResourceType.REMINDER
AuditResourceType.DOCUMENT
AuditResourceType.USER
AuditResourceType.GROUP
AuditResourceType.MAIL_CONFIG
AuditResourceType.TEMPLATE
AuditResourceType.SETTINGS
```

### Action Types

```javascript
AuditActionType.CREATE
AuditActionType.READ
AuditActionType.UPDATE
AuditActionType.DELETE
AuditActionType.LOGIN
AuditActionType.LOGOUT
AuditActionType.EXPORT
AuditActionType.SEND_EMAIL
AuditActionType.CHANGE_SETTINGS
```

---

## 🆘 Troubleshooting

### Logs Not Appearing

1. Check that the SQL script ran successfully
2. Verify RLS policies are enabled
3. Ensure user is authenticated
4. Check browser console for errors

### Permission Denied

1. Verify user has proper role (admin for all logs)
2. Check RLS policies in Supabase dashboard
3. Ensure service role is configured for triggers

### Performance Issues

1. Audit logs table has proper indexes
2. Consider archiving old logs (>1 year)
3. Use pagination when querying large datasets
4. Add composite indexes for your specific query patterns

---

## 📚 Next Steps

1. ✅ Run the SQL setup script
2. ✅ Add audit logging to your critical features
3. ✅ Add the Audit Logs page to your navigation
4. ✅ Test with different user roles
5. ✅ Set up automated cleanup (optional)
6. ✅ Train your team on audit log best practices

---

**Need Help?** Check the code examples in this guide or review the implementation in `src/hooks/useAuditLog.js` and `src/views/AuditLogs/index.jsx`.
