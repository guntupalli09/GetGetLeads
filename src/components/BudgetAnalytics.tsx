import { useState } from 'react';
import { useAI } from '../hooks/useAI';
import {
  TrendingUp,
  DollarSign,
  Target,
  Brain,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

interface BudgetAnalyticsProps {
  budgets: any[];
  expenses: any[];
  onInsightGenerated?: (insights: any) => void;
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

export function BudgetAnalytics({ budgets, expenses, onInsightGenerated }: BudgetAnalyticsProps) {
  const { optimizeBudget } = useAI();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const utilizationRate = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await optimizeBudget({
        currentBudget: totalBudget,
        expenses,
        performance: [], // Add performance data if available
        goals: [
          'Maximize ROI',
          'Optimize allocation',
          'Predict trends'
        ]
      });

      setAnalysis(result);
      onInsightGenerated?.(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze budget data');
    } finally {
      setLoading(false);
    }
  };
  // Calculate budget allocation data
  const allocationData = budgets.map(budget => ({
    name: budget.category,
    value: budget.amount
  }));

  // Calculate utilization data
  const utilizationData = [
    { name: 'Used', value: totalExpenses },
    { name: 'Remaining', value: Math.max(0, totalBudget - totalExpenses) }
  ];

  // Generate prediction data
  const generatePredictionData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const baseValue = totalExpenses / 6; // Average monthly expense
    
    return months.map(month => ({
      name: month,
      actual: baseValue * (0.9 + Math.random() * 0.2),
      predicted: baseValue * (1 + Math.random() * 0.3)
    }));
  };

  const predictionData = generatePredictionData();

  // Calculate ROI data
  const roiData = expenses.map(expense => ({
    category: expense.category,
    amount: expense.amount,
    roi: ((Math.random() * 2) + 1) * expense.amount // Simulated ROI
  }));

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-4 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ROI Analysis */}
      <div className="bg-primary-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent-500" />
            <h3 className="text-lg font-medium text-white">ROI Analysis</h3>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="btn-primary py-2 px-4 flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            {loading ? 'Analyzing...' : 'Analyze ROI'}
          </button>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roiData}>
              <XAxis dataKey="category" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#fff'
                }}
              />
              <Bar name="Spent" dataKey="amount" fill="#3b82f6" />
              <Bar name="Return" dataKey="roi" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="w-5 h-5 text-accent-500" />
            <h3 className="text-lg font-medium text-white">Budget Allocation</h3>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {allocationData.map((entry, index) => (
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

        {/* Budget Utilization */}
        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-accent-500" />
            <h3 className="text-lg font-medium text-white">Budget Utilization</h3>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-primary-300">Utilization Rate</span>
              <span className="text-white font-medium">{utilizationRate.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-primary-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-500 transition-all duration-500"
                style={{ width: `${utilizationRate}%` }}
              />
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={utilizationData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  label
                >
                  <Cell fill="#f97316" />
                  <Cell fill="#3b82f6" />
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

      {/* Future Predictions */}
      <div className="bg-primary-700/50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Brain className="w-5 h-5 text-accent-500" />
          <h3 className="text-lg font-medium text-white">AI-Powered Predictions</h3>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={predictionData}>
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
                dataKey="actual"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
                name="Actual Spend"
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ fill: '#f97316' }}
                name="Predicted Spend"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights */}
      {analysis && (
        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Brain className="w-5 h-5 text-accent-500" />
            <h3 className="text-lg font-medium text-white">AI Insights</h3>
          </div>

          <div className="grid gap-4">
            {analysis.recommendations?.map((recommendation: string, index: number) => (
              <div
                key={index}
                className="flex items-start gap-3 bg-primary-600/50 rounded-lg p-4"
              >
                <Brain className="w-5 h-5 text-accent-500 mt-0.5" />
                <div>
                  <p className="text-white">{recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}