import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query Client Configuration
 * 
 * Per God Mode Protocol:
 * - Default staleTime: 5 minutes (300,000ms) to reduce network chatter
 * - gcTime (garbage collection): 10 minutes for instant back-navigation
 * - Retry logic: 3 attempts with exponential backoff
 */

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Data is considered fresh for 5 minutes
            staleTime: 5 * 60 * 1000, // 300,000ms
            // Keep data in cache for 10 minutes after last subscriber
            gcTime: 10 * 60 * 1000, // 600,000ms
            // Retry failed requests 3 times
            retry: 3,
            // Don't refetch on window focus by default (can override per query)
            refetchOnWindowFocus: false,
            // Don't refetch on mount if data is fresh
            refetchOnMount: false,
        },
        mutations: {
            // Retry mutations once on failure
            retry: 1,
        },
    },
});

/**
 * Query Key Factories
 * 
 * Per God Mode Protocol:
 * - No hardcoded string arrays
 * - Strictly typed key factories
 * - Hierarchical structure for granular invalidation
 */

// Documents query keys
export const documentKeys = {
    all: ['documents'] as const,
    lists: () => [...documentKeys.all, 'list'] as const,
    list: (filters?: { category?: string; search?: string }) =>
        [...documentKeys.lists(), filters] as const,
    details: () => [...documentKeys.all, 'detail'] as const,
    detail: (id: string) => [...documentKeys.details(), id] as const,
};

// Templates query keys
export const templateKeys = {
    all: ['templates'] as const,
    lists: () => [...templateKeys.all, 'list'] as const,
    list: (category?: string) => [...templateKeys.lists(), { category }] as const,
    details: () => [...templateKeys.all, 'detail'] as const,
    detail: (id: string) => [...templateKeys.details(), id] as const,
};

// User query keys
export const userKeys = {
    all: ['users'] as const,
    current: () => [...userKeys.all, 'current'] as const,
    profile: (id: string) => [...userKeys.all, 'profile', id] as const,
    settings: () => [...userKeys.all, 'settings'] as const,
};

// Reminders/Events query keys
export const reminderKeys = {
    all: ['reminders'] as const,
    lists: () => [...reminderKeys.all, 'list'] as const,
    list: (filters?: { startDate?: string; endDate?: string }) =>
        [...reminderKeys.lists(), filters] as const,
    details: () => [...reminderKeys.all, 'detail'] as const,
    detail: (id: string) => [...reminderKeys.details(), id] as const,
    upcoming: () => [...reminderKeys.all, 'upcoming'] as const,
};

// Chat query keys
export const chatKeys = {
    all: ['chats'] as const,
    lists: () => [...chatKeys.all, 'list'] as const,
    messages: (chatId: string) => [...chatKeys.all, 'messages', chatId] as const,
};
