import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../configs/supabaseClient';
import { documentKeys } from '../lib/query-client';

/**
 * Document Hooks
 * 
 * Per God Mode Protocol:
 * - All async data belongs in TanStack Query
 * - Use typed query key factories
 * - Implement optimistic updates for mutations
 */

// ============================================
// TYPES
// ============================================

export interface Document {
    id: string;
    title: string;
    category: string;
    description?: string;
    content?: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    is_public: boolean;
}

interface CreateDocumentInput {
    title: string;
    category: string;
    description?: string;
    content?: string;
    is_public?: boolean;
}

interface UpdateDocumentInput extends Partial<CreateDocumentInput> {
    id: string;
}

// ============================================
// QUERIES
// ============================================

/**
 * Fetch all documents with optional filters
 */
export function useDocuments(filters?: { category?: string; search?: string }) {
    return useQuery({
        queryKey: documentKeys.list(filters),
        queryFn: async () => {
            let query = supabase
                .from('documents')
                .select('*')
                .order('created_at', { ascending: false });

            if (filters?.category) {
                query = query.eq('category', filters.category);
            }

            if (filters?.search) {
                query = query.ilike('title', `%${filters.search}%`);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data as Document[];
        },
    });
}

/**
 * Fetch a single document by ID
 */
export function useDocument(id: string) {
    return useQuery({
        queryKey: documentKeys.detail(id),
        queryFn: async () => {
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data as Document;
        },
        enabled: !!id,
    });
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Create a new document
 */
export function useCreateDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreateDocumentInput) => {
            const { data, error } = await supabase
                .from('documents')
                .insert([{
                    ...input,
                    is_public: input.is_public ?? false,
                }])
                .select()
                .single();

            if (error) throw error;
            return data as Document;
        },
        onSuccess: () => {
            // Invalidate and refetch documents list
            queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
        },
    });
}

/**
 * Update an existing document
 */
export function useUpdateDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...input }: UpdateDocumentInput) => {
            const { data, error } = await supabase
                .from('documents')
                .update(input)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data as Document;
        },
        onSuccess: (data) => {
            // Update the specific document in cache
            queryClient.setQueryData(documentKeys.detail(data.id), data);
            // Invalidate lists to reflect changes
            queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
        },
    });
}

/**
 * Delete a document
 */
export function useDeleteDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('documents')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return id;
        },
        onSuccess: (id) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: documentKeys.detail(id) });
            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
        },
    });
}
