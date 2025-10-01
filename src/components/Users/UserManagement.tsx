import React, { useState } from 'react';
import { Plus, Search, Filter, CreditCard as Edit, Trash2, Shield, User, Building2, Mail, Phone, Calendar, X, Eye, Headphones } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const { users, addUser, deleteUser, updateUser, businesses } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee' as 'admin' | 'business' | 'employee',
    businessId: '',
    permissions: [] as string[]
  });
  const [editUser, setEditUser] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee' as 'admin' | 'business' | 'employee',
    businessId: '',
    permissions: [] as string[]
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'business': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailableRoles = () => {
    if (currentUser?.role === 'admin') {
      return [
        { value: 'admin', label: 'Admin User' },
        { value: 'business', label: 'Business User' },
        { value: 'employee', label: 'Employee User' }
      ];
    } else if (currentUser?.role === 'business') {
      return [
        { value: 'employee', label: 'Employee User' }
      ];
    }
    return [];
  };

  const getDefaultPermissions = (role: string) => {
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (newUser.password !== newUser.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    try {
      const userData = {
        name: newUser.name.trim(),
        email: newUser.email.trim().toLowerCase(),
        password: newUser.password,
        role: newUser.role,
        permissions: newUser.role === 'employee' && currentUser?.businessId 
          ? ['create_jobs', 'manage_tasks', 'capture_signatures', 'view_dashboard', 'view_calendar']
          : getDefaultPermissions(newUser.role),
        businessId: newUser.role === 'employee' ? (currentUser?.businessId || undefined) : (newUser.businessId || undefined),
        isActive: true,
        emailVerified: false
      };
      
      await addUser(userData);
      
      // Reset form only on success
      setNewUser({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'employee',
        businessId: '',
        permissions: []
      });
      
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create user:', error);
      // Error is already handled by addUser function
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUser(userId);
    }
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    handleUpdateUserAsync();
  };

  const handleUpdateUserAsync = async () => {
    if (editingUser) {
      try {
        // Validate passwords match if password is being changed
        if (editUser.password && editUser.password !== editUser.confirmPassword) {
          alert('Passwords do not match!');
          return;
        }
        
        const updatedData = {
          name: editUser.name,
          email: editUser.email,
          role: editUser.role,
          businessId: editUser.businessId || undefined,
          permissions: editUser.permissions,
          ...(editUser.password && { password: editUser.password })
        };
        
        await updateUser(editingUser.id, updatedData);
        
        setShowEditModal(false);
        setEditingUser(null);
        setEditUser({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'employee',
          businessId: '',
          permissions: []
        });
      } catch (error) {
        console.error('Error updating user:', error);
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    // Business users can only see employees in their business
    if (currentUser?.role === 'business') {
      const canSeeUser = user.role === 'employee' && user.businessId === currentUser.businessId;
      return matchesSearch && matchesRole && canSeeUser;
    }
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage platform users and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
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
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="business">Business</option>
                <option value="employee">Employee</option>
              </select>
            </div>
          </div>
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
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Created</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
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
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setEditUser({
                            name: user.name,
                            email: user.email,
                            password: '', // Don't pre-fill password for security
                            confirmPassword: '',
                            role: user.role,
                            businessId: user.businessId || '',
                            permissions: user.permissions
                          });
                          setShowEditModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Shield className="w-4 h-4" />
                      </button>
                      {/* Only allow deletion if current user has permission */}
                      {(currentUser?.role === 'admin' || 
                        (currentUser?.role === 'business' && user.role === 'employee' && user.businessId === currentUser.businessId)) && (
                        <>
                        <button 
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">User Details</h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h4>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Verified</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedUser.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedUser.emailVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business ID</label>
                  <p className="text-gray-900">{selectedUser.businessId || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <p className="text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.permissions.map((permission: string) => (
                    <span key={permission} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {permission === 'vr_view' && <Headphones className="w-3 h-3 mr-1" />}
                      {permission.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Edit User</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editUser.name}
                  onChange={(e) => setEditUser({...editUser, name: e.target.value})}
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
                  value={editUser.email}
                  onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password (Leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    value={editUser.password}
                    onChange={(e) => setEditUser({...editUser, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                    minLength={6}
                  />
                  {editUser.password && (
                    <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={editUser.confirmPassword}
                    onChange={(e) => setEditUser({...editUser, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm new password"
                    minLength={6}
                    disabled={!editUser.password}
                  />
                  {editUser.password && editUser.confirmPassword && editUser.password !== editUser.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>
              </div>

              {currentUser?.role === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Role *
                  </label>
                  <select
                    required
                    value={editUser.role}
                    onChange={(e) => setEditUser({...editUser, role: e.target.value as 'admin' | 'business' | 'employee'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="admin">Admin User</option>
                    <option value="business">Business User</option>
                    <option value="employee">Employee User</option>
                  </select>
                </div>
              )}

              {(editUser.role === 'business' || editUser.role === 'employee') && currentUser?.role === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business ID
                  </label>
                  <input
                    type="text"
                    value={editUser.businessId}
                    onChange={(e) => setEditUser({...editUser, businessId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter business ID"
                  />
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Current Permissions</h4>
                <div className="flex flex-wrap gap-2">
                  {editingUser.permissions.map((permission: string) => (
                    <span key={permission} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {permission === 'vr_view' && <Headphones className="w-3 h-3 mr-1" />}
                      {permission.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Create New User</h3>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password"
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={newUser.confirmPassword}
                    onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm password"
                    minLength={6}
                  />
                  {newUser.confirmPassword && newUser.password !== newUser.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>
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
                  {getAvailableRoles().map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  {currentUser?.role === 'admin' 
                    ? 'Admin users can create any user type'
                    : 'Business users can only create employee users for their business'
                  }
                </p>
              </div>

              {newUser.role === 'business' && currentUser?.role === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business ID
                  </label>
                  <input
                    type="text"
                    value={newUser.businessId}
                    onChange={(e) => setNewUser({...newUser, businessId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter business ID (optional)"
                  />
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Default Permissions</h4>
                <div className="text-sm text-gray-600">
                  {newUser.role === 'admin' && (
                    <p>• Full platform access and management</p>
                  )}
                  {newUser.role === 'business' && (
                    <>
                      <p>• Manage employees and view dashboard</p>
                      <p>• Create and manage jobs</p>
                      <p>• Manage customers and reports</p>
                    </>
                  )}
                  {newUser.role === 'employee' && (
                    <>
                      <p>• Create jobs and manage tasks</p>
                      <p>• Capture signatures and photos</p>
                      <p>• View calendar and notifications</p>
                    </>
                  )}
                </div>
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
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}