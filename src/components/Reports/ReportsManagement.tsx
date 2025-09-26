import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar, 
  Filter,
  FileText,
  DollarSign,
  Users,
  ClipboardList,
  Eye
} from 'lucide-react';

export function ReportsManagement() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');
  
  // Add explanation for business users
  const reportExplanations = {
    overview: "Get a comprehensive view of your business performance including job statistics, revenue metrics, and key performance indicators.",
    jobs: "Detailed analysis of all jobs including completion rates, average job values, and performance trends over time.",
    revenue: "Financial insights showing revenue breakdown by categories, monthly trends, and profitability analysis.",
    employees: "Employee performance metrics including job completion rates, customer satisfaction scores, and productivity analysis.",
    customers: "Customer analytics including repeat business rates, customer satisfaction, and geographic distribution of your customer base."
  };

  const reportTypes = [
    { id: 'overview', name: 'Business Overview', icon: BarChart3 },
    { id: 'jobs', name: 'Job Reports', icon: ClipboardList },
    { id: 'revenue', name: 'Revenue Analysis', icon: DollarSign },
    { id: 'employees', name: 'Employee Performance', icon: Users },
    { id: 'customers', name: 'Customer Reports', icon: FileText }
  ];

  const mockReportData = {
    overview: {
      totalJobs: 156,
      completedJobs: 142,
      pendingJobs: 14,
      totalRevenue: 45230,
      averageJobValue: 290,
      customerSatisfaction: 4.8
    },
    jobs: [
      { id: 'JOB-001', customer: 'ABC Corp', value: 2500, status: 'completed', date: '2024-01-15' },
      { id: 'JOB-002', customer: 'XYZ Ltd', value: 1800, status: 'in-progress', date: '2024-01-16' },
      { id: 'JOB-003', customer: 'Tech Solutions', value: 3200, status: 'completed', date: '2024-01-17' }
    ],
    revenue: {
      monthly: [
        { month: 'Jan', revenue: 12500 },
        { month: 'Feb', revenue: 15200 },
        { month: 'Mar', revenue: 18900 },
        { month: 'Apr', revenue: 16800 }
      ],
      byCategory: [
        { category: 'HVAC', revenue: 25000, percentage: 40 },
        { category: 'Electrical', revenue: 18750, percentage: 30 },
        { category: 'Plumbing', revenue: 12500, percentage: 20 },
        { category: 'Other', revenue: 6250, percentage: 10 }
      ]
    }
  };

  const renderOverviewReport = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{mockReportData.overview.totalJobs}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${mockReportData.overview.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Job Value</p>
              <p className="text-2xl font-bold text-gray-900">${mockReportData.overview.averageJobValue}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Status Distribution</h3>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Chart visualization would be displayed here</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">Revenue chart would be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderJobsReport = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Jobs Report</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockReportData.jobs.map((job) => (
              <tr key={job.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.customer}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${job.value.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    job.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(job.date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRevenueReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
          <div className="space-y-4">
            {mockReportData.revenue.monthly.map((item) => (
              <div key={item.month} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{item.month}</span>
                <span className="text-sm font-semibold text-gray-900">${item.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h3>
          <div className="space-y-4">
            {mockReportData.revenue.byCategory.map((item) => (
              <div key={item.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{item.category}</span>
                  <span className="text-sm font-semibold text-gray-900">${item.revenue.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'overview': return renderOverviewReport();
      case 'jobs': return renderJobsReport();
      case 'revenue': return renderRevenueReport();
      default: 
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Report content for {selectedReport} coming soon</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive business insights and analytics</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Download className="w-5 h-5 mr-2" />
          Export Report
        </button>
      </div>

      {/* Report Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {reportTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </button>
            <button className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {/* Report Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          {reportTypes.find(type => type.id === selectedReport)?.name} Report
        </h3>
        <p className="text-blue-800">
          {reportExplanations[selectedReport as keyof typeof reportExplanations]}
        </p>
      </div>

      {renderReportContent()}
    </div>
  );
}