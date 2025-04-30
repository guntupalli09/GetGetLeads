import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Heart, MessageCircle, Share2, Eye, TrendingUp } from 'lucide-react';

interface MetricsProps {
  postId: string;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagement: number[];
  };
}

export function SocialMediaMetrics({ postId, metrics }: MetricsProps) {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  const engagementData = metrics.engagement.map((value, index) => ({
    time: index,
    value
  }));

  const interactionData = [
    { name: 'Likes', value: metrics.likes },
    { name: 'Comments', value: metrics.comments },
    { name: 'Shares', value: metrics.shares },
    { name: 'Views', value: metrics.views }
  ];

  return (
    <div className="bg-primary-700/50 rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Post Performance</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('day')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              timeRange === 'day'
                ? 'bg-accent-500 text-white'
                : 'bg-primary-600/50 text-primary-300 hover:text-white'
            }`}
          >
            24h
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              timeRange === 'week'
                ? 'bg-accent-500 text-white'
                : 'bg-primary-600/50 text-primary-300 hover:text-white'
            }`}
          >
            7d
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              timeRange === 'month'
                ? 'bg-accent-500 text-white'
                : 'bg-primary-600/50 text-primary-300 hover:text-white'
            }`}
          >
            30d
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-primary-600/50 rounded-lg p-4 text-center">
          <Eye className="w-5 h-5 text-accent-500 mx-auto mb-2" />
          <p className="text-xl font-bold text-white">{metrics.views.toLocaleString()}</p>
          <p className="text-sm text-primary-300">Views</p>
        </div>
        <div className="bg-primary-600/50 rounded-lg p-4 text-center">
          <Heart className="w-5 h-5 text-accent-500 mx-auto mb-2" />
          <p className="text-xl font-bold text-white">{metrics.likes.toLocaleString()}</p>
          <p className="text-sm text-primary-300">Likes</p>
        </div>
        <div className="bg-primary-600/50 rounded-lg p-4 text-center">
          <MessageCircle className="w-5 h-5 text-accent-500 mx-auto mb-2" />
          <p className="text-xl font-bold text-white">{metrics.comments.toLocaleString()}</p>
          <p className="text-sm text-primary-300">Comments</p>
        </div>
        <div className="bg-primary-600/50 rounded-lg p-4 text-center">
          <Share2 className="w-5 h-5 text-accent-500 mx-auto mb-2" />
          <p className="text-xl font-bold text-white">{metrics.shares.toLocaleString()}</p>
          <p className="text-sm text-primary-300">Shares</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-primary-200 mb-4">Engagement Over Time</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementData}>
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                />
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
                  dataKey="value"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ fill: '#f97316', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-primary-200 mb-4">Interaction Breakdown</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={interactionData}>
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#f97316"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}