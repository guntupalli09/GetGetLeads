import { Sparkles } from 'lucide-react';

interface AIFeatureIndicatorProps {
  feature: string;
  className?: string;
}

export function AIFeatureIndicator({ feature, className = '' }: AIFeatureIndicatorProps) {
  return (
    <div className={`flex items-center gap-2 text-accent-500 ${className}`}>
      <Sparkles className="w-4 h-4" />
      <span className="text-sm font-medium">AI-Powered {feature}</span>
    </div>
  );
}