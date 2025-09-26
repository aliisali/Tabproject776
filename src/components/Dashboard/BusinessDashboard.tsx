import React from 'react';
import { useData } from '../../contexts/DataContext';
import { 
  ClipboardList, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  Users, 
  TrendingUp,
  Calendar
} from 'lucide-react';

export function BusinessDashboard() {
  const { jobs, users, customers } = useData();
  
  // Calculate real stats from data
  const completedJobs = jobs.filter(job => job.status === 'completed').length;
  const pendingJobs = jobs.filter(job => job.status === 'pending').length;
  const inProgressJobs = jobs.filter(job => job.status === 'in-progress').length;
  const cancelledJobs = jobs.filter(job => job.status === 'cancelled').length;
  const totalRevenue = jobs.filter(job => job.status === 'completed').reduce((sum, job) => sum + (job.invoice || job.quotation || 0), 0);
  const activeEmployees = users.filter(user => user.role === 'employee' && user.isActive).length;
  
  const stats = [
    { label: 'Blinds Installations', value: jobs.length.toString(), icon: ClipboardList, color: 'bg-gradient-to-r from-blue-500 to-blue-600', change: '+18%' },
    { label: 'Completed Jobs', value: completedJobs.toString(), icon: CheckCircle, color: 'bg-gradient-to-r from-emerald-500 to-emerald-600', change: '+12%' },
    { label: 'Cancelled Jobs', value: cancelledJobs.toString(), icon: XCircle, color: 'bg-gradient-to-r from-red-500 to-red-600', change: '-5%' },
    { label: 'Pending Installs', value: pendingJobs.toString(), icon: Clock, color: 'bg-gradient-to-r from-amber-500 to-amber-600', change: '+2%' },
  ];

  const revenueStats = [
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-gradient-to-r from-emerald-500 to-emerald-600' },
    { label: 'Installation Team', value: activeEmployees.toString(), icon: Users, color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
    { label: 'Growth Rate', value: '+23%', icon: TrendingUp, color: 'bg-gradient-to-r from-indigo-500 to-indigo-600' },
    { label: 'This Month', value: `${jobs.length} Installs`, icon: Calendar, color: 'bg-gradient-to-r from-pink-500 to-pink-600' },
  ];

  // Get recent jobs from actual data
  const recentJobs = jobs.slice(0, 4).map(job => ({
    id: job.id,
    customer: customers.find(c => c.id === job.customerId)?.name || 'Unknown Customer',
    employee: users.find(u => u.id === job.employeeId)?.name || 'Unassigned',
    status: job.status,
    value: `$${(job.quotation || 0).toLocaleString()}`
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Business Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your blinds business operations and performance</p>
      </div>

      {/* Job Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className={`text-sm mt-1 ${
                    stat.change.startsWith('+') ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'
                  }`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {revenueStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Installations</h2>
          <div className="space-y-4">
            {recentJobs.map((job, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{job.id}</p>
                  <p className="text-sm text-gray-600">{job.customer}</p>
                  <p className="text-sm text-gray-500">Installer: {job.employee}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{job.value}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(job.status)}`}>
                    {job.status.replace('-', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Performance</h2>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Blinds installation performance chart</p>
              <p className="text-sm text-gray-500 mt-2">Revenue and installation trends</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}