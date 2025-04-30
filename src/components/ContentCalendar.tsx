import { useState } from 'react';
import { useContentCalendar } from '../hooks/useContentCalendar';
import {
  Plus,
  FileText,
  Mail,
  Share2,
  Clock,
  Edit2,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
export function ContentCalendar() {
  const { events, loading, error, addEvent, updateEvent } = useContentCalendar();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'social' | 'email' | 'blog'>('social');
  const [platform, setPlatform] = useState('twitter');
  const [time, setTime] = useState('09:00');

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add padding days from previous month
    for (let i = 0; i < firstDay.getDay(); i++) {
      const prevDate = new Date(year, month, -i);
      days.unshift({ date: prevDate, isPadding: true });
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isPadding: false });
    }

    // Add padding days from next month
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isPadding: true });
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.scheduledFor);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    const scheduledFor = new Date(selectedDate);
    const [hours, minutes] = time.split(':');
    scheduledFor.setHours(parseInt(hours), parseInt(minutes));

    try {
      await addEvent({
        title,
        content,
        type,
        status: 'scheduled',
        scheduledFor: scheduledFor.toISOString(),
        platform: type === 'social' ? platform : undefined,
        metadata: {}
      });

      setShowAddEvent(false);
      setTitle('');
      setContent('');
      setType('social');
      setPlatform('twitter');
      setTime('09:00');
      setSelectedDate(null);
    } catch (err) {
      console.error('Error adding event:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Content Calendar</h2>
        <button
          onClick={() => {
            setSelectedDate(new Date());
            setShowAddEvent(true);
          }}
          className="btn-primary py-2 px-4 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Calendar Header */}
      <div className="bg-primary-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-primary-600/50 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-primary-300" />
            </button>
            <h3 className="text-lg font-medium text-white">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-primary-600/50 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-primary-300" />
            </button>
          </div>
          <div className="flex items-center gap-4 text-sm text-primary-300">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500/50" />
              <span>Social</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
              <span>Email</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500/50" />
              <span>Blog</span>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-primary-600/50 rounded-lg overflow-hidden">
          {/* Weekday Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center text-primary-300 text-sm font-medium">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {getDaysInMonth(currentDate).map(({ date, isPadding }, index) => {
            const dayEvents = getEventsForDate(date);
            const isToday = new Date().toDateString() === date.toDateString();
            const isSelected = selectedDate?.toDateString() === date.toDateString();

            return (
              <div
                key={index}
                className={`min-h-[100px] p-2 ${
                  isPadding
                    ? 'bg-primary-800/50 text-primary-500'
                    : 'bg-primary-700/50 text-white hover:bg-primary-600/50'
                } ${isToday ? 'ring-2 ring-accent-500' : ''} ${
                  isSelected ? 'ring-2 ring-accent-500' : ''
                } transition-colors cursor-pointer`}
                onClick={() => {
                  setSelectedDate(date);
                  setShowAddEvent(true);
                }}
              >
                <div className="text-sm mb-2">{date.getDate()}</div>
                <div className="space-y-1">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded ${
                        event.type === 'social'
                          ? 'bg-blue-500/20 text-blue-300'
                          : event.type === 'email'
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-purple-500/20 text-purple-300'
                      } truncate cursor-pointer`}
                      onClick={(e) => {
                        e.stopPropagation();

                        // Handle event selection here if needed
                      }}
                    >
                      {event.title || event.content}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Event Form */}
      {showAddEvent && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-primary-700 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">
                Add Event for {selectedDate.toLocaleDateString()}
              </h3>
              <button
                onClick={() => {
                  setShowAddEvent(false);
                  setSelectedDate(null);
                }}
                className="p-2 hover:bg-primary-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-primary-300" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-200 mb-1">
                  Event Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'social' | 'email' | 'blog')}
                  className="w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
                >
                  <option value="social">Social Media Post</option>
                  <option value="email">Email Campaign</option>
                  <option value="blog">Blog Post</option>
                </select>
              </div>

              {type === 'social' && (
                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-1">
                    Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
                  >
                    <option value="twitter">Twitter</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-primary-200 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-200 mb-1">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-200 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddEvent(false);
                    setSelectedDate(null);
                  }}
                  className="px-4 py-2 text-primary-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2 px-6">
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}