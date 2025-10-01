import React, { useState } from 'react';
import { X, Calendar, Clock, User, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: () => void;
}

export function CreateJobModal({ isOpen, onClose, onJobCreated }: CreateJobModalProps) {
  const { addJob, customers, addCustomer } = useData();
  const { user } = useAuth();
  const [jobType, setJobType] = useState<'measurement' | 'installation'>('measurement');
  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [formData, setFormData] = useState({
    // Job details
    title: '',
    description: '',
    scheduledDate: '',
    scheduledTime: '09:00',
    
    // Customer details (for new customer)
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerMobile: '',
    customerAddress: '',
    customerPostcode: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let customerId = selectedCustomerId;
      
      // Create new customer if needed
      if (isNewCustomer) {
        const customerData = {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone,
          mobile: formData.customerMobile,
          address: formData.customerAddress,
          postcode: formData.customerPostcode,
          businessId: user?.businessId || 'business-1'
        };
        
        const newCustomer = await addCustomer(customerData) as any;
        customerId = (newCustomer && newCustomer.id) ? newCustomer.id : `customer-${Date.now()}`;
      }
      
      // Generate customer reference number
      const customerReference = `REF-${Date.now().toString().slice(-6)}`;
      
      // Create job
      const jobData = {
        title: formData.title || `${jobType === 'measurement' ? 'Measurement' : 'Installation'} Appointment`,
        description: formData.description,
        jobType,
        status: 'pending' as const,
        customerId,
        employeeId: '', // Will be assigned based on booking mode
        businessId: user?.businessId || 'business-1',
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        customerReference,
        images: [],
        documents: [],
        checklist: getDefaultChecklist(jobType),
        measurements: [],
        selectedProducts: [],
        jobHistory: [{
          id: `history-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'job_created',
          description: `${jobType} job created`,
          userId: user?.id || '',
          userName: user?.name || ''
        }]
      };
      
      await addJob(jobData);
      
      // Send confirmation email to customer
      await sendConfirmationEmail(customerId, jobData);
      
      onJobCreated();
      onClose();
      resetForm();
      
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job. Please try again.');
    }
  };

  const getDefaultChecklist = (type: 'measurement' | 'installation') => {
    if (type === 'measurement') {
      return [
        { id: '1', text: 'Customer consultation', completed: false },
        { id: '2', text: 'Window measurements', completed: false },
        { id: '3', text: 'Product selection', completed: false },
        { id: '4', text: 'Quotation preparation', completed: false },
        { id: '5', text: 'Customer approval', completed: false }
      ];
    } else {
      return [
        { id: '1', text: 'Installation preparation', completed: false },
        { id: '2', text: 'Blinds installation', completed: false },
        { id: '3', text: 'Quality check', completed: false },
        { id: '4', text: 'Customer satisfaction', completed: false },
        { id: '5', text: 'Final payment', completed: false }
      ];
    }
  };

  const sendConfirmationEmail = async (customerId: string, jobData: any) => {
    // Email confirmation logic would be implemented here
    console.log('📧 Sending confirmation email for job:', jobData.id);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      scheduledDate: '',
      scheduledTime: '09:00',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerMobile: '',
      customerAddress: '',
      customerPostcode: ''
    });
    setJobType('measurement');
    setIsNewCustomer(true);
    setSelectedCustomerId('');
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Create New Job</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Appointment Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setJobType('measurement')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  jobType === 'measurement'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Measurement Job</h4>
                    <p className="text-sm text-gray-600">Site visit for measurements and quotation</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setJobType('installation')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  jobType === 'installation'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Installation Job</h4>
                    <p className="text-sm text-gray-600">Blinds installation appointment</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Customer
            </label>
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => setIsNewCustomer(true)}
                className={`px-4 py-2 rounded-lg ${
                  isNewCustomer ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                New Customer
              </button>
              <button
                type="button"
                onClick={() => setIsNewCustomer(false)}
                className={`px-4 py-2 rounded-lg ${
                  !isNewCustomer ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Existing Customer
              </button>
            </div>

            {!isNewCustomer ? (
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.email}
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter customer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="customer@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.customerMobile}
                    onChange={(e) => setFormData({...formData, customerMobile: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 987-6543"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formData.customerAddress}
                    onChange={(e) => setFormData({...formData, customerAddress: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter complete address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postcode *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerPostcode}
                    onChange={(e) => setFormData({...formData, customerPostcode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="12345"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Job Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`${jobType === 'measurement' ? 'Measurement' : 'Installation'} appointment`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of the job"
              />
            </div>
          </div>

          {/* Scheduling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appointment Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  required
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appointment Time *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  required
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  {generateTimeOptions().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Job Type Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              {jobType === 'measurement' ? 'Measurement Appointment' : 'Installation Appointment'}
            </h4>
            <p className="text-blue-800 text-sm">
              {jobType === 'measurement' 
                ? 'This appointment includes site visit, measurements, product selection, and quotation preparation.'
                : 'This appointment includes blinds installation, quality check, and final payment collection.'
              }
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create {jobType === 'measurement' ? 'Measurement' : 'Installation'} Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}