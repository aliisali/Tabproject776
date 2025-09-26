import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ModulePermission {
  userId: string;
  moduleId: string;
  canAccess: boolean;
  canGrantAccess: boolean;
  grantedBy: string;
  grantedAt: string;
}

export function useModulePermissions() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = () => {
    try {
      const stored = localStorage.getItem('module_permissions_v1');
      const loadedPermissions = stored ? JSON.parse(stored) : [];
      setPermissions(loadedPermissions);
      console.log('✅ Module permissions loaded:', loadedPermissions.length);
    } catch (error) {
      console.error('❌ Failed to load module permissions:', error);
      setPermissions([]);
    }
  };

  const hasModuleAccess = (moduleId: string): boolean => {
    if (!user) return false;

    // Admin always has access
    if (user.role === 'admin') return true;

    // Check user permissions array first
    if (user.permissions.includes('ar_camera_access') || user.permissions.includes('all')) {
      return true;
    }

    // Check explicit module permissions
    const permission = permissions.find(p => p.userId === user.id && p.moduleId === moduleId);
    return permission?.canAccess || false;
  };

  const canGrantModuleAccess = (moduleId: string): boolean => {
    if (!user) return false;

    // Admin can always grant access
    if (user.role === 'admin') return true;

    // Check user permissions array
    if (user.permissions.includes('ar_camera_grant') || user.permissions.includes('all')) {
      return true;
    }

    // Check explicit module permissions
    const permission = permissions.find(p => p.userId === user.id && p.moduleId === moduleId);
    return permission?.canGrantAccess || false;
  };

  return {
    permissions,
    hasModuleAccess,
    canGrantModuleAccess,
    loadPermissions
  };
}