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
    { label: 'Total Jobs', value: jobs.length.toString(), icon: ClipboardList, color: 'bg-blue-500', change: '+18%' },
    { label: 'Jobs Completed', value: completedJobs.toString(), icon: CheckCircle, color: 'bg-green-500', change: '+12%' },
    { label: 'Jobs Cancelled', value: cancelledJobs.toString(), icon: XCircle, color: 'bg-red-500', change: '-5%' },
    { label: 'Pending Jobs', value: pendingJobs.toString(), icon: Clock, color: 'bg-yellow-500', change: '+2%' },
  ];

  const revenueStats = [
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-500' },
    { label: 'Active Employees', value: activeEmployees.toString(), icon: Users, color: 'bg-purple-500' },
    { label: 'Growth Rate', value: '+23%', icon: TrendingUp, color: 'bg-indigo-500' },
    { label: 'This Month', value: `${jobs.length} Jobs`, icon: Calendar, color: 'bg-pink-500' },
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
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Business Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your business operations and performance</p>
      </div>

      {/* Job Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className={`text-sm mt-1 ${
                    stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Jobs</h2>
          <div className="space-y-4">
            {recentJobs.map((job, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{job.id}</p>
                  <p className="text-sm text-gray-600">{job.customer}</p>
                  <p className="text-sm text-gray-500">Assigned to: {job.employee}</p>
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
              <p className="text-gray-600">Performance chart would be displayed here</p>
              <p className="text-sm text-gray-500 mt-2">Integration with charting library needed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}