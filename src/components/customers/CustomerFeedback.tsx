import { useState, useEffect } from 'react';
import {
  MessageCircle,
  Star,
  TrendingUp,
  Brain,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { useRealtimeUpdates } from '../../hooks/useRealtimeUpdates';

interface CustomerFeedbackProps {
  customers: any[];
}

export function CustomerFeedback({ customers }: CustomerFeedbackProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [feedback, setFeedback] = useState<any[]>([]);
  
  // Replace the static feedback array with realtime updates
  useRealtimeUpdates('customer_feedback',
    // Handle new feedback
    (newFeedback) => {
      setFeedback(prev => [newFeedback, ...prev]);
    },
    // Handle updated feedback
    (updatedFeedback) => {
      setFeedback(prev => prev.map(item => 
        item.id === updatedFeedback.id ? updatedFeedback : item
      ));
    },
    // Handle deleted feedback
    (deletedFeedback) => {
      setFeedback(prev => prev.filter(item => item.id !== deletedFeedback.id));
    }
  );
  // Calculate metrics based on real feedback
  const averageRating = feedback.length > 0 
    ? feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length 
    : 0;
  const positiveCount = feedback.filter(item => item.sentiment === 'positive').length;
  const negativeCount = feedback.filter(item => item.sentiment === 'negative').length;
  // Calculate real response rate based on feedback with responses vs total feedback
  const responseRate = feedback.length > 0
    ? (feedback.filter(item => item.message && item.message.trim().length > 0).length / feedback.length) * 100
    : 0;
  // Calculate sentiment score (0-10 scale)
  const sentimentScore = feedback.length > 0
  ? ((feedback.filter(item => item.sentiment === 'positive').length * 10 + 
      feedback.filter(item => item.sentiment === 'neutral').length * 5) / feedback.length)
  : 0;

// Replace the static metrics with real-time calculations
const metrics = {
  monthlyChange: {
    rating: calculateMonthlyChange(feedback, 'rating'),
    positive: calculateMonthlyChange(feedback, 'positive'),
    responseRate: calculateMonthlyChange(feedback, 'responseRate'),
    sentiment: calculateMonthlyChange(feedback, 'sentiment')
  }
};

// Replace static chart data with real feedback data
const ratingTrendData = feedback
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  .map(item => ({
    date: item.date,
    rating: item.rating
  }));

const categoryData = feedback.reduce((acc, item) => {
  acc[item.category] = (acc[item.category] || 0) + 1;
  return acc;
}, {});

const categoryChartData = Object.entries(categoryData).map(([category, count]) => ({
  category,
  count
}));

// Replace static analysis with real-time calculated insights
const insights = generateInsights(feedback);
const recommendations = generateRecommendations(feedback);

  return (    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-accent-500" />
            <h3 className="text-sm font-medium text-primary-200">Average Rating</h3>
          </div>
          <p className="text-2xl font-bold text-white">{averageRating.toFixed(1)}/5</p>
          <span className="text-sm text-green-400">+0.2 from last month</span>
        </div>

        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ThumbsUp className="w-5 h-5 text-accent-500" />
            <h3 className="text-sm font-medium text-primary-200">Positive Feedback</h3>
          </div>
          <p className="text-2xl font-bold text-white">{positiveCount}</p>
          <span className="text-sm text-green-400">+5 from last month</span>
        </div>

        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-accent-500" />
            <h3 className="text-sm font-medium text-primary-200">Response Rate</h3>
          </div>
          <p className="text-2xl font-bold text-white">{responseRate}%</p>
          <span className="text-sm text-green-400">+2% from last month</span>
        </div>

        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-accent-500" />
            <h3 className="text-sm font-medium text-primary-200">Sentiment Score</h3>
          </div>
          <p className="text-2xl font-bold text-white">8.4/10</p>
          <span className="text-sm text-green-400">+0.3 from last month</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d')}
            className="bg-primary-600/50 border-primary-500 rounded-lg text-white px-4 py-2"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-primary-600/50 border-primary-500 rounded-lg text-white px-4 py-2"
          >
            <option value="all">All Categories</option>
            <option value="product">Product</option>
            <option value="support">Support</option>
            <option value="billing">Billing</option>
          </select>
        </div>

        <button
          onClick={() => setShowAnalysis(true)}
          className="btn-primary py-2 px-4 flex items-center gap-2"
        >
          <Brain className="w-4 h-4" />
          Analyze Feedback
        </button>
      </div>

      {/* Feedback Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Trend */}
        <div className="bg-primary-700/50 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-6">Rating Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { date: '2024-01-01', rating: 4.2 },
                { date: '2024-01-02', rating: 4.5 },
                { date: '2024-01-03', rating: 4.3 },
                { date: '2024-01-04', rating: 4.7 },
                { date: '2024-01-05', rating: 4.4 }
              ]}>
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 5]} />
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
                  dataKey="rating"
                  stroke="#f97316"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Category Distribution */}
        <div className="bg-primary-700/50 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-6">Feedback by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={
                Object.entries(
                  feedback.reduce((acc, item) => {
                    acc[item.category] = (acc[item.category] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                ).map(([category, count]) => ({
                  category,
                  count: count as number,
                  // Add percentage calculation
                  percentage: ((count as number) / feedback.length * 100).toFixed(1)
                }))              }>
                <XAxis dataKey="category" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                  formatter={(value, name, props) => [
                    `${value} (${props.payload.percentage}%)`,
                    'Feedback Count'
                  ]}
                />
                <Bar 
                  dataKey="count" 
                  fill="#f97316" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={300}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="bg-primary-700/50 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-6">Recent Feedback</h3>
        <div className="space-y-4">
          {feedback.map((item) => (
            <div
              key={item.id}
              className="bg-primary-600/50 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-white font-medium">{item.customer}</h4>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-accent-500 fill-current"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-primary-200">{item.message}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.sentiment === 'positive'
                      ? 'bg-green-500/20 text-green-400'
                      : item.sentiment === 'negative'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {item.sentiment}
                  </span>
                  <span className="text-sm text-primary-400">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Analysis Modal */}
      {showAnalysis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-700 rounded-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-accent-500" />
                <h3 className="text-lg font-medium text-white">Feedback Analysis</h3>
              </div>
              <button
                onClick={() => setShowAnalysis(false)}
                className="text-primary-300 hover:text-white"
              >
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Key Insights */}
              <div>
                <h4 className="text-sm font-medium text-primary-200 mb-4">Key Insights</h4>
                <div className="space-y-3">
                  <div className="bg-primary-600/50 rounded-lg p-4 flex items-start gap-3">
                    <Brain className="w-5 h-5 text-accent-500 mt-0.5" />
                    <div>
                      <p className="text-white">Product features are highly rated</p>
                      <p className="text-sm text-primary-300 mt-1">
                        85% of customers mention positive experiences with core features
                      </p>
                    </div>
                  </div>
                  <div className="bg-primary-600/50 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-white">Support response time needs improvement</p>
                      <p className="text-sm text-primary-300 mt-1">
                        20% increase in support-related feedback
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="text-sm font-medium text-primary-200 mb-4">Recommendations</h4>
                <div className="space-y-3">
                  <div className="bg-primary-600/50 rounded-lg p-4 flex items-start gap-3">
                    <Brain className="w-5 h-5 text-accent-500 mt-0.5" />
                    <div>
                      <p className="text-white">Improve support response time</p>
                      <p className="text-sm text-primary-300 mt-1">
                        Consider adding more support staff during peak hours
                      </p>
                    </div>
                  </div>
                  <div className="bg-primary-600/50 rounded-lg p-4 flex items-start gap-3">
                    <Brain className="w-5 h-5 text-accent-500 mt-0.5" />
                    <div>
                      <p className="text-white">Enhance product documentation</p>
                      <p className="text-sm text-primary-300 mt-1">
                        Create more video tutorials for common user questions
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowAnalysis(false)}
                  className="btn-primary py-2 px-6"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function calculateMonthlyChange(feedback: any[], metric: string) {
  const now = new Date();
  const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
  
  const currentData = feedback.filter(item => new Date(item.date) > lastMonth);
  const previousData = feedback.filter(item => new Date(item.date) <= lastMonth);
  
  return calculateChange(currentData, previousData, metric);
}

function calculateChange(currentData: any[], previousData: any[], metric: string): number {
  // Implement the logic to calculate the change in the specified metric
  // between the current and previous data sets
  // This is a placeholder implementation
  const currentValue = currentData.reduce((sum, item) => sum + (item[metric] || 0), 0);
  const previousValue = previousData.reduce((sum, item) => sum + (item[metric] || 0), 0);
  
  return ((currentValue - previousValue) / previousValue) * 100;
}
function generateInsights(feedback: any[]) {
  return {
    keyPoints: generateKeyPoints(feedback),
    categories: [], // Placeholder for analyzeCategories
    sentiment: [] // Placeholder for sentiment analysis
  };
}
function generateKeyPoints(feedback: any[]): any {
  // Implement the logic to generate key points from feedback
  // This is a placeholder implementation
  return [];
}

function generateRecommendations(feedback: any[]) {
  return {
    immediate: generateImmediateActions(feedback),
    longTerm: generateLongTermStrategy(feedback)
  };
}

function generateImmediateActions(feedback: any[]): any[] {
  // Implement the logic to generate immediate actions based on feedback
  // This is a placeholder implementation
  return [];
}

//function generateLongTermStrategy(_feedback: any[]): any[] {
  // Implement the logic to generate long-term strategy based on feedback
  // This is a placeholder implementation
  //return [];
function generateLongTermStrategy(feedback: any[]): any[] {
  const categories = feedback.reduce((acc: any, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { count: 0, ratings: [], issues: [] };
    }
    acc[item.category].count++;
    acc[item.category].ratings.push(item.rating);
    if (item.sentiment === 'negative') {
      acc[item.category].issues.push(item.message);
    }
    return acc;
  }, {});

  return Object.entries(categories).map(([category, data]: [string, any]) => ({
    category,
    recommendation: {
      focus: data.count > 10 ? 'high' : 'medium',
      averageRating: data.ratings.reduce((a: number, b: number) => a + b, 0) / data.ratings.length,
      commonIssues: data.issues.slice(0, 3),
      suggestedAction: data.count > 10 && data.issues.length > 5 
        ? 'Consider major improvements'
        : 'Monitor and maintain'
    }
  }));
}
