import { useState, useEffect } from 'react';
import { RealtimeSubscription } from '../../lib/realtime';
import {
  Settings, Smartphone, Zap, Search, AlertCircle, 
  CheckCircle, Download, Code, RefreshCw
} from 'lucide-react';

interface SEOMetric {
  type: 'critical' | 'warning';
  category: 'health' | 'mobile' | 'speed' | 'crawl';
  issue: string;
  impact: string;
  recommendation: string;
}

interface TechnicalSeoProps {
  onIssueFixed: (issue: SEOMetric) => void;
}

export function TechnicalSeo({ onIssueFixed }: TechnicalSeoProps) {
  const [scanning, setScanning] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'health' | 'mobile' | 'speed' | 'crawl'>('health');
  const [issues, setIssues] = useState<SEOMetric[]>([]);
  const [metrics, setMetrics] = useState({
    ssl: true,
    robotsTxt: false,
    sitemap: true,
    mobileScore: 86,
    loadTime: '2.3s',
    firstPaint: '0.8s',
    ttfb: '180ms',
    indexedPages: 128
  });

  useEffect(() => {
    const subscription = new RealtimeSubscription('seo_metrics', handleMetricUpdate);
    subscription.subscribe({ event: 'INSERT' });
    
    return () => subscription.unsubscribe();
  }, []);

  const handleMetricUpdate = (payload: any) => {
    setMetrics(current => ({...current, ...payload.new}));
  };

  const fetchMetrics = async (endpoint: string) => {
    const response = await fetch(`/api/seo/${endpoint}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Metrics fetch failed: ${response.statusText}`);
    }
    
    return response.json();
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      const endpoints = ['health', 'mobile', 'speed', 'crawl'];
      const results = await Promise.all(
        endpoints.map(endpoint => fetchMetrics(endpoint))
      );
      
      const allIssues = results.flat().filter(Boolean);
      setIssues(allIssues);
      
    } catch (error) {
      console.error('Scan failed:', error);
      setIssues([{
        type: 'warning',
        category: 'health',
        issue: 'Scan temporarily unavailable',
        impact: 'Diagnostics',
        recommendation: 'Please retry scan in a few moments'
      }]);
    } finally {
      setScanning(false);
    }
  };

  // Rest of your existing renderTabContent and UI code remains the same
  
  return (
    <div className="space-y-6">
      {/* Existing JSX structure */}
    </div>
  );
}