import { useState } from 'react';
import { Brain, Sparkles, ArrowRight } from 'lucide-react';

interface CampaignSuggestionsProps {
  businessType: string;
  onSelect: (suggestion: any) => Promise<void>;
}

export function CampaignSuggestions({ businessType, onSelect }: CampaignSuggestionsProps) {
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  const suggestions = [
    {
      id: '1',
      title: 'Welcome Series',
      description: 'Introduce new subscribers to your brand with a 3-part welcome series',
      type: 'automation',
      roi: '150%',
      difficulty: 'Easy'
    },
    {
      id: '2',
      title: 'Re-engagement Campaign',
      description: 'Win back inactive subscribers with personalized offers',
      type: 'targeted',
      roi: '120%',
      difficulty: 'Medium'
    },
    {
      id: '3',
      title: 'Product Launch',
      description: 'Build excitement for your upcoming product launch',
      type: 'promotional',
      roi: '200%',
      difficulty: 'Medium'
    },
    {
      id: '4',
      title: 'Customer Feedback',
      description: 'Gather valuable insights from your customers',
      type: 'engagement',
      roi: '100%',
      difficulty: 'Easy'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-primary-700/50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Brain className="w-5 h-5 text-accent-500" />
          <h3 className="text-lg font-medium text-white">AI Campaign Suggestions</h3>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`bg-primary-600/50 rounded-lg p-6 cursor-pointer transition-all ${
                selectedSuggestion === suggestion.id
                  ? 'ring-2 ring-accent-500'
                  : 'hover:bg-primary-600'
              }`}
              onClick={() => setSelectedSuggestion(suggestion.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-medium text-white mb-2">
                    {suggestion.title}
                  </h4>
                  <p className="text-primary-300 mb-4">{suggestion.description}</p>
                </div>
                <Sparkles className="w-5 h-5 text-accent-500" />
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span className="text-primary-300">
                  Expected ROI: <span className="text-green-400">{suggestion.roi}</span>
                </span>
                <span className="text-primary-300">
                  Difficulty: <span className="text-primary-200">{suggestion.difficulty}</span>
                </span>
              </div>

              {selectedSuggestion === suggestion.id && (
                <button
                  onClick={() => onSelect(suggestion)}
                  className="mt-4 w-full btn-primary py-2 flex items-center justify-center gap-2"
                >
                  Use This Template
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}