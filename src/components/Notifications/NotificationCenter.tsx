import React, { useState } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, Calendar, User, Settings, Trash2, BookMarked as MarkAsRead } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

export function NotificationCenter() {
  const { notifications, markNotificationRead } = useData();
  const [filter, setFilter] = useState<'all' | 'unread' | 'reminder' | 'job' | 'system'>('all');


  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job': return <User className="w-5 h-5 text-blue-500" />;
      case 'reminder': return <Calendar className="w-5 h-5 text-yellow-500" />;
      case 'system': return <Settings className="w-5 h-5 text-gray-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'job': return 'bg-blue-50 border-blue-200';
      case 'reminder': return 'bg-yellow-50 border-yellow-200';
      case 'system': return 'bg-gray-50 border-gray-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">Stay updated with your latest activities</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {unreadCount} unread
          </span>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <CheckCircle className="w-5 h-5 mr-2" />
            Mark All Read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All', count: mockNotifications.length },
            { id: 'all', label: 'All', count: notifications.length },
            { id: 'unread', label: 'Unread', count: unreadCount },
            { id: 'job', label: 'Jobs', count: notifications.filter(n => n.type === 'job').length },
            { id: 'reminder', label: 'Reminders', count: notifications.filter(n => n.type === 'reminder').length },
            { id: 'system', label: 'System', count: notifications.filter(n => n.type === 'system').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  filter === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white rounded-xl shadow-sm border p-6 transition-all hover:shadow-md ${
              !notification.read ? getNotificationColor(notification.type) : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className={`text-lg font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{notification.message}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{new Date(notification.createdAt).toLocaleString()}</span>
                    <span className="capitalize bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                      {notification.type}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {!notification.read && (
                  <button 
                    onClick={() => markNotificationRead(notification.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No notifications found</p>
          <p className="text-sm text-gray-500 mt-2">You're all caught up!</p>
        </div>
      )}
    </div>
  );
}