import { useState } from 'react';
import { useContent } from '../hooks/useContent';
import { FileText, Plus, Tag, Calendar, Edit2 } from 'lucide-react';
import type { ContentLibraryItem } from '../types/database';

export function ContentManager() {
  const { items, loading, createContent, updateContent } = useContent();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState('article');
  const [tags, setTags] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await createContent(
        title,
        content,
        contentType,
        tags.split(',').map(tag => tag.trim()).filter(Boolean)
      );
      setShowCreateForm(false);
      setTitle('');
      setContent('');
      setContentType('article');
      setTags('');
    } catch (err) {
      setError('Failed to create content. Please try again.');
      console.error(err);
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
        <h2 className="text-xl font-semibold text-white">Content Library</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary py-2 px-4 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Content
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {showCreateForm && (
        <form onSubmit={handleSubmit} className="bg-primary-700/50 rounded-xl p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-primary-200">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-primary-200">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
              required
            />
          </div>

          <div>
            <label htmlFor="contentType" className="block text-sm font-medium text-primary-200">
              Content Type
            </label>
            <select
              id="contentType"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="mt-1 block w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
            >
              <option value="article">Article</option>
              <option value="social">Social Post</option>
              <option value="email">Email Template</option>
            </select>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-primary-200">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="mt-1 block w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
              placeholder="marketing, blog, social"
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-primary-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary py-2 px-6">
              Create
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-primary-700/50 rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-accent-500" />
                <h3 className="text-lg font-medium text-white">{item.title}</h3>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-primary-600 transition-colors text-primary-300 hover:text-white">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-primary-300 line-clamp-3">{item.content}</p>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-primary-400">
                <Calendar className="w-4 h-4" />
                <span>{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1 text-primary-400">
                <Tag className="w-4 h-4" />
                <span>{item.content_type}</span>
              </div>
            </div>

            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs rounded-full bg-primary-600/50 text-primary-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}