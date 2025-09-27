import React, { useState, useEffect } from 'react';
import { Mail, Eye, Trash2, Send, Clock, CheckCircle, X, Search, Filter, Plus, Settings, Globe } from 'lucide-react';
import { EmailService } from '../../services/EmailService';

interface DemoEmail {
  id: string;
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  from: string;
  sentAt: string;
  status: 'sent' | 'failed';
}

export function EmailManager() {
  const [emails, setEmails] = useState<DemoEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<DemoEmail | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newEmail, setNewEmail] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    message: '',
    isHTML: false
  });
  const [smtpSettings, setSMTPSettings] = useState({
    host: 'mail.jobmanager.com',
    port: 587,
    secure: false,
    username: 'admin@jobmanager.com',
    password: ''
  });

  useEffect(() => {
    loadEmails();
    loadSMTPSettings();
  }, []);

  const loadEmails = () => {
    const demoEmails = EmailService.getDemoEmails();
    setEmails(demoEmails);
  };

  const loadSMTPSettings = () => {
    try {
      const stored = localStorage.getItem('smtp_settings');
      if (stored) {
        setSMTPSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load SMTP settings:', error);
    }
  };

  const saveSMTPSettings = () => {
    try {
      localStorage.setItem('smtp_settings', JSON.stringify(smtpSettings));
      setShowSettingsModal(false);
      showSuccessMessage('SMTP settings saved successfully!');
    } catch (error) {
      console.error('Failed to save SMTP settings:', error);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const success = await EmailService.sendCustomEmail({
        to: newEmail.to,
        subject: newEmail.subject,
        message: newEmail.message,
        isHTML: newEmail.isHTML,
        cc: newEmail.cc ? newEmail.cc.split(',').map(email => email.trim()) : undefined,
        bcc: newEmail.bcc ? newEmail.bcc.split(',').map(email => email.trim()) : undefined
      });
      
      if (success) {
        setNewEmail({
          to: '',
          cc: '',
          bcc: '',
          subject: '',
          message: '',
          isHTML: false
        });
        setShowComposeModal(false);
        loadEmails(); // Refresh email list
      }
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  const deleteEmail = (emailId: string) => {
    if (window.confirm('Are you sure you want to delete this email record?')) {
      try {
        const updatedEmails = emails.filter(email => email.id !== emailId);
        localStorage.setItem('demo_emails', JSON.stringify(updatedEmails));
        setEmails(updatedEmails);
        
        if (selectedEmail?.id === emailId) {
          setSelectedEmail(null);
          setShowPreviewModal(false);
        }
        
        showSuccessMessage('Email record deleted successfully!');
      } catch (error) {
        console.error('Failed to delete email:', error);
      }
    }
  };

  const clearAllEmails = () => {
    if (window.confirm('Are you sure you want to clear all email records?')) {
      localStorage.removeItem('demo_emails');
      setEmails([]);
      setSelectedEmail(null);
      setShowPreviewModal(false);
      showSuccessMessage('All email records cleared!');
    }
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || email.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Email Manager</h1>
          <p className="text-gray-600 mt-2">View sent emails and manage email templates</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {emails.length} emails sent
          </span>
          <button
            onClick={() => setShowComposeModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Compose Email
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-5 h-5 mr-2" />
            SMTP Settings
          </button>
          <button
            onClick={clearAllEmails}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Clear All
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search emails..."
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
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Email List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Recipient</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Subject</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Sent</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmails.map((email) => (
                <tr key={email.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{email.to}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{email.subject}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      email.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {email.status === 'sent' ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Sent
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3 mr-1" />
                          Failed
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(email.sentAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedEmail(email);
                          setShowPreviewModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Preview Email"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteEmail(email.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Email"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredEmails.length === 0 && (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No emails found</p>
          <p className="text-sm text-gray-500 mt-2">
            {emails.length === 0 
              ? 'Emails will appear here when users are created'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
        </div>
      )}

      {/* Email Preview Modal */}
      {showPreviewModal && selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Email Preview</h3>
                <p className="text-sm text-gray-600 mt-1">To: {selectedEmail.to}</p>
              </div>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setSelectedEmail(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Subject:</h4>
                <p className="text-gray-700">{selectedEmail.subject}</p>
              </div>
              
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                  <p className="text-sm text-gray-600">HTML Preview</p>
                </div>
                <div className="p-4 bg-white">
                  <div dangerouslySetInnerHTML={{ __html: selectedEmail.htmlBody }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compose Email Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Compose Email</h3>
              <button
                onClick={() => setShowComposeModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">From: admin@jobmanager.com</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">JobManager Pro</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail.to}
                  onChange={(e) => setNewEmail({...newEmail, to: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="recipient@example.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CC
                  </label>
                  <input
                    type="text"
                    value={newEmail.cc}
                    onChange={(e) => setNewEmail({...newEmail, cc: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email1@example.com, email2@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BCC
                  </label>
                  <input
                    type="text"
                    value={newEmail.bcc}
                    onChange={(e) => setNewEmail({...newEmail, bcc: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="bcc@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={newEmail.subject}
                  onChange={(e) => setNewEmail({...newEmail, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Email subject"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Message *
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newEmail.isHTML}
                      onChange={(e) => setNewEmail({...newEmail, isHTML: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">HTML Format</span>
                  </label>
                </div>
                <textarea
                  required
                  rows={8}
                  value={newEmail.message}
                  onChange={(e) => setNewEmail({...newEmail, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={newEmail.isHTML ? "Enter HTML content..." : "Type your message here..."}
                />
                {newEmail.isHTML && (
                  <p className="text-xs text-gray-500 mt-1">
                    You can use HTML tags for formatting (e.g., &lt;b&gt;bold&lt;/b&gt;, &lt;br&gt; for line breaks)
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SMTP Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">SMTP Email Settings</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Current Configuration</h4>
                <p className="text-blue-800 text-sm">
                  Emails will be sent from: <strong>admin@blindscloud.co.uk</strong>
                </p>
                <p className="text-blue-700 text-xs mt-1">
                  Configure your domain's SMTP settings below
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Host *
                </label>
                <input
                  type="text"
                  required
                  value={smtpSettings.host}
                  onChange={(e) => setSMTPSettings({...smtpSettings, host: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="mail.jobmanager.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Port *
                  </label>
                  <input
                    type="number"
                    required
                    value={smtpSettings.port}
                    onChange={(e) => setSMTPSettings({...smtpSettings, port: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="587"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 mt-8">
                    <input
                      type="checkbox"
                      checked={smtpSettings.secure}
                      onChange={(e) => setSMTPSettings({...smtpSettings, secure: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Use SSL/TLS</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Username *
                </label>
                <input
                  type="email"
                  required
                  value={smtpSettings.username}
                  onChange={(e) => setSMTPSettings({...smtpSettings, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@jobmanager.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Password *
                </label>
                <input
                  type="password"
                  required
                  value={smtpSettings.password}
                  onChange={(e) => setSMTPSettings({...smtpSettings, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your email password"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use an app-specific password for better security
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">⚠️ Security Note</h4>
                <p className="text-yellow-800 text-sm">
                  In production, SMTP credentials should be stored securely on the server, not in the browser.
                  This is for demonstration purposes only.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveSMTPSettings}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email System Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-blue-800">
            <h3 className="font-semibold mb-2">📧 Domain Migration Notice</h3>
            <ul className="space-y-1 text-sm">
              <li>• <strong>Custom Domain:</strong> If you added a custom domain in Render, data may reset</li>
              <li>• <strong>Data Migration:</strong> System automatically migrates data between domains</li>
              <li>• <strong>Backup:</strong> Always backup important data before domain changes</li>
              <li>• <strong>Refresh:</strong> Reload the page if users don't appear after domain change</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}