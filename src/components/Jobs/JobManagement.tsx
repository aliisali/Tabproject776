import React, { useState } from 'react';
import { Plus, Search, Filter, Calendar, MapPin, User, DollarSign, Camera, FileText, CheckCircle, Clock, XCircle, X, Trash2, ClipboardList, CreditCard as Edit, Play, Eye, Settings } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { CreateJobModal } from './CreateJobModal';
import { JobWorkflow } from './JobWorkflow';
import { JobDetailsModal } from './JobDetailsModal';

export function JobManagement() {
  const { jobs, addJob, deleteJob, updateJob } = useData();
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  // Filter jobs based on user role and permissions
  const getVisibleJobs = () => {
    if (currentUser?.role === 'admin') {
      return jobs; // Admin can see all jobs
    } else if (currentUser?.role === 'business') {
      return jobs.filter(job => job.businessId === currentUser.businessId); // Business can see jobs in their business
    } else if (currentUser?.role === 'employee') {
      return jobs.filter(job => 
        job.businessId === currentUser.businessId || 
        job.employeeId === currentUser.id
      ); // Employee can see jobs in their business or assigned to them
    }
    return [];
  };

  const visibleJobs = getVisibleJobs();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'confirmed': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'tbd': return <Clock className="w-5 h-5 text-orange-500" />;
      case 'awaiting-deposit': return <DollarSign className="w-5 h-5 text-purple-500" />;
      case 'awaiting-payment': return <DollarSign className="w-5 h-5 text-red-500" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'tbd': return 'bg-orange-100 text-orange-800';
      case 'awaiting-deposit': return 'bg-purple-100 text-purple-800';
      case 'awaiting-payment': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredJobs = visibleJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    
    // First create or find customer
    const customerId = `customer-${Date.now()}`;
    const customerData = {
      name: newJob.customerName,
      email: newJob.customerEmail,
      phone: newJob.customerPhone,
      mobile: newJob.customerMobile,
      address: newJob.customerAddress,
      postcode: newJob.customerPostcode,
      businessId: currentUser?.businessId || 'business-1'
    };
    
    // Add customer to context (you'd need to import addCustomer from useData)
    
    const jobData = {
      ...newJob,
      customerId: customerId,
      status: 'pending' as const,
      employeeId: 'employee-1', // Default assignment
      businessId: 'business-1', // Default business
      quotation: parseFloat(newJob.quotation) || 0,
      images: [],
      documents: [],
      checklist: [
        { id: '1', text: 'Initial assessment', completed: false },
        { id: '2', text: 'Prepare materials', completed: false },
        { id: '3', text: 'Complete work', completed: false },
        { id: '4', text: 'Final inspection', completed: false },
      ]
    };
    
    addJob(jobData);
    
    setShowCreateModal(false);
    setNewJob({
      title: '',
      description: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerMobile: '',
      customerAddress: '',
      customerPostcode: '',
      scheduledDate: '',
      quotation: ''
    });
  };

  const handleEditJob = (job: any) => {
    setEditingJob(job);
    setNewJob({
      title: job.title,
      description: job.description,
      customerId: job.customerId,
      scheduledDate: job.scheduledDate.slice(0, 16), // Format for datetime-local input
      quotation: job.quotation?.toString() || ''
    });
  };

  const handleUpdateJob = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingJob) {
      const updatedJobData = {
        ...newJob,
        quotation: parseFloat(newJob.quotation) || 0,
      };
      
      updateJob(editingJob.id, updatedJobData);
      
      setEditingJob(null);
      setNewJob({
        title: '',
        description: '',
        customerId: '',
        scheduledDate: '',
        quotation: ''
      });
    }
  };

  const canEditJob = (job: any) => {
    if (currentUser?.role === 'admin') return true;
    if (currentUser?.role === 'business' && job.businessId === currentUser.businessId) return true;
    if (currentUser?.role === 'employee' && (job.employeeId === currentUser.id || job.businessId === currentUser.businessId)) return true;
    return false;
  };

  const canDeleteJob = (job: any) => {
    if (currentUser?.role === 'admin') return true;
    if (currentUser?.role === 'business' && job.businessId === currentUser.businessId) return true;
    return false;
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-600 mt-2">Manage and track all jobs</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Job
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="tbd">TBD</option>
                <option value="awaiting-deposit">Awaiting Deposit</option>
                <option value="awaiting-payment">Awaiting Payment</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  {getStatusIcon(job.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <span className="text-sm text-blue-600 font-medium">
                      {job.jobType === 'measurement' ? '📏 Measurement' : '🔧 Installation'} Job
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(job.status)}`}>
                    {job.status.replace('-', ' ')}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{job.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(job.scheduledDate).toLocaleDateString()} at {job.scheduledTime || '09:00'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    {job.employeeId ? `Employee: ${job.employeeId}` : 'Unassigned'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    ${job.quotation?.toLocaleString() || 'TBD'}
                  </div>
                </div>

                {/* Customer Reference */}
                {job.customerReference && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Customer Reference:</strong> {job.customerReference}
                    </p>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{Math.round((job.checklist.filter(item => item.completed).length / job.checklist.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(job.checklist.filter(item => item.completed).length / job.checklist.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  {(job.status === 'confirmed' || job.status === 'in-progress') && (
                    <button 
                      onClick={() => {
                        setSelectedJob(job);
                        setShowWorkflow(true);
                      }}
                      className="flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      {job.status === 'confirmed' ? 'Start Job' : 'Continue'}
                    </button>
                  )}
                  <button className="flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                    <FileText className="w-4 h-4 mr-1" />
                    Details
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedJob(job);
                      setShowJobDetails(true);
                    }}
                    className="flex items-center px-3 py-1 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    History
                  </button>
                  {canEditJob(job) && (
                    <>
                      <button className="flex items-center px-3 py-1 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button className="flex items-center px-3 py-1 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors">
                        <Settings className="w-4 h-4 mr-1" />
                        Assign
                      </button>
                    </>
                  )}
                  <button className="flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                    <Camera className="w-4 h-4 mr-1" />
                    Photos ({job.images.length})
                  </button>
                  <button className="flex items-center px-3 py-1 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                    <MapPin className="w-4 h-4 mr-1" />
                    Location
                  </button>
                  {canDeleteJob(job) && (
                    <button 
                      onClick={() => deleteJob(job.id)}
                      className="flex items-center px-3 py-1 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-2">Job ID</p>
                <p className="font-mono text-lg font-semibold text-gray-900">{job.id}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No jobs found matching your criteria</p>
        </div>
      )}

      
      {/* Create Job Modal */}
      <CreateJobModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onJobCreated={() => {
          // Refresh jobs list
          window.location.reload();
        }}
      />

      {/* Job Workflow Modal */}
      {showWorkflow && selectedJob && (
        <JobWorkflow
          job={selectedJob}
          onUpdateJob={(updates) => {
            updateJob(selectedJob.id, updates);
            setSelectedJob({ ...selectedJob, ...updates });
          }}
          onClose={() => {
            setShowWorkflow(false);
            setSelectedJob(null);
          }}
        />
      )}

      {/* Job Details Modal */}
      {showJobDetails && selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => {
            setShowJobDetails(false);
            setSelectedJob(null);
          }}
        />
      )}
    </div>
  );
}