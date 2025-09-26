import React, { useState } from 'react';
import { Mail, Send, Inbox, Send as Sent, Drama as Draft, Trash2, Search, Paperclip, Star, Reply, Forward } from 'lucide-react';

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
  starred: boolean;
  folder: 'inbox' | 'sent' | 'draft' | 'trash';
  attachments?: string[];
}

export function EmailCenter() {
  const [selectedFolder, setSelectedFolder] = useState<'inbox' | 'sent' | 'draft' | 'trash'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const mockEmails: Email[] = [
    {
      id: '1',
      from: 'customer@abccorp.com',
      to: 'employee@company.com',
      subject: 'HVAC Installation Follow-up',
      body: 'Thank you for the excellent work on our HVAC installation. Everything is working perfectly.',
      timestamp: '2024-01-15T10:30:00Z',
      read: false,
      starred: true,
      folder: 'inbox'
    },
    {
      id: '2',
      from: 'employee@company.com',
      to: 'customer@xyzltd.com',
      subject: 'Electrical Maintenance Quote',
      body: 'Please find attached the quote for the electrical maintenance work requested.',
      timestamp: '2024-01-14T14:20:00Z',
      read: true,
      starred: false,
      folder: 'sent',
      attachments: ['quote.pdf']
    },
    {
      id: '3',
      from: 'supplier@parts.com',
      to: 'employee@company.com',
      subject: 'Parts Order Confirmation',
      body: 'Your order #12345 has been confirmed and will be shipped within 2 business days.',
      timestamp: '2024-01-13T09:15:00Z',
      read: true,
      starred: false,
      folder: 'inbox'
    },
  ];

  const folders = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: mockEmails.filter(e => e.folder === 'inbox' && !e.read).length },
    { id: 'sent', label: 'Sent', icon: Sent, count: mockEmails.filter(e => e.folder === 'sent').length },
    { id: 'draft', label: 'Drafts', icon: Draft, count: mockEmails.filter(e => e.folder === 'draft').length },
    { id: 'trash', label: 'Trash', icon: Trash2, count: mockEmails.filter(e => e.folder === 'trash').length },
  ];

  const filteredEmails = mockEmails.filter(email => {
    const matchesFolder = email.folder === selectedFolder;
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.body.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Center</h1>
          <p className="text-gray-600 mt-2">Manage your email communications</p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Mail className="w-5 h-5 mr-2" />
          Compose
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-2">
            {folders.map((folder) => {
              const Icon = folder.icon;
              return (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    selectedFolder === folder.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-3" />
                    {folder.label}
                  </div>
                  {folder.count > 0 && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {folder.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Email List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedEmail?.id === email.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
                } ${!email.read ? 'bg-blue-25' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${!email.read ? 'bg-blue-600' : 'bg-transparent'}`} />
                    <p className={`text-sm truncate ${!email.read ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                      {selectedFolder === 'sent' ? email.to : email.from}
                    </p>
                  </div>
                  {email.starred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                </div>
                <p className={`text-sm truncate mb-1 ${!email.read ? 'font-medium' : ''} text-gray-900`}>
                  {email.subject}
                </p>
                <p className="text-xs text-gray-500 truncate">{email.body}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    {new Date(email.timestamp).toLocaleDateString()}
                  </p>
                  {email.attachments && email.attachments.length > 0 && (
                    <Paperclip className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredEmails.length === 0 && (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No emails found</p>
            </div>
          )}
        </div>

        {/* Email Content */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {selectedEmail ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedEmail.subject}</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    From: {selectedEmail.from} • To: {selectedEmail.to}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(selectedEmail.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Reply className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Forward className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Star className={`w-4 h-4 ${selectedEmail.starred ? 'text-yellow-500 fill-current' : ''}`} />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedEmail.body}</p>
              </div>

              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Attachments</h3>
                  <div className="space-y-2">
                    {selectedEmail.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <Paperclip className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-700">{attachment}</span>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select an email to read</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Compose Email</h3>
              <button
                onClick={() => setShowCompose(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="recipient@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Email subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type your message here..."
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <button className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                  <Paperclip className="w-4 h-4 mr-2" />
                  Attach Files
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowCompose(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}