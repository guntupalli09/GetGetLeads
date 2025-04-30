import { useState } from 'react';
import { useAI } from '../../hooks/useAI';
import {
  Users,
  Brain,
  Filter,
  TrendingUp,
  DollarSign,
  Calendar,
  Tag,
  Plus
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface CustomerSegmentsProps {
  customers: any[];
  onSegmentSelect: (segmentId: string) => void;
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6'];

export function CustomerSegments({ customers, onSegmentSelect }: CustomerSegmentsProps) {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [showCreateSegment, setShowCreateSegment] = useState(false);

  const segments = [
    {
      id: 'high-value',
      name: 'High Value',
      count: customers.filter(c => (c.metadata?.lifetimeValue || 0) > 1000).length,
      criteria: 'LTV > $1,000'
    },
    {
      id: 'at-risk',
      name: 'At Risk',
      count: customers.filter(c => c.metadata?.churnRisk === 'High').length,
      criteria: 'High churn risk'
    },
    {
      id: 'new',
      name: 'New Customers',
      count: customers.filter(c => {
        const date = new Date(c.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      }).length,
      criteria: 'Joined in last 30 days'
    }
  ];

  const handleSegmentSelect = (segmentId: string) => {
    setSelectedSegment(segmentId);
    onSegmentSelect(segmentId);
  };

  return (
    <div className="space-y-6">
      {/* Segment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Segment Distribution */}
        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-white">Customer Distribution</h3>
            <button
              onClick={() => setShowCreateSegment(true)}
              className="btn-primary py-2 px-4 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Segment
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segments}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {segments.map((entry, index) => (
                    <Cell key={entry.id} fill={COLORS[index % COLORS.length]} />
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

        {/* Segment Metrics */}
        <div className="bg-primary-700/50 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-6">Segment Metrics</h3>
          <div className="space-y-4">
            {segments.map((segment) => (
              <div
                key={segment.id}
                className={`bg-primary-600/50 rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedSegment === segment.id ? 'ring-2 ring-accent-500' : ''
                }`}
                onClick={() => handleSegmentSelect(segment.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">{segment.name}</h4>
                    <p className="text-sm text-primary-300 mt-1">{segment.criteria}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{segment.count}</p>
                    <p className="text-sm text-primary-300">customers</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Segment Details */}
      {selectedSegment && (
        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-white">Segment Details</h3>
            <div className="flex gap-4">
              <button className="btn-secondary py-2 px-4 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Edit Criteria
              </button>
              <button className="btn-secondary py-2 px-4 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI Insights
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="bg-primary-600/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-primary-200">Avg. LTV</span>
                <DollarSign className="w-4 h-4 text-accent-500" />
              </div>
              <p className="text-2xl font-bold text-white">$1,234</p>
            </div>

            <div className="bg-primary-600/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-primary-200">Engagement</span>
                <TrendingUp className="w-4 h-4 text-accent-500" />
              </div>
              <p className="text-2xl font-bold text-white">8.4/10</p>
            </div>

            <div className="bg-primary-600/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-primary-200">Growth Rate</span>
                <TrendingUp className="w-4 h-4 text-accent-500" />
              </div>
              <p className="text-2xl font-bold text-white">+12%</p>
            </div>
          </div>

          {/* Customer List */}
          <div className="bg-primary-600/50 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-primary-500/20">
                  <th className="text-left p-4 text-primary-200">Customer</th>
                  <th className="text-left p-4 text-primary-200">Status</th>
                  <th className="text-left p-4 text-primary-200">LTV</th>
                  <th className="text-left p-4 text-primary-200">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-500/20">
                {customers
                  .filter(c => {
                    // Apply segment filters based on selectedSegment
                    switch (selectedSegment) {
                      case 'high-value':
                        return (c.metadata?.lifetimeValue || 0) > 1000;
                      case 'at-risk':
                        return c.metadata?.churnRisk === 'High';
                      case 'new':
                        const date = new Date(c.created_at);
                        const now = new Date();
                        const diffTime = Math.abs(now.getTime() - date.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays <= 30;
                      default:
                        return true;
                    }
                  })
                  .map((customer) => (
                    <tr key={customer.id} className="hover:bg-primary-500/10">
                      <td className="p-4">
                        <div>
                          <div className="text-white font-medium">{customer.name}</div>
                          <div className="text-sm text-primary-300">{customer.email}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          customer.status === 'lead'
                            ? 'bg-blue-500/20 text-blue-400'
                            : customer.status === 'qualified'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-white">
                          ${(customer.metadata?.lifetimeValue || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-primary-300">
                          {new Date(customer.metadata?.lastActivity || customer.created_at).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}