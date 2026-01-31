
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
    console.error(
        'CRITICAL: Supabase URL is missing or invalid. ' +
        'Check your Vercel Environment Variables (VITE_SUPABASE_URL).'
    )
}

if (!supabaseKey) {
    console.error(
        'CRITICAL: Supabase Anon Key is missing. ' +
        'Check your Vercel Environment Variables (VITE_SUPABASE_ANON_KEY).'
    )
}

// Global handler to suppress AbortError in unhandled promise rejections
if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
        if (event.reason?.name === 'AbortError' ||
            event.reason?.message?.includes('aborted') ||
            event.reason?.message?.includes('signal')) {
            event.preventDefault();
        }
    });
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder-if-missing.supabase.co',
    supabaseKey || 'placeholder-key',
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: 'pkce'
        }
    }
)
