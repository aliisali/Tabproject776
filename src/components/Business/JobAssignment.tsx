import React, { useState } from 'react';
import { Users, Calendar, Clock, User, Check, X, ArrowRight } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

export function JobAssignmentCenter() {
  const { jobs, users, updateJob } = useData();
  const { user } = useAuth();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Get unassigned jobs for this business
  const unassignedJobs = jobs.filter(job => 
    job.businessId === user?.businessId && 
    (!job.employeeId || job.employeeId === '') &&
    job.status === 'pending'
  );

  // Get employees for this business
  const businessEmployees = users.filter(u => 
    u.role === 'employee' && 
    u.businessId === user?.businessId &&
    u.isActive
  );

  const handleAssignJob = async (jobId: string, employeeId: string) => {
    try {
      const employee = businessEmployees.find(e => e.id === employeeId);
      
      await updateJob(jobId, {
        employeeId,
        status: 'confirmed',
        jobHistory: [
          ...selectedJob.jobHistory,
          {
            id: `history-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'job_assigned',
            description: `Job assigned to ${employee?.name}`,
            userId: user?.id || '',
            userName: user?.name || ''
          }
        ]
      });

      // Send notification to employee
      // This would be implemented with the notification system

      setShowAssignModal(false);
      setSelectedJob(null);
      
      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successDiv.textContent = `Job assigned to ${employee?.name} successfully!`;
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv);
        }
      }, 3000);

    } catch (error) {
      console.error('Error assigning job:', error);
      alert('Failed to assign job. Please try again.');
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Job Assignment Center</h1>
        <p className="text-gray-600 mt-2">Assign incoming jobs to your team members</p>
      </div>

      {/* Unassigned Jobs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Pending Job Assignments</h2>
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            {unassignedJobs.length} jobs waiting
          </span>
        </div>

        {unassignedJobs.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No jobs waiting for assignment</p>
            <p className="text-sm text-gray-500 mt-2">All jobs are currently assigned to team members</p>
          </div>
        ) : (
          <div className="space-y-4">
            {unassignedJobs.map(job => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {job.jobType === 'measurement' ? '📏 Measurement' : '🔧 Installation'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{job.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(job.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {job.scheduledTime || '09:00'}
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Customer: {job.customerId}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setShowAssignModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Users className="w-4 h-4 mr-2 inline" />
                    Assign Employee
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Assign Job to Employee</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Job Details</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium">{selectedJob.title}</p>
                <p className="text-sm text-gray-600">{selectedJob.description}</p>
                <p className="text-sm text-gray-600 mt-2">
                  📅 {new Date(selectedJob.scheduledDate).toLocaleDateString()} at {selectedJob.scheduledTime}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Available Employees</h4>
              <div className="space-y-3">
                {businessEmployees.map(employee => (
                  <div key={employee.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{employee.name}</p>
                        <p className="text-sm text-gray-600">{employee.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Available
                          </span>
                          {employee.permissions.includes('ar_camera_access') && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                              AR Certified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAssignJob(selectedJob.id, employee.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Check className="w-4 h-4 mr-2 inline" />
                      Assign
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}