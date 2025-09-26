import React from 'react';
import { Users, Building2, Calendar, ClipboardList, FileText, Settings, BarChart3, Camera, Mail, Bell, Package, LogOut, Headphones, Code, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useModulePermissions } from '../../hooks/useModulePermissions';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user, logout } = useAuth();
  const { hasModuleAccess } = useModulePermissions();

  // Check if user has VR View permission
  const hasVRViewPermission = () => {
    // Check new AR Camera module access
    if (hasModuleAccess('ar-camera')) {
      return true;
    }
    
    // Fallback to old VR View permission system
    if (user?.role === 'employee') {
      return user.permissions.includes('vr_view') || user.permissions.includes('all');
    }
    return false;
  };

  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'businesses', label: 'Businesses', icon: Building2 },
          { id: 'products', label: 'Products', icon: Package },
          { id: 'ar-camera', label: 'AR Camera', icon: Headphones },
          { id: 'module-permissions', label: 'Module Permissions', icon: Shield },
          { id: 'permissions', label: 'Permissions', icon: Settings },
          { id: 'reports', label: 'Reports', icon: FileText },
          { id: 'html-manager', label: 'HTML Manager', icon: Code },
        ];
      case 'business':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'employees', label: 'Employees', icon: Users },
          { id: 'jobs', label: 'Jobs', icon: ClipboardList },
          { id: 'calendar', label: 'Calendar', icon: Calendar },
          { id: 'reports', label: 'Reports', icon: FileText },
          { id: 'customers', label: 'Customers', icon: Building2 },
          ...(hasModuleAccess('ar-camera') ? [{ id: 'ar-camera', label: 'AR Camera', icon: Headphones }] : []),
        ];
      case 'employee':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'jobs', label: 'Jobs', icon: ClipboardList },
          { id: 'calendar', label: 'Calendar', icon: Calendar },
          { id: 'tasks', label: 'Tasks', icon: FileText },
          { id: 'camera', label: 'Capture', icon: Camera },
          ...(hasVRViewPermission() ? [{ id: 'ar-camera', label: 'AR Camera', icon: Headphones }] : []),
          { id: 'emails', label: 'Emails', icon: Mail },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'products', label: 'Product Viewer', icon: Package },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-800">JobManager Pro</h1>
        <p className="text-xs text-blue-600 mt-1">v1.2.0 - Storage Fixed!</p>
        <p className="text-sm text-gray-600 mt-1">{user?.name}</p>
        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-2 capitalize">
          {user?.role}
        </span>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-3 text-left rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}