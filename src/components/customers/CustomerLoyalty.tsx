import { useState } from 'react';
import { useAI } from '../../hooks/useAI';
import {
  Star,
  Gift,
  Award,
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  Brain,
  Crown,
  Shield,
  Target,
  Plus
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface CustomerLoyaltyProps {
  customers: any[];
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6'];

export function CustomerLoyalty({ customers }: CustomerLoyaltyProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showCreateProgram, setShowCreateProgram] = useState(false);

  // Sample loyalty tiers
  const tiers = [
    {
      id: 'bronze',
      name: 'Bronze',
      icon: Shield,
      members: 234,
      requirements: 'Spend $500 or 3 months active',
      benefits: ['5% discount', 'Priority support', 'Monthly newsletter']
    },
    {
      id: 'silver',
      name: 'Silver',
      icon: Star,
      members: 156,
      requirements: 'Spend $1,000 or 6 months active',
      benefits: ['10% discount', '24/7 support', 'Exclusive events']
    },
    {
      id: 'gold',
      name: 'Gold',
      icon: Crown,
      members: 89,
      requirements: 'Spend $2,500 or 12 months active',
      benefits: ['15% discount', 'Dedicated account manager', 'Early access']
    }
  ];

  // Sample rewards
  const rewards = [
    {
      id: '1',
      name: 'Free Month Subscription',
      points: 1000,
      claimed: 45,
      available: 100
    },
    {
      id: '2',
      name: 'Premium Feature Access',
      points: 500,
      claimed: 78,
      available: 150
    },
    {
      id: '3',
      name: 'Custom Integration',
      points: 2000,
      claimed: 12,
      available: 50
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-accent-500" />
            <h3 className="text-sm font-medium text-primary-200">Active Members</h3>
          </div>
          <p className="text-2xl font-bold text-white">479</p>
          <span className="text-sm text-green-400">+24 this month</span>
        </div>

        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-accent-500" />
            <h3 className="text-sm font-medium text-primary-200">Avg. Points</h3>
          </div>
          <p className="text-2xl font-bold text-white">856</p>
          <span className="text-sm text-green-400">+12% from last month</span>
        </div>

        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-accent-500" />
            <h3 className="text-sm font-medium text-primary-200">Rewards Claimed</h3>
          </div>
          <p className="text-2xl font-bold text-white">135</p>
          <span className="text-sm text-green-400">+8 this week</span>
        </div>

        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-accent-500" />
            <h3 className="text-sm font-medium text-primary-200">Retention Rate</h3>
          </div>
          <p className="text-2xl font-bold text-white">92%</p>
          <span className="text-sm text-green-400">+2% from last month</span>
        </div>
      </div>

      {/* Loyalty Tiers */}
      <div className="bg-primary-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-accent-500" />
            <h3 className="text-lg font-medium text-white">Loyalty Tiers</h3>
          </div>
          <button
            onClick={() => setShowCreateProgram(true)}
            className="btn-primary py-2 px-4 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Program
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`bg-primary-600/50 rounded-lg p-6 cursor-pointer transition-colors ${
                selectedTier === tier.id ? 'ring-2 ring-accent-500' : ''
              }`}
              onClick={() => setSelectedTier(tier.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <tier.icon className="w-5 h-5 text-accent-500" />
                  <h4 className="text-lg font-medium text-white">{tier.name}</h4>
                </div>
                <span className="text-primary-300">{tier.members} members</span>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-primary-200 mb-2">Requirements</h5>
                  <p className="text-primary-300">{tier.requirements}</p>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-primary-200 mb-2">Benefits</h5>
                  <ul className="space-y-1">
                    {tier.benefits.map((benefit, index) => (
                      <li key={index} className="text-primary-300 flex items-center gap-2">
                        <Star className="w-3 h-3 text-accent-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Rewards */}
        <div className="bg-primary-700/50 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-6">Available Rewards</h3>
          <div className="space-y-4">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-primary-600/50 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-white font-medium">{reward.name}</h4>
                    <p className="text-sm text-primary-300 mt-1">
                      {reward.points} points required
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-primary-300">
                      {reward.available - reward.claimed} remaining
                    </p>
                    <div className="mt-2">
                      <div className="w-32 h-2 bg-primary-500 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-500"
                          style={{
                            width: `${(reward.claimed / reward.available) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Points Distribution */}
        <div className="bg-primary-700/50 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-6">Points Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Bronze', value: 234 },
                    { name: 'Silver', value: 156 },
                    { name: 'Gold', value: 89 }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
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

      {/* Points History */}
      <div className="bg-primary-700/50 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-6">Points History</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[
                { date: 'Jan', points: 1200 },
                { date: 'Feb', points: 1400 },
                { date: 'Mar', points: 1100 },
                { date: 'Apr', points: 1600 },
                { date: 'May', points: 1800 },
                { date: 'Jun', points: 2000 }
              ]}
            >
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
                dataKey="points"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ fill: '#f97316' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}