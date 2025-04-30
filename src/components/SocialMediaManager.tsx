import { useState } from 'react';
import { useSocialMedia } from '../hooks/useSocialMedia';
import { usePostAutomation } from '../hooks/usePostAutomation';
import { Share2, Plus, Twitter, Facebook, Instagram, Calendar, Edit2, Clock, Image as ImageIcon, Hash, FileText } from 'lucide-react';
import type { SocialMediaAccount, SocialMediaPost } from '../types/database';

const PLATFORMS = ['twitter', 'facebook', 'instagram', 'linkedin'];

export function SocialMediaManager() {
  const { accounts, posts, loading, error, addAccount, createPost } = useSocialMedia();
  const { scheduleAutomatedPosts, isScheduling } = usePostAutomation();
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [platform, setPlatform] = useState('twitter');
  const [accountName, setAccountName] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [postContent, setPostContent] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAccount(platform, accountName);
      setShowCreateAccount(false);
      setPlatform('twitter');
      setAccountName('');
    } catch (err) {
      console.error('Error adding account:', err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPost(
        selectedAccount,
        postContent,
        [],
        scheduledDate ? new Date(scheduledDate) : undefined
      );
      setShowCreatePost(false);
      setSelectedAccount('');
      setPostContent('');
      setScheduledDate('');
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handleScheduleAutomated = async (accountId: string) => {
    try {
      await scheduleAutomatedPosts(accountId);
    } catch (err) {
      console.error('Error scheduling automated posts:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Social Media</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setShowCreateAccount(!showCreateAccount)}
            className="btn-primary py-2 px-4 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
          <button
            onClick={() => setShowCreatePost(!showCreatePost)}
            className="btn-primary py-2 px-4 flex items-center gap-2"
            disabled={accounts.length === 0}
          >
            <Plus className="w-4 h-4" />
            Create Post
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {showCreateAccount && (
        <form onSubmit={handleAddAccount} className="bg-primary-700/50 rounded-xl p-6 space-y-4">
          <div>
            <label htmlFor="platform" className="block text-sm font-medium text-primary-200">
              Platform
            </label>
            <select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="mt-1 block w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="accountName" className="block text-sm font-medium text-primary-200">
              Account Name
            </label>
            <input
              type="text"
              id="accountName"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="mt-1 block w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
              required
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setShowCreateAccount(false)}
              className="px-4 py-2 text-primary-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary py-2 px-6">
              Add Account
            </button>
          </div>
        </form>
      )}

      {showCreatePost && (
        <form onSubmit={handleCreatePost} className="bg-primary-700/50 rounded-xl p-6 space-y-4">
          <div>
            <label htmlFor="account" className="block text-sm font-medium text-primary-200">
              Account
            </label>
            <select
              id="account"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="mt-1 block w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
              required
            >
              <option value="">Select an account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.platform} - {account.account_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-primary-200">
              Content
            </label>
            <textarea
              id="content"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
              required
            />
          </div>

          <div>
            <label htmlFor="scheduledDate" className="block text-sm font-medium text-primary-200">
              Schedule For (optional)
            </label>
            <input
              type="datetime-local"
              id="scheduledDate"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="mt-1 block w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setShowCreatePost(false)}
              className="px-4 py-2 text-primary-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary py-2 px-6">
              Create Post
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Connected Accounts</h3>
          <div className="grid gap-4">
            {accounts.map((account) => (
              <div key={account.id} className="bg-primary-700/50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {account.platform === 'twitter' && <Twitter className="w-4 h-4" />}
                  {account.platform === 'facebook' && <Facebook className="w-4 h-4" />}
                  {account.platform === 'instagram' && <Instagram className="w-4 h-4" />}
                  {!['twitter', 'facebook', 'instagram'].includes(account.platform) && <Share2 className="w-4 h-4" />}
                  <span className="text-white">{account.account_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-primary-400 capitalize">{account.platform}</span>
                  <button
                    onClick={() => handleScheduleAutomated(account.id)}
                    disabled={isScheduling}
                    className="ml-4 px-3 py-1 text-sm bg-primary-600/50 hover:bg-primary-600 text-primary-200 rounded-lg transition-colors"
                  >
                    Auto Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Recent Posts</h3>
          <div className="grid gap-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-primary-700/50 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <p className="text-primary-200">{post.content}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      post.status === 'published' ? 'bg-green-500/20 text-green-400' :
                      post.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-primary-600/50 text-primary-300'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {post.scheduled_for && (
                    <div className="flex items-center gap-1 text-primary-400">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(post.scheduled_for).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-primary-400">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}