/**
 * Custom Hooks Barrel File
 * 
 * Export all custom hooks from a single entry point.
 * Import like: import { useDocuments, useReminders } from '@/hooks';
 */

export {
    useDocuments,
    useDocument,
    useCreateDocument,
    useUpdateDocument,
    useDeleteDocument,
    type Document,
} from './use-documents';

export {
    useReminders,
    useReminder,
    useUpcomingReminders,
    useCreateReminder,
    useUpdateReminder,
    useDeleteReminder,
    type Reminder,
} from './use-reminders';
