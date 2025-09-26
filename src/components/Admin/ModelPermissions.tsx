import React, { useState, useEffect } from 'react';
import { Cube, Users, Settings, Eye, Check, X, Search } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface ModelPermission {
  businessId: string;
  canView3DModels: boolean;
  canUseInAR: boolean;
  grantedBy: string;
  grantedAt: string;
}

export function ModelPermissions() {
  const { businesses, users } = useData();
  const [modelPermissions, setModelPermissions] = useState<ModelPermission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadModelPermissions();
  }, []);

  const loadModelPermissions = () => {
    try {
      const stored = localStorage.getItem('model_permissions_v1');
      const permissions = stored ? JSON.parse(stored) : [];
      setModelPermissions(permissions);
      console.log('✅ Model permissions loaded:', permissions.length);
    } catch (error) {
      console.error('❌ Failed to load model permissions:', error);
      setModelPermissions([]);
    }
  };

  const saveModelPermissions = (permissions: ModelPermission[]) => {
    try {
      localStorage.setItem('model_permissions_v1', JSON.stringify(permissions));
      setModelPermissions(permissions);
      console.log('✅ Model permissions saved:', permissions.length);
    } catch (error) {
      console.error('❌ Failed to save model permissions:', error);
    }
  };

  const grantModelAccess = (businessId: string, canView: boolean, canUseAR: boolean) => {
    const newPermission: ModelPermission = {
      businessId,
      canView3DModels: canView,
      canUseInAR: canUseAR,
      grantedBy: 'current-admin-id',
      grantedAt: new Date().toISOString()
    };

    const updatedPermissions = modelPermissions.filter(
      permission => permission.businessId !== businessId
    );
    updatedPermissions.push(newPermission);
    
    saveModelPermissions(updatedPermissions);
    
    const business = businesses.find(b => b.id === businessId);
    showSuccessMessage(`3D model access granted to ${business?.name}`);
  };

  const revokeModelAccess = (businessId: string) => {
    const updatedPermissions = modelPermissions.filter(
      permission => permission.businessId !== businessId
    );
    
    saveModelPermissions(updatedPermissions);
    
    const business = businesses.find(b => b.id === businessId);
    showSuccessMessage(`3D model access revoked from ${business?.name}`);
  };

  const hasModelAccess = (businessId: string) => {
    return modelPermissions.find(permission => permission.businessId === businessId);
  };

  const filteredBusinesses = businesses.filter(business =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-gray-900">3D Model Permissions</h1>
          <p className="text-gray-600 mt-2">Manage business access to 3D models and AR features</p>
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

      {/* Businesses List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Business 3D Model Access</h2>
          <p className="text-gray-600 text-sm mt-1">Control which businesses can view and use 3D models in AR</p>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredBusinesses.map((business) => {
            const permission = hasModelAccess(business.id);
            const employeeCount = users.filter(u => u.businessId === business.id).length;

            return (
              <div key={business.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Cube className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{business.name}</h3>
                      <p className="text-sm text-gray-600">{business.email}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{employeeCount} employees</span>
                        <span>Created {new Date(business.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      {permission && (
                        <div className="flex items-center space-x-4 mt-2">
                          {permission.canView3DModels && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              <Eye className="w-3 h-3 mr-1" />
                              Can View 3D
                            </span>
                          )}
                          {permission.canUseInAR && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                              <Cube className="w-3 h-3 mr-1" />
                              Can Use in AR
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {permission ? (
                      <>
                        <div className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">Access Granted</span>
                        </div>
                        <button
                          onClick={() => revokeModelAccess(business.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                        >
                          Revoke Access
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => grantModelAccess(business.id, true, false)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                        >
                          Grant View Only
                        </button>
                        <button
                          onClick={() => grantModelAccess(business.id, true, true)}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                        >
                          Grant Full Access
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {filteredBusinesses.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No businesses found</p>
        </div>
      )}

      {/* Permission Summary */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-medium text-blue-900 mb-2">Permission Levels</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span><strong>View Only:</strong> Can view 3D models in the product viewer</span>
          </div>
          <div className="flex items-center space-x-2">
            <Cube className="w-4 h-4" />
            <span><strong>Full Access:</strong> Can view 3D models and use them in AR camera</span>
          </div>
        </div>
      </div>
    </div>
  );
}