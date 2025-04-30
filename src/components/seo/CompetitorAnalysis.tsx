import { useState } from 'react';
import { useAI } from '../../hooks/useAI';
import {
  Users,
  TrendingUp,
  Link2,
  Search,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface CompetitorAnalysisProps {
  competitors: any[];
  onAnalyze: (competitor: string) => Promise<void>;
}

export function CompetitorAnalysis({ competitors, onAnalyze }: CompetitorAnalysisProps) {
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (url: string) => {
    setLoading(true);
    try {
      await onAnalyze(url);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent-500" />
            <h3 className="text-lg font-medium text-white">Competitor Analysis</h3>
          </div>
          <button className="btn-primary py-2 px-4 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Competitor
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Competitor List */}
          <div className="space-y-4">
            {competitors.map((competitor) => (
              <div
                key={competitor.id}
                className={`bg-primary-600/50 rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedCompetitor === competitor.id ? 'ring-2 ring-accent-500' : ''
                }`}
                onClick={() => setSelectedCompetitor(competitor.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-medium text-white">
                        {competitor.domain}
                      </h4>
                      <a
                        href={`https://${competitor.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-500 hover:text-accent-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-primary-300">
                        Traffic: {competitor.traffic.toLocaleString()}
                      </span>
                      <span className="text-primary-300">
                        Keywords: {competitor.keywords.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAnalyze(competitor.domain);
                    }}
                    disabled={loading}
                    className="btn-secondary py-1 px-3 text-sm"
                  >
                    {loading ? 'Analyzing...' : 'Analyze'}
                  </button>
                </div>

                {selectedCompetitor === competitor.id && (
                  <div className="mt-4 pt-4 border-t border-primary-500">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-primary-200 mb-1">
                          Domain Authority
                        </h5>
                        <p className="text-2xl font-bold text-white">
                          {competitor.domainAuthority}
                        </p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-primary-200 mb-1">
                          Backlinks
                        </h5>
                        <p className="text-2xl font-bold text-white">
                          {competitor.backlinks.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-primary-200 mb-1">
                          Ranking Keywords
                        </h5>
                        <p className="text-2xl font-bold text-white">
                          {competitor.rankingKeywords.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Competitor Insights */}
          {selectedCompetitor && (
            <div className="bg-primary-600/50 rounded-lg p-4">
              <h4 className="text-lg font-medium text-white mb-4">Competitor Insights</h4>
              
              {/* Traffic Trend */}
              <div className="h-48 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={competitors[0].trafficTrend}>
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
                      dataKey="traffic"
                      stroke="#f97316"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Top Keywords */}
              <h5 className="text-sm font-medium text-primary-200 mb-2">
                Top Ranking Keywords
              </h5>
              <div className="space-y-2">
                {competitors[0].topKeywords.map((keyword: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-primary-500/20 rounded p-2"
                  >
                    <span className="text-white">{keyword.term}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-primary-300">
                        Position: {keyword.position}
                      </span>
                      <span className="text-primary-300">
                        Volume: {keyword.volume}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Add loading state component
export const CompetitorSkeleton = () => (
  <div className="bg-primary-600/50 rounded-lg p-4 animate-pulse">
    <div className="h-6 w-48 bg-primary-500/50 rounded mb-4" />
    <div className="space-y-3">
      <div className="h-4 w-full bg-primary-500/50 rounded" />
      <div className="h-4 w-3/4 bg-primary-500/50 rounded" />
    </div>
  </div>
);
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-primary-500/50 ${className}`}
      {...props}
    />
  );
}
