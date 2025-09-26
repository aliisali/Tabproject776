import React from 'react';
import { useData } from '../../contexts/DataContext';
import { 
  ClipboardList, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Camera, 
  FileText,
  Bell,
  MapPin
} from 'lucide-react';

export function EmployeeDashboard() {
  const { jobs, notifications, customers } = useData();
  
  // Filter jobs for current employee (simplified for demo)
  const todayJobs = jobs.slice(0, 3);
  const completedToday = todayJobs.filter(job => job.status === 'completed').length;
  const pendingToday = todayJobs.filter(job => job.status === 'pending').length;
  
  const todayStats = [
    { label: 'Today\'s Installs', value: todayJobs.length.toString(), icon: ClipboardList, color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
    { label: 'Completed', value: completedToday.toString(), icon: CheckCircle, color: 'bg-gradient-to-r from-emerald-500 to-emerald-600' },
    { label: 'Pending', value: pendingToday.toString(), icon: Clock, color: 'bg-gradient-to-r from-amber-500 to-amber-600' },
    { label: 'Photos Taken', value: '12', icon: Camera, color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
  ];

  // Transform jobs data for display
  const todayJobsDisplay = todayJobs.map(job => ({
    id: job.id,
    customer: customers.find(c => c.id === job.customerId)?.name || 'Unknown Customer',
    address: '123 Main St, City', // Simplified for demo
    time: new Date(job.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: job.status,
    type: job.title
  }));

  // Get recent notifications
  const recentNotifications = notifications.slice(0, 3).map(notification => ({
    message: notification.message,
    time: new Date(notification.createdAt).toLocaleString(),
    type: notification.type
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Installation Dashboard</h1>
        <p className="text-gray-600 mt-2">Your daily blinds installation tasks and schedule</p>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {todayStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Jobs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Today's Installations</h2>
            <Calendar className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-4">
            {todayJobsDisplay.map((job, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <p className="font-medium text-gray-900">{job.id}</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(job.status)}`}>
                        {job.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{job.customer}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.address}
                    </div>
                    <p className="text-sm text-blue-600 mt-1">{job.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{job.time}</p>
                    <button className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
            <Bell className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-4">
            {recentNotifications.map((notification, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  notification.type === 'job' ? 'bg-blue-500' :
                  notification.type === 'reminder' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Quick Actions */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                <Camera className="w-4 h-4 mr-2" />
                <span className="text-sm">AR Demo</span>
              </button>
              <button className="flex items-center justify-center p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                <FileText className="w-4 h-4 mr-2" />
                <span className="text-sm">Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}