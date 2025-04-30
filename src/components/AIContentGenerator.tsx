import { useState } from 'react';
import { useAI } from '../hooks/useAI';
import { Sparkles, Zap, BarChart, Send, Wand2, RefreshCw, Copy, Check } from 'lucide-react';

interface AIContentGeneratorProps {
  onGenerate?: (content: string) => void;
  onOptimize?: (content: string) => void;
  initialContent?: string;
  type?: 'social' | 'email' | 'blog';
}

export function AIContentGenerator({
  onGenerate,
  onOptimize,
  initialContent = '',
  type = 'social'
}: AIContentGeneratorProps) {
  const { generateContent, loading, error } = useAI();
  const [prompt, setPrompt] = useState('');
  const [content, setContent] = useState(initialContent);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    try {
      const response = await generateContent(prompt, type, {
        tone: 'professional',
        length: 'medium'
      });
      setContent(response.content);
      setSuggestions(response.suggestions || []);
      onGenerate?.(response.content);
    } catch (err) {
      console.error('Error generating content:', err);
    }
  };

  const handleOptimize = async () => {
    try {
      const response = await generateContent(content, type, {
        tone: 'professional',
        length: 'medium',
        optimize: true
      });
      setContent(response.content);
      setSuggestions(response.suggestions || []);
      onOptimize?.(response.content);
    } catch (err) {
      console.error('Error optimizing content:', err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-4">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-primary-200">
          What would you like to create?
        </label>
        <div className="flex gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Write a tweet about our new AI features..."
            className="flex-1 rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="btn-primary py-2 px-4 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generate
          </button>
        </div>
      </div>

      {content && (
        <div className="bg-primary-700/50 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Generated Content</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleOptimize}
                disabled={loading}
                className="p-2 text-primary-300 hover:text-white transition-colors"
                title="Optimize"
              >
                <Wand2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="p-2 text-primary-300 hover:text-white transition-colors"
                title="Regenerate"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopy}
                className="p-2 text-primary-300 hover:text-white transition-colors"
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-primary-600/50 rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-white font-sans">{content}</pre>
          </div>

          {suggestions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-primary-200 mb-2">
                Suggestions for Improvement
              </h4>
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-sm text-primary-300"
                  >
                    <Zap className="w-4 h-4 text-accent-500" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}