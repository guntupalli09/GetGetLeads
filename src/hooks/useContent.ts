import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { ContentLibraryItem } from '../types/database';

export function useContent() {
  const { user } = useAuth();
  const [items, setItems] = useState<ContentLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) return;
    loadContent();
  }, [user]);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Error loading content:', err);
      setError(err instanceof Error ? err : new Error('Failed to load content'));
    } finally {
      setLoading(false);
    }
  };

  const createContent = async (
    title: string,
    content: string,
    contentType: string,
    tags: string[] = [],
    metadata: Record<string, any> = {}
  ) => {
    try {
      const { data, error } = await supabase
        .from('content_library')
        .insert({
          title,
          content,
          content_type: contentType,
          tags,
          metadata,
          user_id: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      setItems(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating content:', err);
      throw err;
    }
  };

  const updateContent = async (
    id: string,
    updates: Partial<Omit<ContentLibraryItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ) => {
    try {
      const { data, error } = await supabase
        .from('content_library')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setItems(prev => prev.map(item => item.id === id ? data : item));
      return data;
    } catch (err) {
      console.error('Error updating content:', err);
      throw err;
    }
  };

  return {
    items,
    loading,
    error,
    createContent,
    updateContent,
    refresh: loadContent
  };
}