import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database, CheckCircle, XCircle, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

export function DatabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [detailedResults, setDetailedResults] = useState<any>({});
  const [realTimeStatus, setRealTimeStatus] = useState<string>('Checking...');

  useEffect(() => {
    testDatabaseConnection();
    // Auto-refresh every 10 seconds to check status
    const interval = setInterval(testDatabaseConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  const testDatabaseConnection = async () => {
    setConnectionStatus('testing');
    setTestResults([]);
    setDetailedResults({});
    setRealTimeStatus('Testing connection...');
    
    try {
      console.log('🔄 Testing Supabase connection...');
      
      // Test 1: Basic Supabase client
      const clientTest = {
        name: 'Supabase Client',
        status: 'success',
        details: `URL: ${supabase.supabaseUrl}`,
        timestamp: new Date().toLocaleTimeString()
      };
      
      // Test 2: Environment variables
      const envTest = {
        name: 'Environment Variables',
        status: import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY ? 'success' : 'error',
        details: {
          url: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing',
          key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
        },
        timestamp: new Date().toLocaleTimeString()
      };
      
      // Test 3: Real-time connection test
      let connectionTest;
      try {
        setRealTimeStatus('Testing database connection...');
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .limit(1);

        connectionTest = {
          name: 'Database Connection',
          status: error ? 'error' : 'success',
          error: error?.message,
          details: error ? `Error: ${error.message}` : 'Connected successfully',
          timestamp: new Date().toLocaleTimeString()
        };
        
        if (!error) {
          setRealTimeStatus('✅ Database connected successfully!');
        } else {
          setRealTimeStatus(`❌ Connection failed: ${error.message}`);
        }
      } catch (err) {
        connectionTest = {
          name: 'Database Connection',
          status: 'error',
          error: (err as Error).message,
          details: `Connection failed: ${(err as Error).message}`,
          timestamp: new Date().toLocaleTimeString()
        };
        setRealTimeStatus(`❌ Connection error: ${(err as Error).message}`);
      }

      // Test 4: Test users table with relationships
      let usersTest;
      try {
        setRealTimeStatus('Testing users table with relationships...');
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select(`
            id,
            name,
            email,
            role,
            parent_id,
            created_by,
            parent:users!parent_id(id, name, email, role),
            createdBy:users!created_by(id, name, email)
          `)
          .limit(5);

        usersTest = {
          name: 'Users Table Access',
          status: usersError ? 'error' : 'success',
          error: usersError?.message,
          details: usersError ? `Error: ${usersError.message}` : `Found ${users?.length || 0} users with relationships`,
          timestamp: new Date().toLocaleTimeString()
        };
        
        if (!usersError) {
          setRealTimeStatus(`✅ Users table accessible with ${users?.length || 0} records`);
        } else {
          setRealTimeStatus(`❌ Users table error: ${usersError.message}`);
        }
      } catch (err) {
        usersTest = {
          name: 'Users Table Access',
          status: 'error',
          error: (err as Error).message,
          details: `Failed to fetch users: ${(err as Error).message}`,
          timestamp: new Date().toLocaleTimeString()
        };
        setRealTimeStatus(`❌ Users fetch failed: ${(err as Error).message}`);
      }

      // Test 5: Check all required tables
      const tables = ['users', 'businesses', 'jobs', 'customers', 'products', 'notifications'];
      const tableTests = [];

      for (const table of tables) {
        try {
          setRealTimeStatus(`Testing ${table} table...`);
          const { data, error } = await supabase
            .from(table)
            .select('id')
            .limit(1);
          
          tableTests.push({
            table,
            status: error ? 'error' : 'success',
            error: error?.message,
            details: error ? `Error: ${error.message}` : 'Table accessible',
            timestamp: new Date().toLocaleTimeString()
          });
        } catch (err) {
          tableTests.push({
            table,
            status: 'error',
            error: (err as Error).message,
            details: `Failed: ${(err as Error).message}`,
            timestamp: new Date().toLocaleTimeString()
          });
        }
      }

      // Test 6: Test database functions
      let functionsTest;
      try {
        setRealTimeStatus('Testing database functions...');
        const uniqueEmail = `test-${Date.now()}@example.com`;
        const { data, error } = await supabase.rpc('create_user_with_hierarchy', {
          p_email: uniqueEmail,
          p_name: 'Test User',
          p_role: 'employee',
          p_parent_id: null,
          p_permissions: ['test']
        });

        functionsTest = {
          name: 'Database Functions',
          status: error ? 'error' : 'success',
          error: error?.message,
          details: error ? `Error: ${error.message}` : 'Database functions working',
          timestamp: new Date().toLocaleTimeString()
        };
        
        if (!error) {
          setRealTimeStatus('✅ All database tests passed!');
        } else {
          setRealTimeStatus(`❌ Function test failed: ${error.message}`);
        }
      } catch (err) {
        functionsTest = {
          name: 'Database Functions',
          status: 'error',
          error: (err as Error).message,
          details: `Failed: ${(err as Error).message}`,
          timestamp: new Date().toLocaleTimeString()
        };
        setRealTimeStatus(`❌ Function error: ${(err as Error).message}`);
      }

      // Compile all test results
      const allTests = [clientTest, envTest, connectionTest, usersTest, functionsTest];
      setTestResults(tableTests);
      setDetailedResults({
        basicTests: allTests,
        tableTests: tableTests
      });
      
      // Determine overall status
      const hasErrors = allTests.some(test => test.status === 'error') || 
                       tableTests.some(test => test.status === 'error');
      setConnectionStatus(hasErrors ? 'error' : 'connected');
      
      if (!hasErrors) {
        setRealTimeStatus('🎉 All systems operational!');
      }
      
    } catch (error) {
      console.error('Database connection error:', error);
      setConnectionStatus('error');
      setErrorMessage((error as Error).message);
      setRealTimeStatus(`❌ Critical error: ${(error as Error).message}`);
      setDetailedResults({
        basicTests: [{
          name: 'Connection Test',
          status: 'error',
          error: (error as Error).message,
          details: `Failed to test connection: ${(error as Error).message}`,
          timestamp: new Date().toLocaleTimeString()
        }],
        tableTests: []
      });
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return <AlertCircle className="w-6 h-6 text-yellow-500 animate-pulse" />;
      case 'connected':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'testing':
        return 'border-yellow-200 bg-yellow-50';
      case 'connected':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  const getStatusIcon2 = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <Database className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Database Connection Test</h1>
            <p className="text-sm text-gray-600">Real-time Supabase connection monitoring</p>
          </div>
        </div>

        {/* Real-time Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-3">
            {connectionStatus === 'connected' ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : connectionStatus === 'error' ? (
              <WifiOff className="w-5 h-5 text-red-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500 animate-pulse" />
            )}
            <div>
              <p className="font-medium text-gray-900">Real-time Status</p>
              <p className="text-sm text-gray-600">{realTimeStatus}</p>
              <p className="text-xs text-gray-500">Last checked: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className={`rounded-xl border-2 p-6 mb-6 ${getStatusColor()}`}>
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Connection Status: {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
              </h2>
              {connectionStatus === 'testing' && (
                <p className="text-gray-600">Testing database connection... (Auto-refreshing every 10s)</p>
              )}
              {connectionStatus === 'connected' && (
                <p className="text-green-700">✅ Successfully connected to Supabase database! All systems operational.</p>
              )}
              {connectionStatus === 'error' && (
                <div>
                  <p className="text-red-700">❌ Failed to connect to database</p>
                  <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Environment Variables Check */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Environment Configuration</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Supabase URL:</span>
              <span className={`text-sm px-2 py-1 rounded ${
                import.meta.env.VITE_SUPABASE_URL ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {import.meta.env.VITE_SUPABASE_URL ? 'Configured' : 'Missing'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Supabase Anon Key:</span>
              <span className={`text-sm px-2 py-1 rounded ${
                import.meta.env.VITE_SUPABASE_ANON_KEY ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configured' : 'Missing'}
              </span>
            </div>
          </div>
          
          {(!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Setup Required:</strong> Please update your .env file with your Supabase credentials and restart the development server.
              </p>
            </div>
          )}
        </div>

        {/* Detailed Test Results */}
        {detailedResults.basicTests && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Connection Tests 
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Last run: {detailedResults.basicTests[0]?.timestamp})
              </span>
            </h3>
            <div className="space-y-3">
              {detailedResults.basicTests.map((test: any, index: number) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    test.status === 'success' 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon2(test.status)}
                    <span className="font-medium text-gray-900">{test.name}</span>
                    <span className="text-xs text-gray-500">({test.timestamp})</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {typeof test.details === 'object' ? JSON.stringify(test.details, null, 2) : test.details}
                  </p>
                  {test.error && (
                    <p className="text-xs text-red-600 mt-1 font-mono">{test.error}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table Status */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Database Tables Status
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({testResults.length} tables checked)
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testResults.map((result) => (
                <div
                  key={result.table}
                  className={`p-4 rounded-lg border ${
                    result.status === 'success' 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {getStatusIcon2(result.status)}
                    <span className="font-medium text-gray-900">{result.table}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{result.timestamp}</p>
                  {result.error && (
                    <p className="text-xs text-red-600 mt-1 font-mono">{result.error}</p>
                  )}
                  {result.details && (
                    <p className="text-xs text-gray-600 mt-1">{result.details}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Retry Button */}
        <div className="mt-6 text-center">
          <button
            onClick={testDatabaseConnection}
            disabled={connectionStatus === 'testing'}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${connectionStatus === 'testing' ? 'animate-spin' : ''}`} />
            {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection Again'}
          </button>
          <p className="text-xs text-gray-500 mt-2">Auto-refreshes every 10 seconds</p>
        </div>
      </div>
    </div>
  );
}