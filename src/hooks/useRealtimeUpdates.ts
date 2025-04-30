import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useRealtimeUpdates(
  table: string,
  onInsert?: (payload: any) => void,
  onUpdate?: (payload: any) => void,
  onDelete?: (payload: any) => void
) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(`public:${table}:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table,
        filter: `user_id=eq.${user.id}`
      }, payload => {
        console.log('Insert:', payload);
        onInsert?.(payload.new);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table,
        filter: `user_id=eq.${user.id}`
      }, payload => {
        console.log('Update:', payload);
        onUpdate?.(payload.new);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table,
        filter: `user_id=eq.${user.id}`
      }, payload => {
        console.log('Delete:', payload);
        onDelete?.(payload.old);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, user?.id]);
}