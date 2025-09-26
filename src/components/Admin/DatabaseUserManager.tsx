import React, { useState, useEffect } from 'react';
import { Users, Database, Plus, Shield, Building2, User, Check, X, Eye, Trash2, Settings } from 'lucide-react';
import { DatabaseService } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';

interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'business' | 'employee';
  parentId?: string;
  businessId?: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  parent?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface ModuleAccess {
  userId: string;
  moduleName: string;
  canAccess: boolean;
  canGrant: boolean;
}

export function DatabaseUserManager() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<DatabaseUser[]>([]);
  const [moduleAccess, setModuleAccess] = useState<ModuleAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DatabaseUser | null>(null);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'employee' as 'admin' | 'business' | 'employee',
    permissions: [] as string[]
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const loadedUsers = await DatabaseService.getUsers();
      setUsers(loadedUsers as DatabaseUser[]);
      console.log('✅ Loaded users from database:', loadedUsers.length);
    } catch (error) {
      console.error('❌ Failed to load users:', error);
    }
    setLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const userData = {
        email: newUser.email.trim().toLowerCase(),
        name: newUser.name.trim(),
        role: newUser.role,
        parentId: currentUser?.id,
        permissions: getDefaultPermissions(newUser.role),
        businessId: newUser.role === 'employee' ? currentUser?.businessId : undefined
      };

      await DatabaseService.createUser(userData);
      
      // Reload users
      await loadUsers();
      
      // Reset form
      setNewUser({
        name: '',
        email: '',
        role: 'employee',
        permissions: []
      });
      
      setShowCreateModal(false);
      showSuccessMessage(`User "${userData.name}" created successfully!`);
    } catch (error) {
      console.error('❌ Error creating user:', error);
      showErrorMessage('Failed to create user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await DatabaseService.deleteUser(userId);
      await loadUsers();
      showSuccessMessage('User deleted successfully!');
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      showErrorMessage('Failed to delete user.');
    }
  };

  const handleGrantModuleAccess = async (userId: string, moduleName: string, canGrant: boolean = false) => {
    try {
      await DatabaseService.grantModuleAccess(userId, moduleName, canGrant);
      await loadModuleAccess(userId);
      showSuccessMessage('Module access granted!');
    } catch (error) {
      console.error('❌ Error granting module access:', error);
      showErrorMessage('Failed to grant module access.');
    }
  };

  const handleRevokeModuleAccess = async (userId: string, moduleName: string) => {
    try {
      await DatabaseService.revokeModuleAccess(userId, moduleName);
      await loadModuleAccess(userId);
      showSuccessMessage('Module access revoked!');
    } catch (error) {
      console.error('❌ Error revoking module access:', error);
      showErrorMessage('Failed to revoke module access.');
    }
  };

  const loadModuleAccess = async (userId: string) => {
    try {
      const access = await DatabaseService.getUserModuleAccess(userId, 'ar-camera');
      setModuleAccess([{
        userId,
        moduleName: 'ar-camera',
        canAccess: access.canAccess,
        canGrant: access.canGrant
      }]);
    } catch (error) {
      console.error('❌ Error loading module access:', error);
    }
  };

  const getDefaultPermissions = (role: string): string[] => {
    switch (role) {
      case 'admin':
        return ['all'];
      case 'business':
        return ['manage_employees', 'view_dashboard', 'create_jobs', 'manage_customers'];
      case 'employee':
        return ['create_jobs', 'manage_tasks', 'capture_signatures', 'view_calendar'];
      default:
        return [];
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'business': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  const showErrorMessage = (message: string) => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      if (document.body.contains(errorDiv)) {
        document.body.removeChild(errorDiv);
      }
    }, 3000);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Database className="w-8 h-8 text-blue-600 mr-3" />
            Database User Management
          </h1>
          <p className="text-gray-600 mt-2">Manage users with permanent database storage</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {users.length} Users in Database
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create User
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Parent</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">AR Camera</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Created</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.parent ? (
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{user.parent.name}</div>
                        <div className="text-gray-500">{user.parent.role}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Root User</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">Loading...</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedUser(user);
                          loadModuleAccess(user.id);
                          setShowModuleModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Manage Modules"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
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

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Create New User (Database)</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Role *
                </label>
                <select
                  required
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as 'admin' | 'business' | 'employee'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="employee">Employee User</option>
                  <option value="business">Business User</option>
                  <option value="admin">Admin User</option>
                </select>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Database Features</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• User will be permanently saved in database</li>
                  <li>• Parent-child relationship will be established</li>
                  <li>• All user data persists across sessions</li>
                  <li>• Secure role-based access control</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create User in Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Module Access Modal */}
      {showModuleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Module Access - {selectedUser.name}
              </h3>
              <button
                onClick={() => {
                  setShowModuleModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">AR Camera Module</h4>
                  <p className="text-sm text-gray-600">Access to AR camera with 2D to 3D conversion</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {moduleAccess.find(m => m.userId === selectedUser.id && m.moduleName === 'ar-camera')?.canAccess ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">Has Access</span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-600">No Access</span>
                      </>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleGrantModuleAccess(selectedUser.id, 'ar-camera', true)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Grant Access
                    </button>
                    <button
                      onClick={() => handleRevokeModuleAccess(selectedUser.id, 'ar-camera')}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}