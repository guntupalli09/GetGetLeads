import { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { Settings, Moon, Sun, Bell, X } from 'lucide-react';

export function UserSettings() {
  const { settings, loading, updateSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  if (loading) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-primary-300 hover:text-white transition-colors"
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-primary-700 rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b border-primary-600">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Settings</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-primary-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-200 mb-2">
                Theme
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => updateSettings({ theme: 'light' })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    settings?.theme === 'light'
                      ? 'bg-accent-500 text-white'
                      : 'bg-primary-600/50 text-primary-300 hover:text-white'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  Light
                </button>
                <button
                  onClick={() => updateSettings({ theme: 'dark' })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    settings?.theme === 'dark'
                      ? 'bg-accent-500 text-white'
                      : 'bg-primary-600/50 text-primary-300 hover:text-white'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  Dark
                </button>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-primary-200">
                <Bell className="w-4 h-4" />
                Email Notifications
              </label>
              <p className="text-xs text-primary-400 mt-1 mb-2">
                Receive email notifications for important updates
              </p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.email_notifications}
                  onChange={(e) => updateSettings({ email_notifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-primary-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500"></div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}