import { z } from 'zod';

/**
 * Form Schemas
 * 
 * Per God Mode Protocol:
 * - Define Zod schema BEFORE writing JSX
 * - Schema is the source of truth
 * - Infer TypeScript types from schema
 */

// ============================================
// LOGIN FORM
// ============================================
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters'),
    rememberMe: z.boolean().optional().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ============================================
// SIGNUP FORM
// ============================================
export const signupSchema = z
    .object({
        name: z
            .string()
            .min(1, 'Name is required')
            .min(2, 'Name must be at least 2 characters'),
        email: z
            .string()
            .min(1, 'Email is required')
            .email('Please enter a valid email'),
        password: z
            .string()
            .min(1, 'Password is required')
            .min(8, 'Password must be at least 8 characters')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                'Password must contain uppercase, lowercase, and number'
            ),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
        acceptTerms: z
            .boolean()
            .refine((val) => val === true, 'You must accept the terms'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

export type SignupFormData = z.infer<typeof signupSchema>;

// ============================================
// CREATE DOCUMENT FORM
// ============================================
export const createDocumentSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(100, 'Title must be less than 100 characters'),
    category: z.string().min(1, 'Category is required'),
    description: z
        .string()
        .max(500, 'Description must be less than 500 characters')
        .optional(),
    content: z.string().optional(),
    isPublic: z.boolean().optional().default(false),
});

export type CreateDocumentFormData = z.infer<typeof createDocumentSchema>;

// ============================================
// CREATE REMINDER FORM
// ============================================
export const createReminderSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(100, 'Title must be less than 100 characters'),
    description: z.string().optional(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    allDay: z.boolean().optional().default(false),
    reminder: z.boolean().optional().default(true),
    reminderMinutes: z.coerce.number().min(0).optional().default(15),
}).refine(
    (data) => !data.endDate || new Date(data.endDate) >= new Date(data.startDate),
    {
        message: 'End date must be after start date',
        path: ['endDate'],
    }
);

export type CreateReminderFormData = z.infer<typeof createReminderSchema>;

// ============================================
// USER PROFILE FORM
// ============================================
export const userProfileSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email').optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
    bio: z.string().max(300, 'Bio must be less than 300 characters').optional(),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;
