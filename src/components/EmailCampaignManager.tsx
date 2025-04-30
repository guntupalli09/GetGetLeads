import { useState } from 'react';
import { useEmailCampaigns } from '../hooks/useEmailCampaigns';
import { useEmailAutomation } from '../hooks/useEmailAutomation';
import { useAI } from '../hooks/useAI';
import { BackButton } from './BackButton';
import { AIFeatureIndicator } from './AIFeatureIndicator';
import { EmailBuilder } from './email/EmailBuilder';
import { EmailAnalytics } from './email/EmailAnalytics';
import { LeadManager } from './email/LeadManager';
import { CampaignSuggestions } from './email/CampaignSuggestions';
import { TemplateLibrary } from './email/TemplateLibrary';
import { 
  Mail, Plus, Users, FileText, Calendar, Send, Edit2, Clock, 
  Settings, Brain, Target, TrendingUp, Sparkles 
} from 'lucide-react';

export function EmailCampaignManager() {
  const { campaigns, templates, subscribers, analytics, loading, error } = useEmailCampaigns();
  const { scheduleAutomatedCampaigns } = useEmailAutomation();
  const { generateEmailContent, analyzePerformance } = useAI();
  const [activeView, setActiveView] = useState<'builder' | 'analytics' | 'leads' | 'templates' | 'suggestions'>('builder');
  const [showNewCampaign, setShowNewCampaign] = useState(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'builder':
        return (
          <EmailBuilder 
            templates={templates}
            onSave={async (campaign) => {
              // Handle campaign save
              console.log('Saving campaign:', campaign);
            }}
            onAIAssist={async (type, content) => {
              // Handle AI assistance requests
              const result = await generateEmailContent(content, {
                type,
                audience: 'target_segment',
                goal: 'conversion'
              });
              return result;
            }}
          />
        );
      case 'analytics':
        return (
          <EmailAnalytics 
            campaigns={campaigns}
            analytics={analytics}
            onAnalyze={async (campaignId) => {
              const insights = await analyzePerformance(campaignId);
              return insights;
            }}
          />
        );
      case 'leads':
        return (
          <LeadManager 
            subscribers={subscribers}
            onSegment={async (criteria) => {
              // Handle lead segmentation
              console.log('Segmenting leads:', criteria);
            }}
          />
        );
      case 'templates':
        return (
          <TemplateLibrary 
            templates={templates}
            onCreateTemplate={async (template) => {
              // Handle template creation
              console.log('Creating template:', template);
            }}
          />
        );
      case 'suggestions':
        return (
          <CampaignSuggestions 
            businessType="retail"
            onSelect={async (suggestion) => {
              // Handle suggestion selection
              console.log('Selected suggestion:', suggestion);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <h2 className="text-xl font-semibold text-white">Email Campaigns</h2>
          <AIFeatureIndicator feature="Campaign Optimization" />
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowNewCampaign(true)}
            className="btn-primary py-2 px-4 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b border-primary-700">
        <button
          onClick={() => setActiveView('builder')}
          className={`px-4 py-2 ${
            activeView === 'builder'
              ? 'text-accent-500 border-b-2 border-accent-500'
              : 'text-primary-300 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Campaign Builder
          </div>
        </button>
        <button
          onClick={() => setActiveView('analytics')}
          className={`px-4 py-2 ${
            activeView === 'analytics'
              ? 'text-accent-500 border-b-2 border-accent-500'
              : 'text-primary-300 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </div>
        </button>
        <button
          onClick={() => setActiveView('leads')}
          className={`px-4 py-2 ${
            activeView === 'leads'
              ? 'text-accent-500 border-b-2 border-accent-500'
              : 'text-primary-300 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Lead Management
          </div>
        </button>
        <button
          onClick={() => setActiveView('templates')}
          className={`px-4 py-2 ${
            activeView === 'templates'
              ? 'text-accent-500 border-b-2 border-accent-500'
              : 'text-primary-300 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Templates
          </div>
        </button>
        <button
          onClick={() => setActiveView('suggestions')}
          className={`px-4 py-2 ${
            activeView === 'suggestions'
              ? 'text-accent-500 border-b-2 border-accent-500'
              : 'text-primary-300 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Suggestions
          </div>
        </button>
      </div>

      {/* Active View Content */}
      <div className="min-h-[600px]">
        {renderActiveView()}
      </div>
    </div>
  );
}