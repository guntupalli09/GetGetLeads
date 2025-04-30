import { useState } from 'react';
import { useSocialMedia } from './useSocialMedia';
import { useAI } from './useAI';
import { showError, showSuccess } from '../lib/toast';

const RANDOM_TAGS = [
  'marketing', 'digital', 'business', 'socialmedia', 'entrepreneur',
  'success', 'motivation', 'startup', 'innovation', 'growth',
  'leadership', 'inspiration', 'technology', 'strategy', 'branding'
];

const UNSPLASH_TOPICS = [
  'business', 'technology', 'office', 'marketing',
  'workspace', 'startup', 'meeting', 'professional'
];

export function usePostAutomation() {
  const { createPost, accounts } = useSocialMedia();
  const { generateSocialContent } = useAI();
  const [isScheduling, setIsScheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getOptimalPostingTimes = (platform: string) => {
    const optimalTimes = {
      twitter: ['9:00', '12:00', '15:00', '17:00', '19:00'],
      facebook: ['9:00', '13:00', '15:00', '19:00'],
      instagram: ['11:00', '14:00', '19:00', '21:00'],
      linkedin: ['8:00', '10:00', '12:00', '17:00']
    };
    return optimalTimes[platform as keyof typeof optimalTimes] || ['12:00'];
  };

  const generatePostContent = async (platform: string, topics: string[]) => {
    try {
      const prompts = [
        'Share industry insights about',
        'Discuss the latest trends in',
        'Offer tips and advice about',
        'Share success stories related to',
        'Ask engaging questions about'
      ];

      const prompt = `${prompts[Math.floor(Math.random() * prompts.length)]} ${topics.join(', ')}`;
      
      const content = await generateSocialContent(prompt, platform, {
        tone: 'professional',
        length: platform === 'twitter' ? 'short' : 'medium'
      });

      if (!content) {
        throw new Error('Failed to generate content');
      }

      return content;
    } catch (err) {
      console.error('Error generating content:', err);
      throw new Error('Failed to generate post content');
    }
  };

  const scheduleAutomatedPosts = async (
    accountId: string,
    options = {
      duration: 7,
      postsPerDay: 2,
      topics: ['marketing', 'business', 'technology'],
      includeImages: true,
      includeHashtags: true
    }
  ) => {
    try {
      setIsScheduling(true);
      setError(null);

      // Validate account exists
      const account = accounts.find(a => a.id === accountId);
      if (!account) {
        throw new Error('Selected account not found');
      }

      // Validate options
      if (options.duration < 1 || options.duration > 30) {
        throw new Error('Duration must be between 1 and 30 days');
      }
      if (options.postsPerDay < 1 || options.postsPerDay > 5) {
        throw new Error('Posts per day must be between 1 and 5');
      }
      if (!options.topics.length) {
        throw new Error('At least one topic is required');
      }

      const platform = account.platform;
      const optimalTimes = getOptimalPostingTimes(platform);
      const totalPosts = options.duration * options.postsPerDay;
      const scheduledPosts = [];

      // Generate schedule dates
      for (let day = 0; day < options.duration; day++) {
        const date = new Date();
        date.setDate(date.getDate() + day);

        // Get random posting times for this day
        const dayTimes = [...optimalTimes]
          .sort(() => 0.5 - Math.random())
          .slice(0, options.postsPerDay);

        for (const time of dayTimes) {
          const [hours, minutes] = time.split(':').map(Number);
          const scheduleDate = new Date(date);
          scheduleDate.setHours(hours, minutes, 0, 0);

          try {
            // Generate AI content
            const content = await generatePostContent(platform, options.topics);

            // Add hashtags if enabled
            const hashtags = options.includeHashtags
              ? RANDOM_TAGS
                  .sort(() => 0.5 - Math.random())
                  .slice(0, 3)
                  .map(tag => `#${tag}`)
                  .join(' ')
              : '';

            // Add images if enabled
            const images = options.includeImages
              ? [
                  `https://source.unsplash.com/1200x800/?${
                    UNSPLASH_TOPICS[Math.floor(Math.random() * UNSPLASH_TOPICS.length)]
                  }&random=${Math.random()}`
                ]
              : [];

            // Create the post
            const post = await createPost(
              accountId,
              `${content}\n\n${hashtags}`,
              images,
              scheduleDate
            );

            scheduledPosts.push(post);
          } catch (err) {
            console.error('Error creating scheduled post:', err);
            // Continue with other posts even if one fails
            continue;
          }
        }
      }

      if (scheduledPosts.length === 0) {
        throw new Error('Failed to schedule any posts');
      }

      showSuccess(`Successfully scheduled ${scheduledPosts.length} posts`);
      return scheduledPosts;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to schedule automated posts';
      setError(message);
      showError(message);
      throw err;
    } finally {
      setIsScheduling(false);
    }
  };

  return {
    scheduleAutomatedPosts,
    isScheduling,
    error
  };
}