/*import { useSocialAnalytics } from '../hooks/useSocialAnalytics';
import {
  BarChart as ChartIcon,
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Clock
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export function SocialAnalyticsDashboard() {
  const { summary, loading, error } = useSocialAnalytics();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards *//*
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-accent-500" />
            <h3 className="text-sm font-medium text-primary-200">Total Engagement</h3>
          </div>
          <p className="text-2xl font-bold text-white">{summary.totalEngagement.toLocaleString()}</p>
          <span className="text-sm text-green-400">+12% from last month</span>
        </div>

        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-accent-500" />
            <h3 className="text-sm font-medium text-primary-200">Total Impressions</h3>
          </div>
          <p className="text-2xl font-bold text-white">{summary.totalImpressions.toLocaleString()}</p>
          <span className="text-sm text-green-400">+8% from last month</span>
        </div>

        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-accent-500" />
            <h3 className="text-sm font-medium text-primary-200">Engagement Rate</h3>
          </div>
          <p className="text-2xl font-bold text-white">{summary.engagementRate.toFixed(2)}%</p>
          <span className="text-sm text-green-400">+2% from last month</span>
        </div>

        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="w-5 h-5 text-accent-500" />
            <h3 className="text-sm font-medium text-primary-200">Total Shares</h3>
          </div>
          <p className="text-2xl font-bold text-white">1,234</p>
          <span className="text-sm text-green-400">+15% from last month</span>
        </div>
      </div>

      {/* Charts *//*
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Trends *//*
        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-white">Engagement Trends</h3>
            <TrendingUp className="w-5 h-5 text-accent-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.recentTrends}>
                <defs>
                  <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stroke="#f97316"
                  fillOpacity={1}
                  fill="url(#colorEngagement)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Performance *//*
        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-white">Platform Performance</h3>
            <ChartIcon className="w-5 h-5 text-accent-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.entries(summary.platformBreakdown).map(([platform, data]) => ({
                  platform,
                  engagement: data.engagement,
                  impressions: data.impressions
                }))}
              >
                <XAxis dataKey="platform" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="engagement" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best Posting Times *//*
        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-white">Best Posting Times</h3>
            <Clock className="w-5 h-5 text-accent-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.timePerformance}>
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  fontSize={12}
                />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="engagement"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ fill: '#f97316', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement Breakdown *//*
        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-white">Engagement Breakdown</h3>
            <Heart className="w-5 h-5 text-accent-500" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-primary-600/50 rounded-lg p-4 text-center">
              <Heart className="w-5 h-5 text-accent-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">2.1K</p>
              <p className="text-sm text-primary-300">Likes</p>
            </div>
            <div className="bg-primary-600/50 rounded-lg p-4 text-center">
              <MessageCircle className="w-5 h-5 text-accent-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">856</p>
              <p className="text-sm text-primary-300">Comments</p>
            </div>
            <div className="bg-primary-600/50 rounded-lg p-4 text-center">
              <Share2 className="w-5 h-5 text-accent-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">432</p>
              <p className="text-sm text-primary-300">Shares</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}*/

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
/*import supabase from '../supabase';*/

interface PageView {
    page_view_id: number;
    session_id: number;
    page_url: string;
    entry_time: string;
    exit_time?: string;
    time_spent?: number;
}

const AnalyticsDashboard: React.FC = () => {
    const [pageViews, setPageViews] = useState<PageView[]>([]);

    useEffect(() => {
      const channel = supabase
        .channel('page_views_channel')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'page_views' },
          (payload: { new: PageView, old: PageView }) => {
            console.log('Change received!', payload);
            setPageViews(prevViews => [...prevViews, payload.new]);
          }
        )
        .subscribe();
  
        // Fetch initial data
        const fetchInitialData = async () => {
            const { data, error } = await supabase
                .from('page_views')
                .select('*');
            if (error) console.error('Error fetching initial page views:', error);
            else setPageViews(data);
        };
        
        fetchInitialData();

        // Clean up the channel when component unmounts
        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div>
            <h2>Real-Time Page Views</h2>
            <ul>
                {pageViews.map(view => (
                    <li key={view.page_view_id}>
                        URL: {view.page_url}, Time Spent: {view.time_spent || 'N/A'}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AnalyticsDashboard;
