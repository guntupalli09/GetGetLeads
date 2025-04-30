import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, message, icon, action }: EmptyStateProps) {
  return (
    <div className="min-h-[300px] flex items-center justify-center">
      <div className="text-center">
        {icon || <FolderOpen className="w-12 h-12 text-primary-400 mx-auto mb-4" />}
        <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
        <p className="text-primary-300 mb-4">{message}</p>
        {action}
      </div>
    </div>
  );
}