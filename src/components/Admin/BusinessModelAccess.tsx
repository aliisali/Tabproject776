import React, { useState } from 'react';
import { 
  Building2, 
  Box, 
  Shield, 
  Check, 
  X, 
  Search,
  Eye,
  Settings,
  Users
} from 'lucide-react';

interface Business {
  id: string;
  name: string;
  email: string;
  modelAccess: string[];
  isActive: boolean;
}

interface ARModel {
  id: string;
  name: string;
  thumbnailUrl: string;
  fileSize: number;
  businessAccess: string[];
}

export function BusinessModelAccess() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [showAccessModal, setShowAccessModal] = useState(false);

  // Mock data
  const businesses: Business[] = [
    {
      id: 'business-1',
      name: 'ABC Construction Co.',
      email: 'contact@abcconstruction.com',
      modelAccess: ['model-1'],
      isActive: true
    },
    {
      id: 'business-2',
      name: 'XYZ Services Ltd.',
      email: 'info@xyzservices.com',
      modelAccess: ['model-1', 'model-2'],
      isActive: true
    },
    {
      id: 'business-3',
      name: 'Tech Solutions Inc.',
      email: 'hello@techsolutions.com',
      modelAccess: [],
      isActive: true
    }
  ];

  const models: ARModel[] = [
    {
      id: 'model-1',
      name: 'HVAC Unit Model',
      thumbnailUrl: 'https://images.pexels.com/photos/8293778/pexels-photo-8293778.jpeg?auto=compress&cs=tinysrgb&w=200',
      fileSize: 2.5,
      businessAccess: ['business-1', 'business-2']
    },
    {
      id: 'model-2',
      name: 'Electrical Panel 3D',
      thumbnailUrl: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=200',
      fileSize: 1.8,
      businessAccess: ['business-2']
    }
  ];

  const filteredBusinesses = businesses.filter(business =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleModelAccess = (businessId: string, modelId: string) => {
    // In a real app, this would update the database
    console.log(`Toggle access for business ${businessId} to model ${modelId}`);
    showSuccessMessage('Access permissions updated successfully!');
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Model Access</h1>
          <p className="text-gray-600 mt-2">Manage which businesses can access your 3D AR models</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search businesses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Business Access Matrix */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Access Control Matrix</h2>
          <p className="text-gray-600 mt-1">Grant or revoke access to 3D models for each business</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Business</th>
                {models.map((model) => (
                  <th key={model.id} className="px-4 py-4 text-center text-sm font-medium text-gray-900">
                    <div className="flex flex-col items-center space-y-2">
                      <img
                        src={model.thumbnailUrl}
                        alt={model.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <span className="text-xs">{model.name}</span>
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBusinesses.map((business) => (
                <tr key={business.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{business.name}</div>
                        <div className="text-sm text-gray-500">{business.email}</div>
                      </div>
                    </div>
                  </td>
                  {models.map((model) => (
                    <td key={model.id} className="px-4 py-4 text-center">
                      <button
                        onClick={() => toggleModelAccess(business.id, model.id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          business.modelAccess.includes(model.id)
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {business.modelAccess.includes(model.id) ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  ))}
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Businesses</p>
              <p className="text-2xl font-bold text-gray-900">{businesses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Box className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Available Models</p>
              <p className="text-2xl font-bold text-gray-900">{models.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Permissions</p>
              <p className="text-2xl font-bold text-gray-900">
                {businesses.reduce((total, business) => total + business.modelAccess.length, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Model Details */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available 3D Models</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <div key={model.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src={model.thumbnailUrl}
                  alt={model.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{model.name}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {model.fileSize.toFixed(1)} MB • {model.businessAccess.length} businesses have access
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {model.businessAccess.length} access{model.businessAccess.length !== 1 ? 'es' : ''}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedModel(model.id);
                    setShowAccessModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Manage Access
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}