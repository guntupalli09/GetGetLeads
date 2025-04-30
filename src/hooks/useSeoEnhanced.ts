import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface CompetitorTracking {
  id: string;
  keyword_id: string;
  competitor_url: string;
  competitor_ranking: number | null;
  tracked_at: string;
}

interface HistoricalData {
  id: string;
  keyword_id: string;
  ranking: number;
  tracked_at: string;
}

interface Backlink {
  id: string;
  source_url: string;
  target_url: string;
  domain_authority: number | null;
  status: string;
  first_seen: string;
  last_checked: string;
}

interface PageMetrics {
  id: string;
  url: string;
  load_time: number;
  mobile_score: number;
  desktop_score: number;
  core_web_vitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
  checked_at: string;
}

export function useSeoEnhanced() {
  const { user } = useAuth();
  const [competitors, setCompetitors] = useState<CompetitorTracking[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [pageMetrics, setPageMetrics] = useState<PageMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [competitorsData, historicalData, backlinksData, metricsData] = await Promise.all([
        supabase
          .from('seo_competitor_tracking')
          .select('*')
          .order('tracked_at', { ascending: false }),
        supabase
          .from('seo_historical_data')
          .select('*')
          .order('tracked_at', { ascending: true }),
        supabase
          .from('seo_backlinks')
          .select('*')
          .order('last_checked', { ascending: false }),
        supabase
          .from('seo_page_metrics')
          .select('*')
          .order('checked_at', { ascending: false })
      ]);

      if (competitorsData.error) throw competitorsData.error;
      if (historicalData.error) throw historicalData.error;
      if (backlinksData.error) throw backlinksData.error;
      if (metricsData.error) throw metricsData.error;

      setCompetitors(competitorsData.data || []);
      setHistoricalData(historicalData.data || []);
      setBacklinks(backlinksData.data || []);
      setPageMetrics(metricsData.data || []);
    } catch (err) {
      console.error('Error loading SEO data:', err);
      setError('Failed to load SEO data');
    } finally {
      setLoading(false);
    }
  };

  const addCompetitor = async (keywordId: string, competitorUrl: string) => {
    try {
      const { data, error } = await supabase
        .from('seo_competitor_tracking')
        .insert({
          keyword_id: keywordId,
          competitor_url: competitorUrl,
          user_id: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      setCompetitors(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding competitor:', err);
      throw err;
    }
  };

  const addBacklink = async (sourceUrl: string, targetUrl: string, domainAuthority?: number) => {
    try {
      const { data, error } = await supabase
        .from('seo_backlinks')
        .insert({
          source_url: sourceUrl,
          target_url: targetUrl,
          domain_authority: domainAuthority,
          user_id: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      setBacklinks(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding backlink:', err);
      throw err;
    }
  };

  const updatePageMetrics = async (
    url: string,
    metrics: {
      load_time: number;
      mobile_score: number;
      desktop_score: number;
      core_web_vitals: {
        lcp: number;
        fid: number;
        cls: number;
      };
    }
  ) => {
    try {
      const { data, error } = await supabase
        .from('seo_page_metrics')
        .insert({
          url,
          ...metrics,
          user_id: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      setPageMetrics(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error updating page metrics:', err);
      throw err;
    }
  };

  return {
    competitors,
    historicalData,
    backlinks,
    pageMetrics,
    loading,
    error,
    addCompetitor,
    addBacklink,
    updatePageMetrics,
    refresh: loadData
  };
}