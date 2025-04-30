import { useState } from 'react';
import { useSeoTracking } from '../hooks/useSeoTracking';
import { useSeoEnhanced } from '../hooks/useSeoEnhanced';
import { BackButton } from './BackButton';
import { AIFeatureIndicator } from './AIFeatureIndicator';
import { SeoAudit } from './seo/SeoAudit';
import { KeywordResearch } from './seo/KeywordResearch';
import { CompetitorAnalysis } from './seo/CompetitorAnalysis';
import { TechnicalSeo } from './seo/TechnicalSeo';
import {
  Search,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Minus,
  ExternalLink,
  Edit2,
  X,
  LineChart,
  Brain,
  AlertCircle,
  Settings
} from 'lucide-react';

export function SeoTrackingManager() {
  const { trackings, loading, error, addKeyword, updateKeyword, updateRanking, deleteKeyword } = useSeoTracking();
  const { competitors, historicalData, backlinks, pageMetrics } = useSeoEnhanced();
  const [activeTab, setActiveTab] = useState<'tracking' | 'audit' | 'research' | 'technical'>('tracking');
  const [showAddKeyword, setShowAddKeyword] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [url, setUrl] = useState('');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'audit':
        return (
          <SeoAudit 
            url="https://example.com"
            onAudit={(results) => {
              console.log('Audit results:', results);
            }}
          />
        );
      case 'research':
        return (
          <KeywordResearch 
            onKeywordSelect={(keyword) => {
              console.log('Selected keyword:', keyword);
            }}
          />
        );
      case 'technical':
        return (
          <TechnicalSeo 
            onIssueFixed={(issue) => {
              console.log('Fixed issue:', issue);
            }}
          />
        );
      default:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Keyword Tracking</h3>
              <button
                onClick={() => setShowAddKeyword(true)}
                className="btn-primary py-2 px-4 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Keyword
              </button>
            </div>

            {/* Keyword Table */}
            <div className="bg-primary-700/50 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary-600">
                    <th className="text-left p-4 text-primary-200">Keyword</th>
                    <th className="text-left p-4 text-primary-200">URL</th>
                    <th className="text-center p-4 text-primary-200">Ranking</th>
                    <th className="text-center p-4 text-primary-200">Change</th>
                    <th className="text-center p-4 text-primary-200">Last Updated</th>
                    <th className="text-right p-4 text-primary-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trackings.map((track) => (
                    <tr key={track.id} className="border-b border-primary-600/50">
                      <td className="p-4 text-white">{track.keyword}</td>
                      <td className="p-4">
                        {track.url ? (
                          <a
                            href={track.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent-500 hover:text-accent-400 flex items-center gap-1"
                          >
                            {new URL(track.url).hostname}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-primary-400">-</span>
                        )}
                      </td>
                      <td className="p-4 text-center text-white">
                        {track.ranking || '-'}
                      </td>
                      <td className="p-4 text-center">
                        {track.ranking ? (
                          track.ranking > 0 ? (
                            <div className="flex items-center justify-center gap-1 text-green-400">
                              <ArrowUp className="w-4 h-4" />
                              <span>{track.ranking}</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1 text-red-400">
                              <ArrowDown className="w-4 h-4" />
                              <span>{Math.abs(track.ranking)}</span>
                            </div>
                          )
                        ) : (
                          <Minus className="w-4 h-4 text-primary-400 mx-auto" />
                        )}
                      </td>
                      <td className="p-4 text-center text-primary-300">
                        {new Date(track.tracked_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => updateKeyword(track.id, { keyword: track.keyword })}
                            className="text-primary-400 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteKeyword(track.id)}
                            className="text-primary-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <h2 className="text-xl font-semibold text-white">SEO Management</h2>
          <AIFeatureIndicator feature="SEO Optimization" />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b border-primary-700">
        <button
          onClick={() => setActiveTab('tracking')}
          className={`px-4 py-2 ${
            activeTab === 'tracking'
              ? 'text-accent-500 border-b-2 border-accent-500'
              : 'text-primary-300 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Keyword Tracking
          </div>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 ${
            activeTab === 'audit'
              ? 'text-accent-500 border-b-2 border-accent-500'
              : 'text-primary-300 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            SEO Audit
          </div>
        </button>
        <button
          onClick={() => setActiveTab('research')}
          className={`px-4 py-2 ${
            activeTab === 'research'
              ? 'text-accent-500 border-b-2 border-accent-500'
              : 'text-primary-300 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <LineChart className="w-4 h-4" />
            Keyword Research
          </div>
        </button>
        <button
          onClick={() => setActiveTab('technical')}
          className={`px-4 py-2 ${
            activeTab === 'technical'
              ? 'text-accent-500 border-b-2 border-accent-500'
              : 'text-primary-300 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Technical SEO
          </div>
        </button>
      </div>

      {/* Active Tab Content */}
      {renderActiveTab()}

      {/* Add Keyword Modal */}
      {showAddKeyword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-primary-700 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-white">Add Keyword</h3>
              <button
                onClick={() => setShowAddKeyword(false)}
                className="text-primary-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              await addKeyword(keyword, url);
              setShowAddKeyword(false);
              setKeyword('');
              setUrl('');
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-1">
                    Keyword
                  </label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-1">
                    Target URL (optional)
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
                    placeholder="https://example.com/page"
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddKeyword(false)}
                    className="px-4 py-2 text-primary-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary py-2 px-6">
                    Add Keyword
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}