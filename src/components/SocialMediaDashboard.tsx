import { useState } from 'react';
import { useSocialMedia } from '../hooks/useSocialMedia';
import { usePostAutomation } from '../hooks/usePostAutomation';
import { BackButton } from './BackButton';
import { SocialAccountConnect } from './SocialAccountConnect';
import { AIContentGenerator } from './AIContentGenerator';
import { LoadingSpinner } from './LoadingSpinner';
import { AlertCircle, Plus, Settings, Share2, X } from 'lucide-react';

export function SocialMediaDashboard() {
  const { accounts = [], posts = [], loading, error, addAccount, createPost } = useSocialMedia();
  const { scheduleAutomatedPosts, isScheduling } = usePostAutomation();
  const [showConnectAccounts, setShowConnectAccounts] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showAutoSchedule, setShowAutoSchedule] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Auto-schedule settings
  const [duration, setDuration] = useState(7);
  const [postsPerDay, setPostsPerDay] = useState(2);
  const [topics, setTopics] = useState('marketing, business, technology');
  const [includeImages, setIncludeImages] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-4 max-w-md text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">Failed to load social media data</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const handleAutoSchedule = async (accountId: string) => {
    try {
      await scheduleAutomatedPosts(accountId, {
        duration,
        postsPerDay,
        topics: topics.split(',').map(t => t.trim()),
        includeImages,
        includeHashtags
      });
      setShowAutoSchedule(false);
    } catch (err) {
      console.error('Failed to schedule posts:', err);
      setConnectionError('Failed to schedule posts. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <h2 className="text-xl font-semibold text-white">Social Media</h2>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowConnectAccounts(true)}
            className="btn-primary py-2 px-4 flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Connect Accounts
          </button>
          {accounts.length > 0 && (
            <button
              onClick={() => setShowCreatePost(true)}
              className="btn-primary py-2 px-4 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Post
            </button>
          )}
        </div>
      </div>

      {connectionError && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-4">
          {connectionError}
        </div>
      )}

      {/* Connected Accounts */}
      {accounts.length > 0 ? (
        <div className="grid gap-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-primary-700/50 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Share2 className="w-4 h-4" />
                <span className="text-white">{account.account_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-primary-400 capitalize">{account.platform}</span>
                <button
                  onClick={() => {
                    setSelectedAccountId(account.id);
                    setShowAutoSchedule(true);
                  }}
                  disabled={isScheduling}
                  className="ml-4 px-3 py-1 text-sm bg-primary-600/50 hover:bg-primary-600 text-primary-200 rounded-lg transition-colors"
                >
                  {isScheduling && selectedAccountId === account.id ? 'Scheduling...' : 'Auto Schedule'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Share2 className="w-12 h-12 text-primary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Connected Accounts</h3>
          <p className="text-primary-300 mb-6">
            Connect your social media accounts to start managing your posts.
          </p>
          <button
            onClick={() => setShowConnectAccounts(true)}
            className="btn-primary py-2 px-6"
          >
            Connect Account
          </button>
        </div>
      )}

      {/* Recent Posts */}
      {posts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Recent Posts</h3>
          <div className="grid gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-primary-700/50 rounded-xl p-4 space-y-3"
              >
                <p className="text-primary-200">{post.content}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary-400">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    post.status === 'published' ? 'bg-green-500/20 text-green-400' :
                    post.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-primary-600/50 text-primary-300'
                  }`}>
                    {post.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connect Accounts Modal */}
      {showConnectAccounts && (
        <SocialAccountConnect
          onSuccess={() => {
            setShowConnectAccounts(false);
            setConnectionError(null);
          }}
          onError={(err) => {
            setConnectionError(err.message);
          }}
        />
      )}

      {/* Auto Schedule Modal */}
      {showAutoSchedule && selectedAccountId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-700 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-white">Auto Schedule Settings</h3>
              <button
                onClick={() => setShowAutoSchedule(false)}
                className="text-primary-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-200 mb-1">
                  Duration (days)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  min="1"
                  max="30"
                  className="w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-200 mb-1">
                  Posts per Day
                </label>
                <input
                  type="number"
                  value={postsPerDay}
                  onChange={(e) => setPostsPerDay(parseInt(e.target.value))}
                  min="1"
                  max="5"
                  className="w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-200 mb-1">
                  Topics (comma-separated)
                </label>
                <input
                  type="text"
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  className="w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-primary-200">
                  <input
                    type="checkbox"
                    checked={includeImages}
                    onChange={(e) => setIncludeImages(e.target.checked)}
                    className="rounded border-primary-500"
                  />
                  Include Images
                </label>

                <label className="flex items-center gap-2 text-primary-200">
                  <input
                    type="checkbox"
                    checked={includeHashtags}
                    onChange={(e) => setIncludeHashtags(e.target.checked)}
                    className="rounded border-primary-500"
                  />
                  Include Hashtags
                </label>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowAutoSchedule(false)}
                  className="px-4 py-2 text-primary-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAutoSchedule(selectedAccountId)}
                  disabled={isScheduling}
                  className="btn-primary py-2 px-6"
                >
                  {isScheduling ? 'Scheduling...' : 'Start Scheduling'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}