import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Only show back button if not on main dashboard
  if (location.pathname === '/dashboard') {
    return null;
  }

  return (
    <button
      onClick={() => navigate('/dashboard')}
      className="flex items-center gap-2 text-primary-300 hover:text-white transition-colors"
      aria-label="Back to Dashboard"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Back to Dashboard</span>
    </button>
  );
}