import * as React from 'react';
import { useForm, FieldValues, DefaultValues, Path, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';
import { cn } from './utils';

/**
 * Form Utilities
 * 
 * Per God Mode Protocol:
 * - Use register() for native inputs (uncontrolled)
 * - Use Controller only for third-party components
 * - mode: 'onBlur' or 'onSubmit' (not onChange)
 * - Pass zodResolver(schema) to bind schema to form
 */

// ============================================
// TYPED FORM HOOK
// ============================================

interface UseTypedFormOptions<T extends FieldValues> {
    schema: ZodSchema<T>;
    defaultValues?: DefaultValues<T>;
    mode?: 'onBlur' | 'onSubmit' | 'onChange' | 'onTouched' | 'all';
}

export function useTypedForm<T extends FieldValues>({
    schema,
    defaultValues,
    mode = 'onBlur',
}: UseTypedFormOptions<T>) {
    return useForm<T>({
        resolver: zodResolver(schema) as any,
        defaultValues,
        mode,
    });
}

// ============================================
// FORM FIELD WRAPPER COMPONENT
// ============================================

interface FormFieldProps {
    label: string;
    error?: string;
    required?: boolean;
    className?: string;
    children: React.ReactNode;
}

export function FormField({
    label,
    error,
    required,
    className,
    children,
}: FormFieldProps) {
    return (
        <div className={cn('space-y-2', className)}>
            <label className="text-sm font-medium text-text-primary">
                {label}
                {required && <span className="text-error ml-1">*</span>}
            </label>
            {children}
            {error && (
                <p className="text-sm text-error" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

// ============================================
// FORM SUBMIT BUTTON
// ============================================

interface FormSubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    loadingText?: string;
    children: React.ReactNode;
}

export function FormSubmitButton({
    isLoading,
    loadingText = 'Loading...',
    children,
    className,
    disabled,
    ...props
}: FormSubmitButtonProps) {
    return (
        <button
            type="submit"
            disabled={disabled || isLoading}
            className={cn(
                'w-full inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                className
            )}
            {...props}
        >
            {isLoading ? (
                <>
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    {loadingText}
                </>
            ) : (
                children
            )}
        </button>
    );
}
