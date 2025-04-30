import { useState } from 'react';
import { useAI } from '../../hooks/useAI';
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
import {
  TrendingUp,
  DollarSign,
  Users,
  Brain,
  Target,
  Clock,
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface CustomerAnalyticsProps {
  customers: any[];
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6'];

export function CustomerAnalytics({ customers }: CustomerAnalyticsProps) {
  const { analyzeCustomerData } = useAI();
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState<{
    trends: Array<{ insight: string; details: string }>;
    recommendations: Array<{ action: string; impact: string }>;
  }>({
    trends: [],
    recommendations: []
  });

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const results = await analyzeCustomerData('all');
      setInsights({
        trends: results?.engagementTrend?.map(trend => ({
          insight: `Engagement on ${trend.date}`,
          details: `Engagement level: ${trend.engagement}`
        })) || [],
        recommendations: results?.recommendations?.map((rec: string) => ({
          action: rec,
          impact: ''
        })) || []
      });
    } catch (err) {
      console.error('Analysis error:', err);
      // Set default empty arrays if analysis fails
      setInsights({
        trends: [],
        recommendations: []
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Calculate metrics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.metadata?.lifetimeValue || 0), 0);
  const avgLifetimeValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  // Customer acquisition data
  const acquisitionData = customers.reduce((acc: Record<string, number>, customer) => {
    const month = new Date(customer.created_at).toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  // Customer segments data
  const segmentData = [
    { name: 'New', value: customers.filter(c => c.status === 'lead').length },
    { name: 'Active', value: customers.filter(c => c.status === 'active').length },
    { name: 'Inactive', value: customers.filter(c => c.status === 'inactive').length },
    { name: 'Churned', value: customers.filter(c => c.status === 'churned').length }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-accent-500" />
            <h3 className="text-sm font-medium text-primary-200">Total Customers</h3>
          </div>
          <p className="text-2xl font-bold text-white">{totalCustomers}</p>
          <span className="text-sm text-green-400">+12% from last month</span>
        </div>

        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-accent-500" />
            <h3 className="text-sm font-medium text-primary-200">Active Customers</h3>
          </div>
          <p className="text-2xl font-bold text-white">{activeCustomers}</p>
          <span className="text-sm text-green-400">+5% from last month</span>
        </div>

        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-accent-500" />
            <h3 className="text-sm font-medium text-primary-200">Avg. Lifetime Value</h3>
          </div>
          <p className="text-2xl font-bold text-white">${avgLifetimeValue.toFixed(2)}</p>
          <span className="text-sm text-green-400">+8% from last month</span>
        </div>

        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-accent-500" />
            <h3 className="text-sm font-medium text-primary-200">Churn Rate</h3>
          </div>
          <p className="text-2xl font-bold text-white">2.4%</p>
          <span className="text-sm text-red-400">+0.5% from last month</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Acquisition */}
        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-white">Customer Acquisition</h3>
            <Calendar className="w-5 h-5 text-accent-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={Object.entries(acquisitionData).map(([month, count]) => ({
                month,
                customers: count
              }))}>
                <XAxis dataKey="month" stroke="#94a3b8" />
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
                  dataKey="customers"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ fill: '#f97316' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Segments */}
        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-white">Customer Segments</h3>
            <Users className="w-5 h-5 text-accent-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segmentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {segmentData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
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
      <div className="bg-primary-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent-500" />
            <h3 className="text-lg font-medium text-white">AI Insights</h3>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="btn-primary py-2 px-4 flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            {analyzing ? 'Analyzing...' : 'Generate Insights'}
          </button>
        </div>

        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Growth Trends */}
            <div>
              <h4 className="text-sm font-medium text-primary-200 mb-4">Growth Trends</h4>
              <div className="space-y-4">
                {insights.trends.map((trend: any, index: number) => (
                  <div
                    key={index}
                    className="bg-primary-600/50 rounded-lg p-4 flex items-start gap-3"
                  >
                    <TrendingUp className="w-5 h-5 text-accent-500 mt-0.5" />
                    <div>
                      <p className="text-white">{trend.insight}</p>
                      <p className="text-sm text-primary-300 mt-1">{trend.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="text-sm font-medium text-primary-200 mb-4">Recommendations</h4>
              <div className="space-y-4">
                {insights.recommendations.map((rec: any, index: number) => (
                  <div
                    key={index}
                    className="bg-primary-600/50 rounded-lg p-4 flex items-start gap-3"
                  >
                    <Brain className="w-5 h-5 text-accent-500 mt-0.5" />
                    <div>
                      <p className="text-white">{rec.action}</p>
                      <p className="text-sm text-primary-300 mt-1">{rec.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customer Behavior */}
      <div className="bg-primary-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white">Customer Behavior</h3>
          <Clock className="w-5 h-5 text-accent-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Engagement Score */}
          <div className="bg-primary-600/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-primary-200 mb-2">Avg. Engagement Score</h4>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-white">7.8</div>
              <div className="text-sm text-green-400">+0.5</div>
            </div>
          </div>

          {/* Purchase Frequency */}
          <div className="bg-primary-600/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-primary-200 mb-2">Purchase Frequency</h4>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-white">12</div>
              <div className="text-sm text-primary-300">days</div>
            </div>
          </div>

          {/* Retention Rate */}
          <div className="bg-primary-600/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-primary-200 mb-2">Retention Rate</h4>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-white">85%</div>
              <div className="text-sm text-green-400">+2%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}