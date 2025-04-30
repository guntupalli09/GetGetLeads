import { useState } from 'react';
import { useAI } from '../../hooks/useAI';
import { Mail, Sparkles, Send, Image as ImageIcon, Link, Type } from 'lucide-react';
import { showError } from '../../lib/toast';

interface EmailBuilderProps {
  templates?: any[];
  onSave: (campaign: any) => Promise<void>;
  onAIAssist?: (type: string, content: string) => Promise<any>;
}

export function EmailBuilder({ templates = [], onSave, onAIAssist }: EmailBuilderProps) {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [generating, setGenerating] = useState(false);
  const { generateContent } = useAI();

  const handleAIAssist = async (type: 'subject' | 'content') => {
    try {
      setGenerating(true);
      const prompt = type === 'subject' 
        ? `Generate an engaging email subject line about: ${subject || 'our product/service'}`
        : `Generate engaging email content about: ${content || 'our product/service'}`;

      const result = onAIAssist 
        ? await onAIAssist(type, prompt)
        : await generateContent(prompt, 'email');

      if (type === 'subject') {
        setSubject(result.content);
      } else {
        setContent(result.content);
      }
    } catch (err) {
      console.error('Error generating content:', err);
      showError('Failed to generate content. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!subject || !content) {
      showError('Please provide both subject and content');
      return;
    }

    try {
      await onSave({
        subject,
        content,
        template_id: selectedTemplate || null
      });
    } catch (err) {
      console.error('Error saving campaign:', err);
      showError('Failed to save campaign');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary-700/50 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-6">Campaign Builder</h3>

        {/* Template Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-primary-200 mb-2">
            Start with a Template
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
          >
            <option value="">Select a template</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Line */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-primary-200">
              Subject Line
            </label>
            <button
              onClick={() => handleAIAssist('subject')}
              disabled={generating}
              className="text-accent-500 hover:text-accent-400 text-sm flex items-center gap-1"
            >
              <Sparkles className="w-4 h-4" />
              AI Assist
            </button>
          </div>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
            placeholder="Enter email subject..."
          />
        </div>

        {/* Email Content */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-primary-200">
              Email Content
            </label>
            <button
              onClick={() => handleAIAssist('content')}
              disabled={generating}
              className="text-accent-500 hover:text-accent-400 text-sm flex items-center gap-1"
            >
              <Sparkles className="w-4 h-4" />
              AI Assist
            </button>
          </div>
          <div className="bg-primary-600 border border-primary-500 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 p-2 border-b border-primary-500">
              <button className="p-1.5 hover:bg-primary-500 rounded">
                <Type className="w-4 h-4 text-primary-300" />
              </button>
              <button className="p-1.5 hover:bg-primary-500 rounded">
                <ImageIcon className="w-4 h-4 text-primary-300" />
              </button>
              <button className="p-1.5 hover:bg-primary-500 rounded">
                <Link className="w-4 h-4 text-primary-300" />
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full bg-transparent border-none text-white px-4 py-2 focus:ring-0"
              placeholder="Write your email content..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleSave}
            disabled={!subject || !content}
            className="btn-primary py-2 px-6 flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Save Campaign
          </button>
        </div>
      </div>
    </div>
  );
}