import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useAnalytics() {
  const { user } = useAuth();
  type Post = {
    content: string;
    engagement: number;
    platform: string;
  } | null;
  const [performance, setPerformance] = useState({
    total_posts: 0,
    total_engagement: 0,
    best_performing_post:null as Post,
    engagement_by_platform: {},
    best_posting_times: [""],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let mounted = true;

    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get post analytics
        const { data: analytics, error: analyticsError } = await supabase
          .from('post_analytics')
          .select(`
            *,
            social_media_posts (
              content,
              platform
            )
          `)
          .eq('user_id', user.id);

        if (analyticsError) throw analyticsError;

        // Calculate total engagement and best performing post
        let totalEngagement = 0;
        let bestPost:any=null
        const platformEngagement: Record<string, number> = {};

        analytics?.forEach(item => {
          const engagement = item.likes + item.comments + item.shares;
          totalEngagement += engagement;

          const platform = item.social_media_posts?.platform || 'unknown';
          platformEngagement[platform] = (platformEngagement[platform] || 0) + engagement;

          if (!bestPost || engagement > (bestPost.likes + bestPost.comments + bestPost.shares)) {
            bestPost = item;
          }
        });

        if (mounted) {
          setPerformance({
            total_posts: analytics?.length || 0,
            total_engagement: totalEngagement,
            best_performing_post: bestPost ? {
              content: bestPost.social_media_posts?.content || '',
              engagement: bestPost.likes + bestPost.comments + bestPost.shares,
              platform: bestPost.social_media_posts?.platform || 'unknown'
            } : null,
            engagement_by_platform: platformEngagement,
            best_posting_times: await analyzeBestPostingTimes()
          });
        }
      } catch (err) {
        console.error('Error loading analytics:', err);
        if (mounted) {
          setError('Failed to load analytics');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initial load
    loadAnalytics();

    // Subscribe to real-time updates
    const analyticsSubscription = supabase
      .channel('analytics_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'post_analytics',
        filter: `user_id=eq.${user.id}`
      }, () => {
        loadAnalytics();
      })
      .subscribe();

    return () => {
      mounted = false;
      analyticsSubscription.unsubscribe();
    };
  }, [user]);

  const analyzeBestPostingTimes = async () => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('social_media_posts')
      .select(`
        published_at,
        post_analytics (
          likes,
          comments,
          shares
        )
      `)
      .eq('user_id', user.id)
      .not('published_at', 'is', null);

    if (error) {
      console.error('Error analyzing posting times:', error);
      return [];
    }

    const timePerformance: Record<number, { count: number; totalEngagement: number }> = {};
    
    data.forEach(post => {
      if (post.published_at && post.post_analytics?.[0]) {
        const hour = new Date(post.published_at).getHours();
        const analytics = post.post_analytics[0];
        const engagement = analytics.likes + analytics.comments + analytics.shares;

        if (!timePerformance[hour]) {
          timePerformance[hour] = { count: 0, totalEngagement: 0 };
        }

        timePerformance[hour].count++;
        timePerformance[hour].totalEngagement += engagement;
      }
    });

    return Object.entries(timePerformance)
      .map(([hour, stats]) => ({
        hour: parseInt(hour),
        avgEngagement: stats.totalEngagement / stats.count
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 3)
      .map(({ hour }) => {
        return new Date(2000, 0, 1, hour).toLocaleTimeString('en-US', {
          hour: 'numeric',
          hour12: true
        });
      });
  };

  const recordAnalytics = async (postId: string, metrics: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  }) => {
    try {
      const { error } = await supabase
        .from('post_analytics')
        .insert({
          post_id: postId,
          user_id: user?.id,
          ...metrics
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error recording analytics:', err);
      throw err;
    }
  };

  return {
    performance,
    loading,
    error,
    recordAnalytics
  };
}