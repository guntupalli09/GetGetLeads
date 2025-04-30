import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  message?: string;
}

export function LoadingSpinner({ size = 24, className = '', message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 
        className={`animate-spin text-accent-500 ${className}`}
        size={size}
      />
      {message && (
        <p className="text-primary-300 text-sm">{message}</p>
      )}
    </div>
  );
}