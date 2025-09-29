import React from 'react';
import { Users, Building2, Calendar, ClipboardList, FileText, Settings, BarChart3, Camera, Mail, Bell, Package, LogOut, Headphones, Code, Shield, Cuboid as Cube, ChevronLeft, ChevronRight, Menu, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useModulePermissions } from '../../hooks/useModulePermissions';
import { Logo } from './Logo';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export function Sidebar({ activeTab, onTabChange, isMinimized, onToggleMinimize }: SidebarProps) {
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
          { id: 'model-converter', label: '3D Model Converter', icon: Cube },
          { id: 'model-permissions', label: '3D Model Permissions', icon: Settings },
          { id: 'module-permissions', label: 'Module Permissions', icon: Shield },
          { id: 'permissions', label: 'Permissions', icon: Settings },
          { id: 'business-settings', label: 'Business Settings', icon: Building2 },
          { id: 'reports', label: 'Reports', icon: FileText },
          { id: 'html-manager', label: 'HTML Manager', icon: Code },
          { id: 'email-manager', label: 'Email Manager', icon: Mail },
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
          { id: 'job-assignment', label: 'Job Assignment', icon: Users },
          { id: '3d-viewer', label: '3D Model Viewer', icon: Cube },
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
          { id: '3d-viewer', label: '3D Model Viewer', icon: Cube },
          { id: 'working-hours', label: 'Working Hours', icon: Clock },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className={`${isMinimized ? 'w-20' : 'w-64'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl h-screen flex flex-col transition-all duration-300 ease-in-out relative`}>
      {/* Minimize Button */}
      <button
        onClick={onToggleMinimize}
        className="absolute -right-3 top-6 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-10 border-2 border-white"
        title={isMinimized ? 'Expand Sidebar' : 'Minimize Sidebar'}
      >
        {isMinimized ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      <div className={`${isMinimized ? 'p-3' : 'p-6'} border-b border-slate-700 transition-all duration-300`}>
        {isMinimized ? (
          <div className="flex flex-col items-center space-y-2">
            <Logo size="sm" variant="light" showText={false} />
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user?.name.charAt(0).toUpperCase()}
            </div>
          </div>
        ) : (
          <>
            <Logo size="md" variant="light" />
            <p className="text-xs text-blue-300 mt-2">v1.3.0 - 3D AR Models</p>
            <p className="text-sm text-gray-300 mt-1">{user?.name}</p>
            <span className="inline-block px-2 py-1 text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full mt-2 capitalize">
              {user?.role}
            </span>
          </>
        )}
      </div>
      
      <nav className={`flex-1 ${isMinimized ? 'p-2' : 'p-4'} transition-all duration-300`}>
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center ${isMinimized ? 'px-2 py-3 justify-center' : 'px-4 py-3'} text-left rounded-lg transition-all duration-200 group relative ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-300 hover:bg-slate-700/50 hover:text-white hover:shadow-md'
                  }`}
                  title={isMinimized ? item.label : ''}
                >
                  <Icon className={`w-5 h-5 ${isMinimized ? '' : 'mr-3'} transition-all duration-200`} />
                  {!isMinimized && (
                    <span className="transition-all duration-200">{item.label}</span>
                  )}
                  
                  {/* Tooltip for minimized state */}
                  {isMinimized && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                      {item.label}
                      <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className={`${isMinimized ? 'p-2' : 'p-4'} border-t border-slate-700 transition-all duration-300`}>
        <button
          onClick={logout}
          className={`w-full flex items-center ${isMinimized ? 'px-2 py-3 justify-center' : 'px-4 py-3'} text-left rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-200 group relative`}
          title={isMinimized ? 'Logout' : ''}
        >
          <LogOut className={`w-5 h-5 ${isMinimized ? '' : 'mr-3'} transition-all duration-200`} />
          {!isMinimized && <span>Logout</span>}
          
          {/* Tooltip for minimized logout */}
          {isMinimized && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
              Logout
              <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}