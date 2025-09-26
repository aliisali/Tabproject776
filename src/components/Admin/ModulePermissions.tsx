import React, { useState } from 'react';
import { Shield, Users, Building2, User, Check, X, Settings, Headphones, Eye, Save } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface ModulePermission {
  userId: string;
  moduleId: string;
  canAccess: boolean;
  canGrantAccess: boolean;
  grantedBy: string;
  grantedAt: string;
}

export function ModulePermissions() {
  const { users, businesses, updateUser } = useData();
  const { user: currentUser } = useAuth();
  const [selectedModule] = useState('ar-camera');
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Load module permissions from localStorage
  const getModulePermissions = (): ModulePermission[] => {
    try {
      const stored = localStorage.getItem('module_permissions_v1');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load module permissions:', error);
      return [];
    }
  };

  // Save module permissions to localStorage
  const saveModulePermissions = (permissions: ModulePermission[]) => {
    try {
      localStorage.setItem('module_permissions_v1', JSON.stringify(permissions));
      console.log('✅ Module permissions saved:', permissions.length);
    } catch (error) {
      console.error('❌ Failed to save module permissions:', error);
    }
  };

  const [modulePermissions, setModulePermissions] = useState<ModulePermission[]>(getModulePermissions());

  // Check if user has access to module
  const hasModuleAccess = (userId: string, moduleId: string): boolean => {
    const user = users.find(u => u.id === userId);
    if (!user) return false;

    // Admin always has access
    if (user.role === 'admin') return true;

    // Check explicit permissions
    const permission = modulePermissions.find(p => p.userId === userId && p.moduleId === moduleId);
    return permission?.canAccess || false;
  };

  // Check if user can grant access to module
  const canGrantModuleAccess = (userId: string, moduleId: string): boolean => {
    const user = users.find(u => u.id === userId);
    if (!user) return false;

    // Admin can always grant access
    if (user.role === 'admin') return true;

    // Check if user has grant permissions
    const permission = modulePermissions.find(p => p.userId === userId && p.moduleId === moduleId);
    return permission?.canGrantAccess || false;
  };

  // Grant access to module
  const grantModuleAccess = async (targetUserId: string, moduleId: string, canGrant: boolean = false) => {
    const newPermission: ModulePermission = {
      userId: targetUserId,
      moduleId,
      canAccess: true,
      canGrantAccess: canGrant,
      grantedBy: currentUser?.id || '',
      grantedAt: new Date().toISOString()
    };

    const updatedPermissions = [
      ...modulePermissions.filter(p => !(p.userId === targetUserId && p.moduleId === moduleId)),
      newPermission
    ];

    setModulePermissions(updatedPermissions);
    saveModulePermissions(updatedPermissions);

    // Also update user permissions array
    const targetUser = users.find(u => u.id === targetUserId);
    if (targetUser) {
      const updatedPermissions = [...(targetUser.permissions || [])];
      if (!updatedPermissions.includes('ar_camera_access')) {
        updatedPermissions.push('ar_camera_access');
      }
      if (canGrant && !updatedPermissions.includes('ar_camera_grant')) {
        updatedPermissions.push('ar_camera_grant');
      }
      
      await updateUser(targetUserId, { permissions: updatedPermissions });
    }

    showSuccessMessage(`Access granted to ${targetUser?.name}`);
  };

  // Revoke access to module
  const revokeModuleAccess = async (targetUserId: string, moduleId: string) => {
    const updatedPermissions = modulePermissions.filter(
      p => !(p.userId === targetUserId && p.moduleId === moduleId)
    );

    setModulePermissions(updatedPermissions);
    saveModulePermissions(updatedPermissions);

    // Also update user permissions array
    const targetUser = users.find(u => u.id === targetUserId);
    if (targetUser) {
      const updatedPermissions = (targetUser.permissions || []).filter(
        p => p !== 'ar_camera_access' && p !== 'ar_camera_grant'
      );
      
      await updateUser(targetUserId, { permissions: updatedPermissions });
    }

    showSuccessMessage(`Access revoked from ${targetUser?.name}`);
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

  // Get users by role
  const adminUsers = users.filter(u => u.role === 'admin');
  const businessUsers = users.filter(u => u.role === 'business');
  const employeeUsers = users.filter(u => u.role === 'employee');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Module Permissions</h1>
          <p className="text-gray-600 mt-2">Manage access to AR Camera and other modules</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
            AR Camera Module
          </div>
        </div>
      </div>

      {/* Permission Structure Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Permission Structure</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-gray-900">Admin Users</span>
            </div>
            <ul className="text-gray-600 space-y-1">
              <li>• Full access to all modules</li>
              <li>• Can grant access to anyone</li>
              <li>• Can revoke access from anyone</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-900">Business Users</span>
            </div>
            <ul className="text-gray-600 space-y-1">
              <li>• No access by default</li>
              <li>• Can be granted access by Admin</li>
              <li>• Can grant to employees if enabled</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <User className="w-4 h-4 text-green-600" />
              <span className="font-medium text-gray-900">Employee Users</span>
            </div>
            <ul className="text-gray-600 space-y-1">
              <li>• No access by default</li>
              <li>• Can be granted by Admin</li>
              <li>• Can be granted by Business (if enabled)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Users List with Permissions */}
      <div className="space-y-6">
        {/* Admin Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 text-purple-600 mr-2" />
            Admin Users ({adminUsers.length})
          </h2>
          <div className="space-y-3">
            {adminUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Headphones className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Full Access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-600 font-medium">Can Grant</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Building2 className="w-5 h-5 text-blue-600 mr-2" />
            Business Users ({businessUsers.length})
          </h2>
          <div className="space-y-3">
            {businessUsers.map((user) => {
              const hasAccess = hasModuleAccess(user.id, selectedModule);
              const canGrant = canGrantModuleAccess(user.id, selectedModule);
              
              return (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {hasAccess ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">Has Access</span>
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-600">No Access</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {canGrant ? (
                        <>
                          <Settings className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-600 font-medium">Can Grant</span>
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">Cannot Grant</span>
                        </>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {!hasAccess ? (
                        <button
                          onClick={() => grantModuleAccess(user.id, selectedModule, true)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Grant Access
                        </button>
                      ) : (
                        <button
                          onClick={() => revokeModuleAccess(user.id, selectedModule)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Employee Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 text-green-600 mr-2" />
            Employee Users ({employeeUsers.length})
          </h2>
          <div className="space-y-3">
            {employeeUsers.map((user) => {
              const hasAccess = hasModuleAccess(user.id, selectedModule);
              
              return (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">Business: {user.businessId}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {hasAccess ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">Has Access</span>
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-600">No Access</span>
                        </>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {!hasAccess ? (
                        <button
                          onClick={() => grantModuleAccess(user.id, selectedModule, false)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Grant Access
                        </button>
                      ) : (
                        <button
                          onClick={() => revokeModuleAccess(user.id, selectedModule)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}