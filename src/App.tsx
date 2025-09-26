import React from 'react';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { LoginForm } from './components/Auth/LoginForm';
import { MainApp } from './components/MainApp';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, isLoading, updateUsersList } = useAuth();

  useEffect(() => {
    // Listen for user updates from DataContext
    const handleUsersUpdate = (event: any) => {
      if (updateUsersList) {
        updateUsersList(event.detail);
      }
    };

    window.addEventListener('usersUpdated', handleUsersUpdate);
    return () => window.removeEventListener('usersUpdated', handleUsersUpdate);
  }, [updateUsersList]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <MainApp />;
}

export default App;
