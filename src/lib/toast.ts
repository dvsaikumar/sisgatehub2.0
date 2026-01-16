import toast, { Toaster as HotToaster, ToastOptions } from 'react-hot-toast';

/**
 * Toast Utility
 * 
 * A unified notification system using react-hot-toast.
 * This replaces react-toastify and sweetalert2 for simple notifications.
 * 
 * Per God Mode Protocol:
 * - Limit toast stack to 3
 * - Use toast.promise() for mutations
 * - Consistent positioning (bottom-right)
 */

// Default toast options
const defaultOptions: ToastOptions = {
    duration: 4000,
    position: 'bottom-right',
};

// Success toast
export const showSuccess = (message: string, options?: ToastOptions) => {
    return toast.success(message, { ...defaultOptions, ...options });
};

// Error toast
export const showError = (message: string, options?: ToastOptions) => {
    return toast.error(message, { ...defaultOptions, ...options });
};

// Info toast (custom style)
export const showInfo = (message: string, options?: ToastOptions) => {
    return toast(message, {
        ...defaultOptions,
        ...options,
        icon: 'ℹ️',
        style: {
            background: '#06b6d4',
            color: '#fff',
        },
    });
};

// Warning toast (custom style)
export const showWarning = (message: string, options?: ToastOptions) => {
    return toast(message, {
        ...defaultOptions,
        ...options,
        icon: '⚠️',
        style: {
            background: '#f59e0b',
            color: '#fff',
        },
    });
};

// Loading toast (returns ID for dismissal)
export const showLoading = (message: string = 'Loading...') => {
    return toast.loading(message, { position: 'bottom-right' });
};

// Dismiss a specific toast
export const dismissToast = (toastId: string) => {
    toast.dismiss(toastId);
};

// Dismiss all toasts
export const dismissAllToasts = () => {
    toast.dismiss();
};

/**
 * Promise toast - shows loading, success, and error states automatically
 * 
 * @example
 * showPromise(
 *   supabase.from('documents').insert(data),
 *   {
 *     loading: 'Creating document...',
 *     success: 'Document created!',
 *     error: 'Failed to create document',
 *   }
 * );
 */
export const showPromise = <T,>(
    promise: Promise<T>,
    messages: {
        loading: string;
        success: string;
        error: string;
    }
) => {
    return toast.promise(promise, messages, { position: 'bottom-right' });
};

// Re-export the Toaster component
export { HotToaster };

// Re-export base toast for advanced use cases
export { toast };
