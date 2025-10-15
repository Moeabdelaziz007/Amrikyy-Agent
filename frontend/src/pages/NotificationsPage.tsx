import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  CheckCircle2,
  X,
  Trash2,
  Filter,
  Star,
  TrendingUp,
  DollarSign,
  MapPin,
  Calendar,
  MessageSquare,
  AlertCircle,
  Info,
  Sparkles
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'deal' | 'trip' | 'update' | 'reminder' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon: React.ReactNode;
  color: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const NotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'deal' | 'trip'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'deal',
      title: 'Amazing Deal: 50% Off Tokyo Trip!',
      message: 'Limited time offer on flights and hotels to Tokyo. Save up to $500 on your dream vacation!',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      icon: <Star className="w-5 h-5" />,
      color: 'amber'
    },
    {
      id: '2',
      type: 'trip',
      title: 'Paris Trip Starting Soon',
      message: 'Your trip to Paris starts in 3 days! Check your itinerary and make final preparations.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
      icon: <MapPin className="w-5 h-5" />,
      color: 'blue'
    },
    {
      id: '3',
      type: 'update',
      title: 'Itinerary Updated',
      message: 'Thrifty found a better hotel deal for your Tokyo trip. Check updated itinerary.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      read: true,
      icon: <Sparkles className="w-5 h-5" />,
      color: 'purple'
    },
    {
      id: '4',
      type: 'reminder',
      title: 'Book Your Flight',
      message: "Don't forget to book your flight for the Dubai trip. Prices might go up soon!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true,
      icon: <Calendar className="w-5 h-5" />,
      color: 'green'
    },
    {
      id: '5',
      type: 'system',
      title: 'New Feature: AI Chat Assistant',
      message: 'Try our new AI-powered chat assistant for instant travel advice and recommendations!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
      read: true,
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'blue'
    },
    {
      id: '6',
      type: 'deal',
      title: 'Flash Sale: Bali Hotels 40% Off',
      message: 'Book luxury hotels in Bali at unbeatable prices. Sale ends in 24 hours!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
      read: true,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'amber'
    }
  ]);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: { bg: string; text: string; border: string } } = {
      blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
      amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
      green: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
      purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
      red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' }
    };
    return colors[color] || colors.blue;
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const filters = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'deal', label: 'Deals', count: notifications.filter(n => n.type === 'deal').length },
    { id: 'trip', label: 'Trips', count: notifications.filter(n => n.type === 'trip').length }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Bell className="w-10 h-10 text-blue-400" />
                Notifications
                {unreadCount > 0 && (
                  <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-gray-400">Stay updated with your travel plans and deals</p>
            </div>

            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <motion.button
                  onClick={markAllAsRead}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Mark all read</span>
                </motion.button>
              )}

              {notifications.length > 0 && (
                <motion.button
                  onClick={clearAll}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-all border border-red-500/30"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Clear all</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-2xl p-2 mb-6"
        >
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <motion.button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                  filter === f.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Filter className="w-5 h-5" />
                <span className="font-medium">{f.label}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  filter === f.id ? 'bg-white/20' : 'bg-white/10'
                }`}>
                  {f.count}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Notifications List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-effect rounded-2xl p-12 text-center"
              >
                <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No notifications</h3>
                <p className="text-gray-400">
                  {filter === 'all' 
                    ? "You're all caught up!"
                    : `No ${filter} notifications`}
                </p>
              </motion.div>
            ) : (
              filteredNotifications.map((notification, index) => {
                const colorClasses = getColorClasses(notification.color);
                
                return (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`glass-effect rounded-2xl p-6 ${
                      !notification.read ? 'border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`flex-shrink-0 w-12 h-12 rounded-xl ${colorClasses.bg} ${colorClasses.text} flex items-center justify-center border ${colorClasses.border}`}
                      >
                        {notification.icon}
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className={`font-bold ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-sm text-gray-500">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {!notification.read && (
                              <motion.button
                                onClick={() => markAsRead(notification.id)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-1 hover:bg-blue-500/20 rounded-lg transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-5 h-5 text-blue-400" />
                              </motion.button>
                            )}
                            <motion.button
                              onClick={() => deleteNotification(notification.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <X className="w-5 h-5 text-red-400" />
                            </motion.button>
                          </div>
                        </div>

                        <p className={`text-sm mb-3 ${!notification.read ? 'text-gray-300' : 'text-gray-400'}`}>
                          {notification.message}
                        </p>

                        {/* Action Button */}
                        {notification.action && (
                          <motion.button
                            onClick={notification.action.onClick}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`px-4 py-2 ${colorClasses.bg} ${colorClasses.text} rounded-xl font-medium transition-all border ${colorClasses.border}`}
                          >
                            {notification.action.label}
                          </motion.button>
                        )}

                        {/* Type Badge */}
                        <div className="flex items-center gap-2 mt-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${colorClasses.bg} ${colorClasses.text} border ${colorClasses.border}`}>
                            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                          </span>
                          {!notification.read && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Load More (Future Feature) */}
        {filteredNotifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <button className="text-gray-400 hover:text-white transition-colors">
              Load more notifications
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

