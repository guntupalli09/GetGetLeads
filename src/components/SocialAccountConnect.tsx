import { useState } from 'react';
import { Twitter, Facebook, Instagram, Linkedin, Link2, AlertCircle } from 'lucide-react';
import { connectSocialAccount } from '../lib/socialAuth';

interface Props {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function SocialAccountConnect({ onSuccess, onError }: Props) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  const handleConnect = async (platform: string) => {
    try {
      setConnecting(true);
      setConnectingPlatform(platform);
      setError(null);

      await connectSocialAccount(platform as 'twitter' | 'facebook' | 'instagram' | 'linkedin');
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect account';
      console.error('Error connecting account:', err);
      setError(errorMessage);
      onError?.(new Error(errorMessage));
    } finally {
      setConnecting(false);
      setConnectingPlatform(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Link2 className="w-5 h-5 text-accent-500" />
        <h3 className="text-lg font-medium text-white">Connect Social Accounts</h3>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-4 mb-4 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Connection Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => handleConnect('twitter')}
          disabled={connecting}
          className={`flex items-center gap-3 p-4 rounded-lg transition-colors ${
            connecting && connectingPlatform === 'twitter'
              ? 'bg-primary-600/30 cursor-not-allowed' 
              : 'bg-primary-600/50 hover:bg-primary-600'
          }`}
        >
          <Twitter className="w-5 h-5 text-[#1DA1F2]" />
          <span className="text-white">
            {connecting && connectingPlatform === 'twitter' ? 'Connecting...' : 'Connect Twitter'}
          </span>
        </button>

        <button
          onClick={() => handleConnect('facebook')}
          disabled={connecting}
          className={`flex items-center gap-3 p-4 rounded-lg transition-colors ${
            connecting && connectingPlatform === 'facebook'
              ? 'bg-primary-600/30 cursor-not-allowed' 
              : 'bg-primary-600/50 hover:bg-primary-600'
          }`}
        >
          <Facebook className="w-5 h-5 text-[#4267B2]" />
          <span className="text-white">
            {connecting && connectingPlatform === 'facebook' ? 'Connecting...' : 'Connect Facebook'}
          </span>
        </button>

        <button
          onClick={() => handleConnect('instagram')}
          disabled={connecting}
          className={`flex items-center gap-3 p-4 rounded-lg transition-colors ${
            connecting && connectingPlatform === 'instagram'
              ? 'bg-primary-600/30 cursor-not-allowed' 
              : 'bg-primary-600/50 hover:bg-primary-600'
          }`}
        >
          <Instagram className="w-5 h-5 text-[#E1306C]" />
          <span className="text-white">
            {connecting && connectingPlatform === 'instagram' ? 'Connecting...' : 'Connect Instagram'}
          </span>
        </button>

        <button
          onClick={() => handleConnect('linkedin')}
          disabled={connecting}
          className={`flex items-center gap-3 p-4 rounded-lg transition-colors ${
            connecting && connectingPlatform === 'linkedin'
              ? 'bg-primary-600/30 cursor-not-allowed' 
              : 'bg-primary-600/50 hover:bg-primary-600'
          }`}
        >
          <Linkedin className="w-5 h-5 text-[#0077B5]" />
          <span className="text-white">
            {connecting && connectingPlatform === 'linkedin' ? 'Connecting...' : 'Connect LinkedIn'}
          </span>
        </button>
      </div>

      <div className="flex items-start gap-2 mt-4 text-sm text-primary-300">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>
          Connecting your social media accounts allows us to post content on your behalf.
          You can revoke access at any time from your account settings.
        </p>
      </div>
    </div>
  );
}