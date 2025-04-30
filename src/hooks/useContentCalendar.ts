import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'social' | 'email' | 'blog' | 'other';
  status: 'draft' | 'scheduled' | 'published';
  scheduledFor: string;
  content: string;
  platform?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export function useContentCalendar() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadEvents();
  }, [user]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all content types that have scheduling
      const [socialPosts, emailCampaigns, contentLibrary] = await Promise.all([
        supabase
          .from('social_media_posts')
          .select('*')
          .not('scheduled_for', 'is', null),
        supabase
          .from('email_campaigns')
          .select('*')
          .not('scheduled_for', 'is', null),
        supabase
          .from('content_library')
          .select('*')
          .not('scheduled_for', 'is', null)
      ]);

      if (socialPosts.error) throw socialPosts.error;
      if (emailCampaigns.error) throw emailCampaigns.error;
      if (contentLibrary.error) throw contentLibrary.error;

      // Transform into calendar events
      const allEvents: CalendarEvent[] = [
        ...(socialPosts.data || []).map(post => ({
          id: post.id,
          title: post.content.slice(0, 50) + '...',
          type: 'social' as const,
          status: post.status,
          scheduledFor: post.scheduled_for,
          content: post.content,
          platform: post.platform,
          metadata: post.metadata || {},
          created_at: post.created_at
        })),
        ...(emailCampaigns.data || []).map(campaign => ({
          id: campaign.id,
          title: campaign.name,
          type: 'email' as const,
          status: campaign.status,
          scheduledFor: campaign.scheduled_for,
          content: '',
          metadata: {},
          created_at: campaign.created_at
        })),
        ...(contentLibrary.data || []).map(content => ({
          id: content.id,
          title: content.title,
          type: 'blog' as const,
          status: 'scheduled',
          scheduledFor: content.metadata?.scheduled_for,
          content: content.content,
          metadata: content.metadata || {},
          created_at: content.created_at
        }))
      ].sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());

      setEvents(allEvents);
    } catch (err) {
      console.error('Error loading calendar events:', err);
      setError('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (event: Omit<CalendarEvent, 'id' | 'created_at'>) => {
    try {
      let data;
      let error;

      switch (event.type) {
        case 'social':
          ({ data, error } = await supabase
            .from('social_media_posts')
            .insert({
              content: event.content,
              scheduled_for: event.scheduledFor,
              platform: event.platform,
              status: event.status,
              metadata: event.metadata,
              user_id: user?.id
            })
            .select()
            .single());
          break;

        case 'email':
          ({ data, error } = await supabase
            .from('email_campaigns')
            .insert({
              name: event.title,
              scheduled_for: event.scheduledFor,
              status: event.status,
              user_id: user?.id
            })
            .select()
            .single());
          break;

        case 'blog':
          ({ data, error } = await supabase
            .from('content_library')
            .insert({
              title: event.title,
              content: event.content,
              content_type: 'blog',
              metadata: {
                ...event.metadata,
                scheduled_for: event.scheduledFor
              },
              user_id: user?.id
            })
            .select()
            .single());
          break;
      }

      if (error) throw error;
      await loadEvents();
      return data;
    } catch (err) {
      console.error('Error adding calendar event:', err);
      throw err;
    }
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      let data;
      let error;

      switch (updates.type) {
        case 'social':
          ({ data, error } = await supabase
            .from('social_media_posts')
            .update({
              content: updates.content,
              scheduled_for: updates.scheduledFor,
              platform: updates.platform,
              status: updates.status,
              metadata: updates.metadata
            })
            .eq('id', id)
            .select()
            .single());
          break;

        case 'email':
          ({ data, error } = await supabase
            .from('email_campaigns')
            .update({
              name: updates.title,
              scheduled_for: updates.scheduledFor,
              status: updates.status
            })
            .eq('id', id)
            .select()
            .single());
          break;

        case 'blog':
          ({ data, error } = await supabase
            .from('content_library')
            .update({
              title: updates.title,
              content: updates.content,
              metadata: {
                ...updates.metadata,
                scheduled_for: updates.scheduledFor
              }
            })
            .eq('id', id)
            .select()
            .single());
          break;
      }

      if (error) throw error;
      await loadEvents();
      return data;
    } catch (err) {
      console.error('Error updating calendar event:', err);
      throw err;
    }
  };

  return {
    events,
    loading,
    error,
    addEvent,
    updateEvent,
    refresh: loadEvents
  };
}