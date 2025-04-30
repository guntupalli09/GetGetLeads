import { useState } from 'react';
import { useAI } from '../../hooks/useAI';
import { AlertCircle, CheckCircle, Search, Zap, Activity, Brain } from 'lucide-react';

interface SeoAuditProps {
  url: string;
  onAudit: (results: any) => void;
}

export function SeoAudit({ url, onAudit }: SeoAuditProps) {
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [issues, setIssues] = useState<any[]>([]);

  const handleAudit = async () => {
    setLoading(true);
    try {
      // Simulated audit results
      const results = {
        score: 75,
        issues: [
          {
            type: 'meta',
            severity: 'high',
            message: 'Missing meta descriptions on 5 pages',
            pages: ['/blog', '/products', '/about']
          },
          {
            type: 'speed',
            severity: 'medium',
            message: 'Slow loading time on mobile devices',
            details: 'Average load time: 4.2s'
          }
        ]
      };
      
      setScore(results.score);
      setIssues(results.issues);
      onAudit(results);
    } catch (err) {
      console.error('Audit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-accent-500" />
            <h3 className="text-lg font-medium text-white">SEO Audit</h3>
          </div>
          <button
            onClick={handleAudit}
            disabled={loading}
            className="btn-primary py-2 px-4 flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {loading ? 'Running Audit...' : 'Start Audit'}
          </button>
        </div>

        {score !== null && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-primary-600/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-primary-200">SEO Score</span>
                <Activity className="w-4 h-4 text-accent-500" />
              </div>
              <p className="text-3xl font-bold text-white mt-2">{score}/100</p>
            </div>
            
            <div className="bg-primary-600/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-primary-200">Critical Issues</span>
                <AlertCircle className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-white mt-2">
                {issues.filter(i => i.severity === 'high').length}
              </p>
            </div>

            <div className="bg-primary-600/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-primary-200">Opportunities</span>
                <Brain className="w-4 h-4 text-accent-500" />
              </div>
              <p className="text-3xl font-bold text-white mt-2">
                {issues.filter(i => i.severity === 'medium').length}
              </p>
            </div>
          </div>
        )}

        {issues.length > 0 && (
          <div className="space-y-4">
            {issues.map((issue, index) => (
              <div
                key={index}
                className={`bg-primary-600/50 rounded-lg p-4 flex items-start gap-3 ${
                  issue.severity === 'high'
                    ? 'border-l-4 border-red-500'
                    : 'border-l-4 border-yellow-500'
                }`}
              >
                {issue.severity === 'high' ? (
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                )}
                <div>
                  <p className="text-white font-medium">{issue.message}</p>
                  {issue.details && (
                    <p className="text-primary-300 text-sm mt-1">{issue.details}</p>
                  )}
                  {issue.pages && (
                    <div className="mt-2">
                      <p className="text-sm text-primary-300">Affected pages:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {issue.pages.map((page: string) => (
                          <span
                            key={page}
                            className="px-2 py-1 text-xs bg-primary-500/50 rounded-full text-primary-200"
                          >
                            {page}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}