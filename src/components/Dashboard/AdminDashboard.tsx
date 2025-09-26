import React from 'react';
import { Users, Building2, TrendingUp, Activity, UserCheck, AlertCircle } from 'lucide-react';

export function AdminDashboard() {
  const stats = [
    { label: 'Total Users', value: '1,247', icon: Users, color: 'bg-gradient-to-r from-blue-500 to-blue-600', change: '+12%' },
    { label: 'Active Businesses', value: '89', icon: Building2, color: 'bg-gradient-to-r from-emerald-500 to-emerald-600', change: '+8%' },
    { label: 'Platform Revenue', value: '$45,230', icon: TrendingUp, color: 'bg-gradient-to-r from-purple-500 to-purple-600', change: '+23%' },
    { label: 'System Health', value: '99.9%', icon: Activity, color: 'bg-gradient-to-r from-indigo-500 to-indigo-600', change: '+0.1%' },
  ];

  const recentActivity = [
    { action: 'New blinds business registered', user: 'Premium Blinds Co.', time: '2 hours ago', type: 'success' },
    { action: 'AR demonstration completed', user: 'blinds@specialist.com', time: '4 hours ago', type: 'success' },
    { action: '3D model converted', user: 'Smart Blinds Ltd.', time: '6 hours ago', type: 'info' },
    { action: 'Installation completed', user: 'Luxury Blinds Pro', time: '8 hours ago', type: 'success' },
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">BlindsCloud platform overview and system management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-emerald-600 mt-1 font-medium">{stat.change} from last month</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.user}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Authentication Service</span>
              </div>
              <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">3D Model Converter</span>
              </div>
              <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">AR Camera System</span>
              </div>
              <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Blinds Analytics</span>
              </div>
              <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}