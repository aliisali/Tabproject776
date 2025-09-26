import React, { useState, useEffect } from 'react';
import { Shield, Users, Settings, Eye, Plus, Search, Check, X, Headphones } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface ModuleAccess {
  userId: string;
  moduleId: string;
  canAccess: boolean;
  canGrantAccess: boolean;
  grantedBy: string;
  grantedAt: string;
}

export function ModulePermissions() {
  const { users } = useData();
  const [moduleAccess, setModuleAccess] = useState<ModuleAccess[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('ar-camera');

  const modules = [
    {
      id: 'ar-camera',
      name: 'AR Camera',
      description: 'Advanced AR camera with 2D to 3D conversion and background removal',
      icon: Headphones,
      requiresPermission: true
    }
  ];

  useEffect(() => {
    loadModuleAccess();
  }, []);

  const loadModuleAccess = () => {
    try {
      const stored = localStorage.getItem('module_permissions_v1');
      const permissions = stored ? JSON.parse(stored) : [];
      setModuleAccess(permissions);
      console.log('✅ Module permissions loaded:', permissions.length);
    } catch (error) {
      console.error('❌ Failed to load module permissions:', error);
      setModuleAccess([]);
    }
  };

  const saveModuleAccess = (permissions: ModuleAccess[]) => {
    try {
      localStorage.setItem('module_permissions_v1', JSON.stringify(permissions));
      setModuleAccess(permissions);
      console.log('✅ Module permissions saved:', permissions.length);
    } catch (error) {
      console.error('❌ Failed to save module permissions:', error);
    }
  };

  const grantAccess = (userId: string, moduleId: string, canGrant: boolean = false) => {
    const newAccess: ModuleAccess = {
      userId,
      moduleId,
      canAccess: true,
      canGrantAccess: canGrant,
      grantedBy: 'current-admin-id', // In real app, get from auth context
      grantedAt: new Date().toISOString()
    };

    const updatedAccess = moduleAccess.filter(
      access => !(access.userId === userId && access.moduleId === moduleId)
    );
    updatedAccess.push(newAccess);
    
    saveModuleAccess(updatedAccess);
    showSuccessMessage(`Access granted to ${users.find(u => u.id === userId)?.name}`);
  };

  const revokeAccess = (userId: string, moduleId: string) => {
    const updatedAccess = moduleAccess.filter(
      access => !(access.userId === userId && access.moduleId === moduleId)
    );
    
    saveModuleAccess(updatedAccess);
    showSuccessMessage(`Access revoked from ${users.find(u => u.id === userId)?.name}`);
  };

  const hasAccess = (userId: string, moduleId: string) => {
    return moduleAccess.some(
      access => access.userId === userId && access.moduleId === moduleId && access.canAccess
    );
  };

  const canGrantAccess = (userId: string, moduleId: string) => {
    return moduleAccess.some(
      access => access.userId === userId && access.moduleId === moduleId && access.canGrantAccess
    );
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
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

  const selectedModuleData = modules.find(m => m.id === selectedModule);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Module Permissions</h1>
          <p className="text-gray-600 mt-2">Manage access to advanced features and modules</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Module Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Modules</h2>
          <div className="space-y-2">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <button
                  key={module.id}
                  onClick={() => setSelectedModule(module.id)}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                    selectedModule === module.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{module.name}</div>
                    <div className="text-xs opacity-75">{module.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* User List */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedModuleData?.name} Access Control
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {selectedModuleData && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <selectedModuleData.icon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900">{selectedModuleData.name}</h3>
                  <p className="text-blue-800 text-sm mt-1">{selectedModuleData.description}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'business' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                      {user.businessId && (
                        <span className="text-xs text-gray-500">Business: {user.businessId}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {hasAccess(user.id, selectedModule) ? (
                    <>
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">Access Granted</span>
                        {canGrantAccess(user.id, selectedModule) && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                            Can Grant
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => revokeAccess(user.id, selectedModule)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        Revoke
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => grantAccess(user.id, selectedModule, false)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                      >
                        Grant Access
                      </button>
                      <button
                        onClick={() => grantAccess(user.id, selectedModule, true)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                      >
                        Grant + Allow Grant
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}