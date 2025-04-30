import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, DollarSign, Users, Mail, Brain } from 'lucide-react';

interface EmailAnalyticsProps {
  campaigns: any[];
  analytics: Record<string, any>;
  onAnalyze: (campaignId: string) => Promise<any>;
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6'];

export function EmailAnalytics({ campaigns, analytics, onAnalyze }: EmailAnalyticsProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [insights, setInsights] = useState<any>(null);

  const handleAnalyze = async (campaignId: string) => {
    const result = await onAnalyze(campaignId);
    setInsights(result);
  };

  const calculateROI = (campaign: any) => {
    const campaignAnalytics = analytics[campaign.id];
    if (!campaignAnalytics) return 0;
    
    const revenue = campaignAnalytics.revenue || 0;
    const cost = campaignAnalytics.cost || 0;
    return ((revenue - cost) / cost) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-accent-500" />
            <h3 className="text-sm font-medium text-primary-200">Open Rate</h3>
          </div>
          <p className="text-2xl font-bold text-white">24.8%</p>
          <span className="text-sm text-green-400">+2.1% from last month</span>
        </div>

        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-accent-500" />
            <h3 className="text-sm font-medium text-primary-200">Click Rate</h3>
          </div>
          <p className="text-2xl font-bold text-white">3.2%</p>
          <span className="text-sm text-green-400">+0.5% from last month</span>
        </div>

        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-accent-500" />
            <h3 className="text-sm font-medium text-primary-200">Revenue</h3>
          </div>
          <p className="text-2xl font-bold text-white">$12,450</p>
          <span className="text-sm text-green-400">+15% from last month</span>
        </div>

        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-accent-500" />
            <h3 className="text-sm font-medium text-primary-200">Subscribers</h3>
          </div>
          <p className="text-2xl font-bold text-white">8,234</p>
          <span className="text-sm text-green-400">+123 this month</span>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Rates Over Time */}
        <div className="bg-primary-700/50 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-6">Open Rates Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={campaigns}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
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
                  dataKey="openRate"
                  stroke="#f97316"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Click Distribution */}
        <div className="bg-primary-700/50 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-6">Click Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'CTA 1', value: 400 },
                    { name: 'CTA 2', value: 300 },
                    { name: 'Links', value: 200 },
                    { name: 'Images', value: 100 }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={index} fill={color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {insights && (
        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Brain className="w-5 h-5 text-accent-500" />
            <h3 className="text-lg font-medium text-white">AI Insights</h3>
          </div>

          <div className="grid gap-4">
            {insights.recommendations?.map((insight: string, index: number) => (
              <div
                key={index}
                className="bg-primary-600/50 rounded-lg p-4 flex items-start gap-3"
              >
                <Brain className="w-5 h-5 text-accent-500 mt-0.5" />
                <div>
                  <p className="text-white">{insight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}