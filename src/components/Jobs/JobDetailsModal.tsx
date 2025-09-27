import React from 'react';
import { X, Clock, User, DollarSign, FileText, Camera, Package } from 'lucide-react';
import { Job } from '../../types';

interface JobDetailsModalProps {
  job: Job;
  onClose: () => void;
}

export function JobDetailsModal({ job, onClose }: JobDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Job Details & History</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Job Information */}
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Job Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Job ID:</span>
                  <span className="font-mono">{job.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="capitalize">{job.jobType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="capitalize">{job.status.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Scheduled:</span>
                  <span>{new Date(job.scheduledDate).toLocaleDateString()} at {job.scheduledTime}</span>
                </div>
                {job.customerReference && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-mono">{job.customerReference}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Products */}
            {job.selectedProducts && job.selectedProducts.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Selected Products</h4>
                <div className="space-y-2">
                  {job.selectedProducts.map(product => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Package className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">{product.productName}</p>
                          <p className="text-sm text-gray-600">Qty: {product.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(product.price * product.quantity).toFixed(2)}</p>
                        {product.customerApproved && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Approved
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Measurements */}
            {job.measurements && job.measurements.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Measurements</h4>
                <div className="space-y-2">
                  {job.measurements.map(measurement => (
                    <div key={measurement.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">Window {measurement.windowId}</p>
                          <p className="text-sm text-gray-600">
                            {measurement.width} × {measurement.height} cm
                          </p>
                          {measurement.location && (
                            <p className="text-sm text-gray-500">{measurement.location}</p>
                          )}
                        </div>
                      </div>
                      {measurement.notes && (
                        <p className="text-sm text-gray-500 mt-2 italic">{measurement.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Job History */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Job History</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {job.jobHistory.map(entry => (
                <div key={entry.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 capitalize">
                        {entry.action.replace('_', ' ')}
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{entry.description}</p>
                    <p className="text-xs text-gray-500">By: {entry.userName}</p>
                    {entry.data && (
                      <div className="mt-2 p-2 bg-white rounded border text-xs">
                        <pre className="text-gray-600">{JSON.stringify(entry.data, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}