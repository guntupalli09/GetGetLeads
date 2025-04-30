import { useState } from 'react';
import { useCustomers } from '../../hooks/useCustomers';
import { useAI } from '../../hooks/useAI';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Tag,
  DollarSign,
  TrendingUp,
  Brain,
  X,
  Edit2,
  MessageCircle,
  Star,
  AlertTriangle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface CustomerProfileProps {
  customerId: string;
  onClose: () => void;
}

export function CustomerProfile({ customerId, onClose }: CustomerProfileProps) {
  const { customers, updateCustomer } = useCustomers();
  const { analyzeCustomerData } = useAI();
  const [editing, setEditing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState<any>(null);

  const customer = customers.find(c => c.id === customerId);
  if (!customer) return null;

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const results = await analyzeCustomerData(customerId);
      setInsights(results);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-primary-700 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-primary-700 border-b border-primary-600 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Customer Profile</h3>
            <button
              onClick={onClose}
              className="text-primary-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-accent-500" />
                <div>
                  <h4 className="text-sm font-medium text-primary-200">Name</h4>
                  <p className="text-white">{customer.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent-500" />
                <div>
                  <h4 className="text-sm font-medium text-primary-200">Email</h4>
                  <p className="text-white">{customer.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent-500" />
                <div>
                  <h4 className="text-sm font-medium text-primary-200">Phone</h4>
                  <p className="text-white">{customer.metadata?.phone || '-'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-accent-500" />
                <div>
                  <h4 className="text-sm font-medium text-primary-200">Address</h4>
                  <p className="text-white">{customer.metadata?.address || '-'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-accent-500" />
                <div>
                  <h4 className="text-sm font-medium text-primary-200">Customer Since</h4>
                  <p className="text-white">{new Date(customer.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-accent-500" />
                <div>
                  <h4 className="text-sm font-medium text-primary-200">Tags</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {customer.metadata?.tags?.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-primary-600/50 rounded-full text-primary-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-accent-500" />
                <div>
                  <h4 className="text-sm font-medium text-primary-200">Status</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    customer.status === 'lead'
                      ? 'bg-blue-500/20 text-blue-400'
                      : customer.status === 'qualified'
                      ? 'bg-green-500/20 text-green-400'
                      : customer.status === 'customer'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-primary-500/20 text-primary-300'
                  }`}>
                    {customer.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-primary-600/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-primary-200">Lifetime Value</span>
                <DollarSign className="w-4 h-4 text-accent-500" />
              </div>
              <p className="text-2xl font-bold text-white">
                ${(customer.metadata?.lifetimeValue || 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-primary-600/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-primary-200">Engagement Score</span>
                <TrendingUp className="w-4 h-4 text-accent-500" />
              </div>
              <p className="text-2xl font-bold text-white">
                {customer.metadata?.engagementScore || 0}/10
              </p>
            </div>

            <div className="bg-primary-600/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-primary-200">Churn Risk</span>
                <AlertTriangle className="w-4 h-4 text-accent-500" />
              </div>
              <p className="text-2xl font-bold text-white">
                {customer.metadata?.churnRisk || 'Low'}
              </p>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-primary-600/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-accent-500" />
                <h4 className="text-lg font-medium text-white">AI Analysis</h4>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="btn-primary py-2 px-4 flex items-center gap-2"
              >
                <Brain className="w-4 h-4" />
                {analyzing ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>

            {insights && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-medium text-primary-200 mb-2">
                      Behavior Analysis
                    </h5>
                    <p className="text-white">{insights.behavior}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-primary-200 mb-2">
                      Recommendations
                    </h5>
                    <ul className="space-y-2">
                      {insights.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-white">
                          <Brain className="w-4 h-4 text-accent-500 mt-1" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-primary-200 mb-2">
                    Engagement Trend
                  </h5>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={insights.engagementTrend}>
                        <XAxis dataKey="date" stroke="#94a3b8" />
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
                          dataKey="engagement"
                          stroke="#f97316"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interaction History */}
          <div className="bg-primary-600/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-accent-500" />
                <h4 className="text-lg font-medium text-white">Interaction History</h4>
              </div>
              <button className="btn-secondary py-2 px-4 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Add Note
              </button>
            </div>

            <div className="space-y-4">
              {customer.metadata?.interactions?.map((interaction: any, index: number) => (
                <div
                  key={index}
                  className="bg-primary-500/20 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white">{interaction.note}</p>
                      <p className="text-sm text-primary-300 mt-1">
                        {new Date(interaction.date).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      interaction.type === 'email'
                        ? 'bg-blue-500/20 text-blue-400'
                        : interaction.type === 'call'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-primary-500/20 text-primary-300'
                    }`}>
                      {interaction.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}