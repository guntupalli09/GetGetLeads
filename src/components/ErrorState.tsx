import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = 'Something went wrong', 
  message, 
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-primary-300 mb-4 max-w-md">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="btn-primary"
        >
          Try Again
        </button>
      )}
    </div>
  );
}