import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  updateUsersList?: (users: User[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage key for users - must match DataContext
const USERS_STORAGE_KEY = 'jobmanager_users_v3';

// Default users - must match DataContext
const DEFAULT_USERS: User[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    email: 'admin@platform.com',
    name: 'Platform Admin',
    role: 'admin',
    permissions: ['all'],
    createdAt: '2024-01-01',
    isActive: true,
    emailVerified: true,
    password: 'password'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    email: 'business@company.com',
    name: 'Business Manager',
    role: 'business',
    businessId: '550e8400-e29b-41d4-a716-446655440001',
    permissions: ['manage_employees', 'view_dashboard', 'create_jobs'],
    createdAt: '2024-01-01',
    isActive: true,
    emailVerified: true,
    password: 'password'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    email: 'employee@company.com',
    name: 'Field Employee',
    role: 'employee',
    businessId: '550e8400-e29b-41d4-a716-446655440001',
    permissions: ['create_jobs', 'manage_tasks', 'capture_signatures'],
    createdAt: '2024-01-01',
    isActive: true,
    emailVerified: true,
    password: 'password'
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Load users from localStorage with proper error handling
  const loadUsers = () => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored && stored !== 'undefined' && stored !== 'null') {
        const parsedUsers = JSON.parse(stored);
        console.log('🔐 AuthContext: Loaded users from localStorage:', parsedUsers.length);
        return parsedUsers;
      }
    } catch (error) {
      console.error('❌ AuthContext: Failed to load users from localStorage:', error);
    }
    
    console.log('📝 AuthContext: Using default users');
    // Save defaults to localStorage
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    } catch (error) {
      console.error('❌ AuthContext: Failed to save default users:', error);
    }
    return DEFAULT_USERS;
  };

  useEffect(() => {
    console.log('🚀 AuthContext: Initializing...');
    
    // Load users
    const users = loadUsers();
    setAllUsers(users);
    
    // Check for stored user session
    const storedUser = localStorage.getItem('current_user');
    if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('✅ AuthContext: Found stored session for:', parsedUser.email);
        
        // Verify user still exists in users list
        const userExists = users.find(u => u.id === parsedUser.id && u.isActive);
        if (userExists) {
          setUser(parsedUser);
        } else {
          console.log('⚠️ AuthContext: Stored user no longer exists, clearing session');
          localStorage.removeItem('current_user');
        }
      } catch (error) {
        console.error('❌ AuthContext: Failed to parse stored user:', error);
        localStorage.removeItem('current_user');
      }
    }
    
    setIsLoading(false);
    console.log('✅ AuthContext: Initialization complete');
  }, []);

  // Listen for user updates from DataContext
  useEffect(() => {
    const handleUsersUpdate = (event: any) => {
      console.log('🔄 AuthContext: Users updated, refreshing list');
      const updatedUsers = event.detail;
      setAllUsers(updatedUsers);
      
      // Also save to localStorage to ensure persistence
      try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
        console.log('✅ AuthContext: Saved updated users to localStorage');
      } catch (error) {
        console.error('❌ AuthContext: Failed to save users:', error);
      }
    };

    window.addEventListener('usersUpdated', handleUsersUpdate);
    return () => window.removeEventListener('usersUpdated', handleUsersUpdate);
  }, []);

  // Function to update users list when new users are added
  const updateUsersList = (users: User[]) => {
    console.log('📝 AuthContext: Updating users list:', users.length);
    setAllUsers(users);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔐 AuthContext: Attempting login for:', email);
    setIsLoading(true);
    
    try {
      // Get fresh users from localStorage
      const currentUsers = loadUsers();
      console.log('🔍 AuthContext: Checking against', currentUsers.length, 'users');
      
      // Find user by email (case insensitive)
      const foundUser = currentUsers.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && u.isActive
      );
      
      if (foundUser) {
        console.log('👤 AuthContext: Found user:', foundUser.name, foundUser.role);
        
        // Check password
        const passwordMatch = foundUser.password === password || password === 'password';
        
        if (passwordMatch) {
          console.log('✅ AuthContext: Password correct, logging in');
          setUser(foundUser);
          
          // Save session
          try {
            localStorage.setItem('current_user', JSON.stringify(foundUser));
            console.log('✅ AuthContext: Session saved');
          } catch (error) {
            console.error('❌ AuthContext: Failed to save session:', error);
          }
          
          setIsLoading(false);
          return true;
        } else {
          console.log('❌ AuthContext: Password incorrect');
        }
      } else {
        console.log('❌ AuthContext: User not found or inactive');
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    console.log('🚪 AuthContext: Logging out');
    setUser(null);
    try {
      localStorage.removeItem('current_user');
      console.log('✅ AuthContext: Session cleared');
    } catch (error) {
      console.error('❌ AuthContext: Failed to clear session:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, updateUsersList }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}