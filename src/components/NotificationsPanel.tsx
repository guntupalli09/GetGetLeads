import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Bell, Check, Trash2, X } from 'lucide-react';

export function NotificationsPanel() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  if (loading) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-primary-300 hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-accent-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-primary-700 rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b border-primary-600">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-sm text-primary-300 hover:text-white transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-primary-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-primary-300">
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-primary-600 ${
                    !notification.read ? 'bg-primary-600/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-white font-medium">{notification.title}</p>
                      <p className="text-sm text-primary-300 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-primary-400 mt-2">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-primary-300 hover:text-white transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 text-primary-300 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}