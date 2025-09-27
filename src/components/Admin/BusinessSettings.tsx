import React, { useState, useEffect } from 'react';
import { Settings, Building2, Users, FileText, CreditCard, Save, Upload, Eye, Trash2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { BusinessSettings, QuotationTemplate, InvoiceTemplate } from '../../types';

export function BusinessSettingsManager() {
  const { businesses } = useData();
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateType, setTemplateType] = useState<'quotation' | 'invoice'>('quotation');
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    htmlContent: ''
  });

  useEffect(() => {
    if (selectedBusinessId) {
      loadBusinessSettings(selectedBusinessId);
    }
  }, [selectedBusinessId]);

  const loadBusinessSettings = (businessId: string) => {
    try {
      const stored = localStorage.getItem(`business_settings_${businessId}`);
      if (stored) {
        setBusinessSettings(JSON.parse(stored));
      } else {
        // Create default settings
        const defaultSettings: BusinessSettings = {
          id: `settings-${Date.now()}`,
          businessId,
          bookingMode: 'manual',
          quotationTemplates: [],
          invoiceTemplates: [],
          paymentGatewayEnabled: false,
          depositPercentage: 30
        };
        setBusinessSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading business settings:', error);
    }
  };

  const saveBusinessSettings = () => {
    if (businessSettings) {
      try {
        localStorage.setItem(`business_settings_${businessSettings.businessId}`, JSON.stringify(businessSettings));
        showSuccessMessage('Business settings saved successfully!');
      } catch (error) {
        console.error('Error saving business settings:', error);
      }
    }
  };

  const handleAddTemplate = () => {
    if (!businessSettings || !newTemplate.name || !newTemplate.htmlContent) {
      alert('Please fill in all template fields');
      return;
    }

    const template = {
      id: `template-${Date.now()}`,
      name: newTemplate.name,
      htmlContent: newTemplate.htmlContent,
      isDefault: false
    };

    if (templateType === 'quotation') {
      setBusinessSettings({
        ...businessSettings,
        quotationTemplates: [...businessSettings.quotationTemplates, template]
      });
    } else {
      setBusinessSettings({
        ...businessSettings,
        invoiceTemplates: [...businessSettings.invoiceTemplates, template]
      });
    }

    setNewTemplate({ name: '', htmlContent: '' });
    setShowTemplateModal(false);
  };

  const showSuccessMessage = (message: string) => {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
      if (document.body.contains(successDiv)) {
        document.body.removeChild(successDiv);
      }
    }, 3000);
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Settings</h1>
          <p className="text-gray-600 mt-2">Configure booking modes and templates</p>
        </div>
      </div>

      {/* Business Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Business
        </label>
        <select
          value={selectedBusinessId}
          onChange={(e) => setSelectedBusinessId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a business</option>
          {businesses.map(business => (
            <option key={business.id} value={business.id}>
              {business.name}
            </option>
          ))}
        </select>
      </div>

      {businessSettings && (
        <div className="space-y-6">
          {/* Booking Mode */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Booking Mode</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setBusinessSettings({
                  ...businessSettings,
                  bookingMode: 'automated'
                })}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  businessSettings.bookingMode === 'automated'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Settings className="w-6 h-6 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Automated Booking</h4>
                    <p className="text-sm text-gray-600">System automatically assigns jobs to available employees</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setBusinessSettings({
                  ...businessSettings,
                  bookingMode: 'manual'
                })}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  businessSettings.bookingMode === 'manual'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-green-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Manual Booking</h4>
                    <p className="text-sm text-gray-600">Business owner manually assigns jobs to employees</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit Percentage
                </label>
                <input
                  type="number"
                  min="10"
                  max="50"
                  value={businessSettings.depositPercentage}
                  onChange={(e) => setBusinessSettings({
                    ...businessSettings,
                    depositPercentage: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={businessSettings.paymentGatewayEnabled}
                    onChange={(e) => setBusinessSettings({
                      ...businessSettings,
                      paymentGatewayEnabled: e.target.checked
                    })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Enable Payment Gateway</span>
                </label>
              </div>
            </div>
          </div>

          {/* Templates */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Email Templates</h3>
              <button
                onClick={() => setShowTemplateModal(true)}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Add Template
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Quotation Templates</h4>
                <div className="space-y-2">
                  {businessSettings.quotationTemplates.map(template => (
                    <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-900">{template.name}</span>
                        {template.isDefault && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Invoice Templates</h4>
                <div className="space-y-2">
                  {businessSettings.invoiceTemplates.map(template => (
                    <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-gray-900">{template.name}</span>
                        {template.isDefault && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveBusinessSettings}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Add {templateType === 'quotation' ? 'Quotation' : 'Invoice'} Template
              </h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex space-x-4">
                <button
                  onClick={() => setTemplateType('quotation')}
                  className={`px-4 py-2 rounded-lg ${
                    templateType === 'quotation' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Quotation Template
                </button>
                <button
                  onClick={() => setTemplateType('invoice')}
                  className={`px-4 py-2 rounded-lg ${
                    templateType === 'invoice' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Invoice Template
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter template name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HTML Content *
                </label>
                <textarea
                  rows={10}
                  value={newTemplate.htmlContent}
                  onChange={(e) => setNewTemplate({...newTemplate, htmlContent: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Enter HTML template content..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}