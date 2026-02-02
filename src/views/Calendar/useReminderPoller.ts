import { useEffect } from 'react';
import { supabase } from '../../configs/supabaseClient';
import toast from 'react-hot-toast';
// dayjs is available if needed: import dayjs from '../../lib/dayjs';

const useReminderPoller = () => {
    useEffect(() => {
        let isMounted = true;
        let intervalId: NodeJS.Timeout | null = null;

        const checkReminders = async () => {
            if (!isMounted) return;

            try {
                // 0. Get current user
                const { data: { user } } = await supabase.auth.getUser();
                if (!isMounted) return;
                if (!user || !user.email) return;

                // 1. Check if we have a valid email config for Reminders
                const { data: mailConfig, error: configError } = await supabase
                    .from('app_mail_configs')
                    .select('*')
                    .eq('usage_type', 'Reminders')
                    .eq('status', 'Active')
                    .limit(1)
                    .single();

                if (!isMounted) return;
                if (configError || !mailConfig) {
                    // console.log("No active 'Reminders' email configuration found. Skipping auto-email check.");
                    return;
                }

                // 2. Find due reminders that haven't been notified yet
                // Logic: start_date has passed, and notified is false
                const now = new Date().toISOString();

                const { data: dueReminders, error: remindersError } = await supabase
                    .from('reminders')
                    .select('*')
                    .eq('notified', false)
                    .lte('start_date', now);

                if (!isMounted) return;
                if (remindersError) throw remindersError;

                if (dueReminders && dueReminders.length > 0) {
                    // 3. Process each reminder
                    for (const reminder of dueReminders) {
                        if (!isMounted) return;

                        // Call the Edge Function to send the actual SMTP email
                        toast.promise(
                            (async () => {
                                try {
                                    // Invoke the Supabase Edge Function
                                    const { data, error } = await supabase.functions.invoke('send-reminder-email', {
                                        body: {
                                            reminder,
                                            mailConfig,
                                            userEmail: user.email
                                        }
                                    });

                                    if (error) throw error;

                                    // Mark as notified in DB only if email was sent successfully
                                    const { error: updateError } = await supabase
                                        .from('reminders')
                                        .update({ notified: true })
                                        .eq('id', reminder.id);

                                    if (updateError) throw updateError;

                                    return data;
                                } catch (e) {
                                    console.error('Error sending reminder email:', e);
                                    throw e;
                                }
                            })(),
                            {
                                loading: `Sending reminder "${reminder.title}" to ${user.email}...`,
                                success: (data) => `✅ Reminder email sent to ${user.email}!`,
                                error: (err) => {
                                    console.error('Reminder Toast Error:', err);
                                    let errorDetail = 'Unknown error';
                                    if (err.context && err.context.error) errorDetail = err.context.error;
                                    else if (err.message) errorDetail = err.message;
                                    return `❌ Failed: ${errorDetail}`;
                                },
                            },
                            {
                                id: `reminder-${reminder.id}`, // Unique ID to prevent duplicate toasts
                            }
                        );
                    }
                }
            } catch (error: any) {
                // Ignore AbortError
                if (error?.name !== 'AbortError') {
                    console.error("Reminder Poller Error:", error);
                }
            }
        };

        // Run immediately on mount
        checkReminders();

        // Run every 60 seconds
        intervalId = setInterval(checkReminders, 60000);

        return () => {
            isMounted = false;
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, []);
};

export default useReminderPoller;
