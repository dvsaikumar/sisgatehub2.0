import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../configs/supabaseClient';
import toast from 'react-hot-toast';

export interface Calendar {
    id: string;
    user_id: string;
    name: string;
    color: string;
    is_default: boolean;
    is_visible: boolean;
    created_at: string;
}

export interface CalendarShare {
    id: string;
    calendar_id: string;
    shared_with_user_id: string;
    permission: 'view' | 'edit';
    created_at: string;
    // Joined fields
    calendar?: Calendar;
    user?: { email: string; display_name: string };
}

export function useCalendars() {
    const [calendars, setCalendars] = useState<Calendar[]>([]);
    const [sharedCalendars, setSharedCalendars] = useState<(CalendarShare & { calendar: Calendar })[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCalendars = useCallback(async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Own calendars
            const { data, error } = await supabase
                .from('calendars')
                .select('*')
                .eq('user_id', user.id)
                .order('name');

            if (error) throw error;
            setCalendars(data || []);

            // Shared with me
            const { data: shares, error: shareErr } = await supabase
                .from('calendar_shares')
                .select('*, calendar:calendars(*)')
                .eq('shared_with_user_id', user.id);

            if (shareErr) throw shareErr;
            setSharedCalendars((shares || []) as any);
        } catch (error) {
            console.error('Error fetching calendars:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const createCalendar = async (name: string, color = '#009B84') => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const isFirst = calendars.length === 0;
            const { data, error } = await supabase
                .from('calendars')
                .insert([{ name, color, user_id: user.id, is_default: isFirst }])
                .select()
                .single();

            if (error) throw error;
            setCalendars(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
            toast.success('Calendar created');
            return data;
        } catch (error: any) {
            console.error('Error creating calendar:', error);
            toast.error(error.message || 'Failed to create calendar');
            throw error;
        }
    };

    const updateCalendar = async (id: string, updates: Partial<Omit<Calendar, 'id' | 'user_id' | 'created_at'>>) => {
        try {
            const { data, error } = await supabase
                .from('calendars')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            setCalendars(prev =>
                prev.map(cal => cal.id === id ? data : cal)
                    .sort((a, b) => a.name.localeCompare(b.name))
            );
            return data;
        } catch (error: any) {
            console.error('Error updating calendar:', error);
            toast.error(error.message || 'Failed to update calendar');
            throw error;
        }
    };

    const deleteCalendar = async (id: string) => {
        try {
            const { error } = await supabase
                .from('calendars')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setCalendars(prev => prev.filter(cal => cal.id !== id));
            toast.success('Calendar deleted');
        } catch (error: any) {
            console.error('Error deleting calendar:', error);
            toast.error(error.message || 'Failed to delete calendar');
            throw error;
        }
    };

    const toggleVisibility = async (id: string) => {
        const cal = calendars.find(c => c.id === id);
        if (!cal) return;
        await updateCalendar(id, { is_visible: !cal.is_visible });
    };

    const setDefault = async (id: string) => {
        try {
            // Unset all defaults first
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase
                .from('calendars')
                .update({ is_default: false })
                .eq('user_id', user.id);

            await supabase
                .from('calendars')
                .update({ is_default: true })
                .eq('id', id);

            setCalendars(prev =>
                prev.map(cal => ({ ...cal, is_default: cal.id === id }))
            );
            toast.success('Default calendar updated');
        } catch (error: any) {
            console.error('Error setting default:', error);
            toast.error('Failed to set default calendar');
        }
    };

    // Sharing
    const shareCalendar = async (calendarId: string, userId: string, permission: 'view' | 'edit' = 'view') => {
        try {
            const { error } = await supabase
                .from('calendar_shares')
                .insert([{ calendar_id: calendarId, shared_with_user_id: userId, permission }]);

            if (error) throw error;
            toast.success('Calendar shared');
        } catch (error: any) {
            console.error('Error sharing calendar:', error);
            toast.error(error.message || 'Failed to share calendar');
            throw error;
        }
    };

    const removeShare = async (shareId: string) => {
        try {
            const { error } = await supabase
                .from('calendar_shares')
                .delete()
                .eq('id', shareId);

            if (error) throw error;
            setSharedCalendars(prev => prev.filter(s => s.id !== shareId));
            toast.success('Share removed');
        } catch (error: any) {
            console.error('Error removing share:', error);
            toast.error('Failed to remove share');
        }
    };

    // Get all visible calendar IDs (own + shared)
    const getVisibleCalendarIds = useCallback(() => {
        const ownVisible = calendars.filter(c => c.is_visible).map(c => c.id);
        const sharedVisible = sharedCalendars.map(s => s.calendar_id);
        return [...ownVisible, ...sharedVisible];
    }, [calendars, sharedCalendars]);

    const getDefaultCalendar = useCallback(() => {
        return calendars.find(c => c.is_default) || calendars[0] || null;
    }, [calendars]);

    useEffect(() => {
        fetchCalendars();
    }, [fetchCalendars]);

    return {
        calendars,
        sharedCalendars,
        loading,
        fetchCalendars,
        createCalendar,
        updateCalendar,
        deleteCalendar,
        toggleVisibility,
        setDefault,
        shareCalendar,
        removeShare,
        getVisibleCalendarIds,
        getDefaultCalendar,
    };
}

export default useCalendars;
