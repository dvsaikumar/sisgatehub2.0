import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../configs/supabaseClient';
import toast from 'react-hot-toast';

/**
 * Hook for managing reminder categories with Supabase
 */
export function useCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch all categories
    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('reminder_categories')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Fallback to default categories if table doesn't exist
            setCategories([
                { id: '1', name: 'Meetings', color: '#007D88' },
                { id: '2', name: 'Flights', color: '#3B82F6' },
                { id: '3', name: 'Birthday', color: '#EC4899' },
                { id: '4', name: 'Conferences', color: '#8B5CF6' },
                { id: '5', name: 'Important', color: '#EF4444' },
                { id: '6', name: 'Personal', color: '#10B981' },
            ]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Create a new category
    const createCategory = async (name, color = '#007D88') => {
        try {
            const { data, error } = await supabase
                .from('reminder_categories')
                .insert([{ name, color }])
                .select()
                .single();

            if (error) throw error;

            setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
            toast.success('Category created successfully');
            return data;
        } catch (error) {
            console.error('Error creating category:', error);
            toast.error(error.message || 'Failed to create category');
            throw error;
        }
    };

    // Update a category
    const updateCategory = async (id, updates) => {
        try {
            const { data, error } = await supabase
                .from('reminder_categories')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            setCategories(prev =>
                prev.map(cat => cat.id === id ? data : cat)
                    .sort((a, b) => a.name.localeCompare(b.name))
            );
            toast.success('Category updated successfully');
            return data;
        } catch (error) {
            console.error('Error updating category:', error);
            toast.error(error.message || 'Failed to update category');
            throw error;
        }
    };

    // Delete a category (soft delete by setting is_active to false)
    const deleteCategory = async (id) => {
        try {
            const { error } = await supabase
                .from('reminder_categories')
                .update({ is_active: false })
                .eq('id', id);

            if (error) throw error;

            setCategories(prev => prev.filter(cat => cat.id !== id));
            toast.success('Category deleted successfully');
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error(error.message || 'Failed to delete category');
            throw error;
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return {
        categories,
        loading,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
    };
}

export default useCategories;
