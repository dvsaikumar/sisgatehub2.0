import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../configs/supabaseClient';
import { reminderKeys } from '../lib/query-client';

/**
 * Reminder/Event Hooks
 * 
 * Per God Mode Protocol:
 * - All async data belongs in TanStack Query
 * - Use typed query key factories
 * - Handle timezones explicitly with Day.js
 */

// ============================================
// TYPES
// ============================================

export interface Reminder {
    id: string;
    title: string;
    description?: string;
    start_date: string;
    end_date?: string;
    all_day: boolean;
    reminder_enabled: boolean;
    reminder_minutes?: number;
    user_id: string;
    created_at: string;
    updated_at: string;
}

interface CreateReminderInput {
    title: string;
    description?: string;
    start_date: string;
    end_date?: string;
    all_day?: boolean;
    reminder_enabled?: boolean;
    reminder_minutes?: number;
}

interface UpdateReminderInput extends Partial<CreateReminderInput> {
    id: string;
}

// ============================================
// QUERIES
// ============================================

/**
 * Fetch all reminders with optional date filters
 */
export function useReminders(filters?: { startDate?: string; endDate?: string }) {
    return useQuery({
        queryKey: reminderKeys.list(filters),
        queryFn: async () => {
            let query = supabase
                .from('reminders')
                .select('*')
                .order('start_date', { ascending: true });

            if (filters?.startDate) {
                query = query.gte('start_date', filters.startDate);
            }

            if (filters?.endDate) {
                query = query.lte('start_date', filters.endDate);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data as Reminder[];
        },
    });
}

/**
 * Fetch upcoming reminders (next 7 days)
 */
export function useUpcomingReminders() {
    return useQuery({
        queryKey: reminderKeys.upcoming(),
        queryFn: async () => {
            const today = new Date().toISOString();
            const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

            const { data, error } = await supabase
                .from('reminders')
                .select('*')
                .gte('start_date', today)
                .lte('start_date', nextWeek)
                .order('start_date', { ascending: true });

            if (error) throw error;
            return data as Reminder[];
        },
    });
}

/**
 * Fetch a single reminder by ID
 */
export function useReminder(id: string) {
    return useQuery({
        queryKey: reminderKeys.detail(id),
        queryFn: async () => {
            const { data, error } = await supabase
                .from('reminders')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data as Reminder;
        },
        enabled: !!id,
    });
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Create a new reminder
 */
export function useCreateReminder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreateReminderInput) => {
            const { data, error } = await supabase
                .from('reminders')
                .insert([{
                    ...input,
                    all_day: input.all_day ?? false,
                    reminder_enabled: input.reminder_enabled ?? true,
                    reminder_minutes: input.reminder_minutes ?? 15,
                }])
                .select()
                .single();

            if (error) throw error;
            return data as Reminder;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
            queryClient.invalidateQueries({ queryKey: reminderKeys.upcoming() });
        },
    });
}

/**
 * Update an existing reminder
 */
export function useUpdateReminder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...input }: UpdateReminderInput) => {
            const { data, error } = await supabase
                .from('reminders')
                .update(input)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data as Reminder;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(reminderKeys.detail(data.id), data);
            queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
            queryClient.invalidateQueries({ queryKey: reminderKeys.upcoming() });
        },
    });
}

/**
 * Delete a reminder
 */
export function useDeleteReminder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('reminders')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return id;
        },
        onSuccess: (id) => {
            queryClient.removeQueries({ queryKey: reminderKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
            queryClient.invalidateQueries({ queryKey: reminderKeys.upcoming() });
        },
    });
}
