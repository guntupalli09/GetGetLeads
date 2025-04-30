import { useState, useEffect } from 'react';
import { supabase, retryOperation } from '../lib/supabase';
import { useAuth } from './useAuth';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let mounted = true;

    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await retryOperation(() =>
          supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        );

        if (error) throw error;
        
        if (mounted) {
          setNotifications(data || []);
          setUnreadCount(data?.filter(n => !n.read).length || 0);
        }
      } catch (err) {
        console.error('Error loading notifications:', err);
        if (mounted) {
          setError('Failed to load notifications');
          setNotifications([]);
          setUnreadCount(0);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initial load
    loadNotifications();

    // Subscribe to new notifications
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        loadNotifications();
      })
      .subscribe();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [user]);

  const markAsRead = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await retryOperation(() =>
        supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', id)
          .eq('user_id', user.id)
      );

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await retryOperation(() =>
        supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', user.id)
          .eq('read', false)
      );

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  };

  const deleteNotification = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await retryOperation(() =>
        supabase
          .from('notifications')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)
      );

      if (error) throw error;
      
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => prev - (notifications.find(n => n.id === id)?.read ? 0 : 1));
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
}