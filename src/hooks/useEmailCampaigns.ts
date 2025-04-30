import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { showError, showSuccess } from '../lib/toast';

export function useEmailCampaigns() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let mounted = true;
    loadData();

    // Subscribe to real-time updates
    const campaignsSubscription = supabase
      .channel('email_campaigns_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'email_campaigns',
        filter: `user_id=eq.${user.id}`
      }, () => {
        if (mounted) loadData();
      })
      .subscribe();

    return () => {
      mounted = false;
      campaignsSubscription.unsubscribe();
    };
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [campaignsData, templatesData, subscribersData, analyticsData] = await Promise.all([
        supabase
          .from('email_campaigns')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('email_templates')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('email_subscribers')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('campaign_analytics')
          .select('*')
          .eq('user_id', user?.id)
      ]);

      if (campaignsData.error) throw campaignsData.error;
      if (templatesData.error) throw templatesData.error;
      if (subscribersData.error) throw subscribersData.error;
      if (analyticsData.error) throw analyticsData.error;

      setCampaigns(campaignsData.data || []);
      setTemplates(templatesData.data || []);
      setSubscribers(subscribersData.data || []);
      
      const analyticsMap = (analyticsData.data || []).reduce((acc, item) => {
        acc[item.campaign_id] = item;
        return acc;
      }, {} as Record<string, any>);
      setAnalytics(analyticsMap);

    } catch (err) {
      console.error('Error loading email campaign data:', err);
      setError('Failed to load email campaign data');
      showError('Failed to load email campaign data. Retrying...');
      
      // Retry after a delay
      setTimeout(loadData, 5000);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (name: string, subject: string, content: string) => {
    try {
      const { data, error: insertError } = await supabase
        .from('email_templates')
        .insert({
          name,
          subject,
          content,
          user_id: user?.id
        })
        .select()
        .single();

      if (insertError) throw insertError;
      setTemplates(prev => [data, ...prev]);
      showSuccess('Template created successfully');
      return data;
    } catch (err) {
      console.error('Error creating template:', err);
      showError('Failed to create template');
      throw err;
    }
  };

  const createCampaign = async (name: string, templateId: string, scheduledFor?: Date) => {
    try {
      const { data, error: insertError } = await supabase
        .from('email_campaigns')
        .insert({
          name,
          template_id: templateId,
          scheduled_for: scheduledFor?.toISOString(),
          status: scheduledFor ? 'scheduled' : 'draft',
          user_id: user?.id
        })
        .select()
        .single();

      if (insertError) throw insertError;
      setCampaigns(prev => [data, ...prev]);
      showSuccess('Campaign created successfully');
      return data;
    } catch (err) {
      console.error('Error creating campaign:', err);
      showError('Failed to create campaign');
      throw err;
    }
  };

  const addSubscriber = async (email: string, name?: string) => {
    try {
      const { data, error: insertError } = await supabase
        .from('email_subscribers')
        .insert({
          email,
          name,
          user_id: user?.id,
          status: 'active'
        })
        .select()
        .single();

      if (insertError) throw insertError;
      setSubscribers(prev => [data, ...prev]);
      showSuccess('Subscriber added successfully');
      return data;
    } catch (err) {
      console.error('Error adding subscriber:', err);
      showError('Failed to add subscriber');
      throw err;
    }
  };

  const updateCampaignStatus = async (campaignId: string, status: string) => {
    try {
      const { data, error: updateError } = await supabase
        .from('email_campaigns')
        .update({ status })
        .eq('id', campaignId)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId ? data : campaign
      ));
      showSuccess('Campaign status updated successfully');
      return data;
    } catch (err) {
      console.error('Error updating campaign status:', err);
      showError('Failed to update campaign status');
      throw err;
    }
  };

  return {
    campaigns,
    templates,
    subscribers,
    analytics,
    loading,
    error,
    createTemplate,
    createCampaign,
    addSubscriber,
    updateCampaignStatus,
    refresh: loadData
  };
}