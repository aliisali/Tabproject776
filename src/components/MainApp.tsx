import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from './Layout/Sidebar';
import { AdminDashboard } from './Dashboard/AdminDashboard';
import { BusinessDashboard } from './Dashboard/BusinessDashboard';
import { EmployeeDashboard } from './Dashboard/EmployeeDashboard';
import { UserManagement } from './Users/UserManagement';
import { JobManagement } from './Jobs/JobManagement';
import { CalendarView } from './Calendar/CalendarView';
import { TaskManagement } from './Tasks/TaskManagement';
import { CameraCapture } from './Camera/CameraCapture';
import { EmailCenter } from './Email/EmailCenter';
import { NotificationCenter } from './Notifications/NotificationCenter';
import { ProductVisualizer } from './Features/ProductVisualizer';
import { BusinessManagement } from './Business/BusinessManagement';
import { PermissionManagement } from './Permissions/PermissionManagement';
import { ReportsManagement } from './Reports/ReportsManagement';
import { ProductManagement } from './Products/ProductManagement';
import { CustomerManagement } from './Customers/CustomerManagement';
import ARCameraModule from './ARModule/ARCameraModule';
import { ModulePermissions } from './Admin/ModulePermissions';
import { AdminHTMLManager } from './Admin/AdminHTMLManager';
import { ModelConverter } from './Admin/ModelConverter';
import { ModelPermissions } from './Admin/ModelPermissions';
import { Model3DViewer } from './Features/Model3DViewer';
import { EmailManager } from './Admin/EmailManager';
import PermissionManagementWrapper from './Permissions/PermissionManagement';

export function MainApp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  const renderContent = () => {
    // Admin-specific features
    if (user?.role === 'admin') {
      switch (activeTab) {
        case 'dashboard': return <AdminDashboard />;
        case 'users': return <UserManagement />;
        case 'businesses': return <BusinessManagement />;
        case 'ar-camera': return <ARCameraModule />;
        case 'permissions': return <PermissionManagementWrapper />;
        case 'reports': return <ReportsManagement />;
        case 'products': return <ProductManagement />;
        case 'html-manager': return <AdminHTMLManager />;
        case 'module-permissions': return <ModulePermissions />;
        case 'model-converter': return <ModelConverter />;
        case 'model-permissions': return <ModelPermissions />;
        case 'email-manager': return <EmailManager />;
        default: return <AdminDashboard />;
      }
    }

    // Business-specific features
    if (user?.role === 'business') {
      switch (activeTab) {
        case 'dashboard': return <BusinessDashboard />;
        case 'employees': return <UserManagement />;
        case 'jobs': return <JobManagement />;
        case 'calendar': return <CalendarView />;
        case 'reports': return <ReportsManagement />;
        case 'customers': return <CustomerManagement />;
        case 'ar-camera': return <ARCameraModule />;
        case '3d-viewer': return <Model3DViewer />;
        default: return <BusinessDashboard />;
      }
    }

    // Employee-specific features
    if (user?.role === 'employee') {
      switch (activeTab) {
        case 'dashboard': return <EmployeeDashboard />;
        case 'jobs': return <JobManagement />;
        case 'calendar': return <CalendarView />;
        case 'tasks': return <TaskManagement />;
        case 'camera': return <CameraCapture />;
        case 'ar-camera': return <ARCameraModule />;
        case 'emails': return <EmailCenter />;
        case 'notifications': return <NotificationCenter />;
        case 'products': return <ProductVisualizer />;
        case '3d-viewer': return <Model3DViewer />;
        default: return <EmployeeDashboard />;
      }
    }

    // Common components for all roles (fallback)
    if (activeTab === 'jobs') {
      return <JobManagement />;
    }
    if (activeTab === 'products') {
      return <ProductVisualizer />;
    }

    // Default fallback
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h2>
          <p className="text-gray-600">
            Feature not available for your role.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isMinimized={sidebarMinimized}
        onToggleMinimize={() => setSidebarMinimized(!sidebarMinimized)}
      />
      <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50/50 to-blue-50/50 transition-all duration-300">
        {renderContent()}
      </main>
    </div>
  );
}