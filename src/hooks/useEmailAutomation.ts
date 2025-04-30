import { useState } from 'react';
import { useEmailCampaigns } from './useEmailCampaigns';

export function useEmailAutomation() {
  const { createCampaign } = useEmailCampaigns();
  const [isScheduling, setIsScheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scheduleAutomatedCampaigns = async (
    templateId: string,
    frequency: 'daily' | 'weekly' | 'monthly' = 'weekly',
    timeOfDay: string = '10:00',
    count: number = 4
  ) => {
    try {
      setIsScheduling(true);
      setError(null);

      const now = new Date();
      const campaigns = [];

      for (let i = 0; i < count; i++) {
        const scheduledDate = new Date(now);
        
        switch (frequency) {
          case 'daily':
            scheduledDate.setDate(scheduledDate.getDate() + i);
            break;
          case 'weekly':
            scheduledDate.setDate(scheduledDate.getDate() + (i * 7));
            break;
          case 'monthly':
            scheduledDate.setMonth(scheduledDate.getMonth() + i);
            break;
        }

        // Set the time of day
        const [hours, minutes] = timeOfDay.split(':');
        scheduledDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

        campaigns.push({
          name: `Automated Campaign ${i + 1}`,
          scheduledFor: scheduledDate
        });
      }

      // Create all scheduled campaigns
      await Promise.all(campaigns.map(campaign => 
        createCampaign(
          campaign.name,
          templateId,
          campaign.scheduledFor
        )
      ));

    } catch (err) {
      setError('Failed to schedule automated campaigns');
      console.error('Automation error:', err);
      throw err;
    } finally {
      setIsScheduling(false);
    }
  };

  return {
    scheduleAutomatedCampaigns,
    isScheduling,
    error
  };
}