import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { AuthCallback } from './pages/AuthCallback';
import { SeoTrackingManager } from './components/SeoTrackingManager';
import { EmailCampaignManager } from './components/EmailCampaignManager';
import { SocialMediaDashboard } from './components/SocialMediaDashboard';
import { BudgetManager } from './components/BudgetManager';
import { CustomerManager } from './components/CustomerManager';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { AuthRequired } from './components/AuthRequired';
import { useAuth } from './hooks/useAuth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorState } from './components/ErrorState';
import { Toaster } from 'react-hot-toast';

function App() {
  const { user } = useAuth();

  return (
    <>
      <ErrorBoundary>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <AuthRequired>
              <ErrorBoundary fallback={<ErrorState message="Failed to load dashboard" />}>
                <Dashboard />
              </ErrorBoundary>
            </AuthRequired>
          } />
          
          <Route path="/analytics" element={
            <AuthRequired>
              <ErrorBoundary fallback={<ErrorState message="Failed to load analytics" />}>
                <AnalyticsDashboard />
              </ErrorBoundary>
            </AuthRequired>
          } />
          
          <Route path="/customers" element={
            <AuthRequired>
              <ErrorBoundary fallback={<ErrorState message="Failed to load customer management" />}>
                <CustomerManager />
              </ErrorBoundary>
            </AuthRequired>
          } />
          
          <Route path="/seo" element={
            <AuthRequired>
              <ErrorBoundary fallback={<ErrorState message="Failed to load SEO tracking" />}>
                <SeoTrackingManager />
              </ErrorBoundary>
            </AuthRequired>
          } />
          
          <Route path="/email" element={
            <AuthRequired>
              <ErrorBoundary fallback={<ErrorState message="Failed to load email campaigns" />}>
                <EmailCampaignManager />
              </ErrorBoundary>
            </AuthRequired>
          } />
          
          <Route path="/social" element={
            <AuthRequired>
              <ErrorBoundary fallback={<ErrorState message="Failed to load social media dashboard" />}>
                <SocialMediaDashboard />
              </ErrorBoundary>
            </AuthRequired>
          } />
          
          <Route path="/budget" element={
            <AuthRequired>
              <ErrorBoundary fallback={<ErrorState message="Failed to load budget manager" />}>
                <BudgetManager />
              </ErrorBoundary>
            </AuthRequired>
          } />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
      <Toaster position="top-right" />
    </>
  );
}

export default App;