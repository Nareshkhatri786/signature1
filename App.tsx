import React, { useState, useEffect } from 'react';
import { CrmProvider } from './components/CrmContext';
import CrmHeader from './components/CrmHeader';
import { Dashboard } from './components/Dashboard';
import { LeadsModule } from './components/LeadsModule';
import { OpportunitiesModule } from './components/OpportunitiesModule';
import { SiteVisitsModule } from './components/SiteVisitsModule';
import { WhatsAppModule } from './components/WhatsAppModule';
import { ReportsModule } from './components/ReportsModule';
import { UsersModule } from './components/UsersModule';
import SettingsModule from './components/SettingsModule';
import { AddLeadModal } from './components/AddLeadModal';
import { AddOpportunityModal } from './components/AddOpportunityModal';
import { ScheduleVisitModal } from './components/ScheduleVisitModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import InstallationWizard from './components/InstallationWizard';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installationStatus, setInstallationStatus] = useState<'checking' | 'installed' | 'not-installed'>('checking');

  useEffect(() => {
    checkInstallationStatus();
  }, []);

  const checkInstallationStatus = async () => {
    try {
      const response = await fetch('/api/install/status');
      
      if (response.ok) {
        const data = await response.json();
        setIsInstalled(data.installed);
        setInstallationStatus(data.installed ? 'installed' : 'not-installed');
        
        if (data.installed) {
          checkAuth();
        } else {
          setIsLoading(false);
        }
      } else {
        // If the status endpoint doesn't exist, assume installation is needed
        setInstallationStatus('not-installed');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Installation status check failed:', error);
      // Default to checking auth if status endpoint fails
      setInstallationStatus('installed');
      setIsInstalled(true);
      checkAuth();
    }
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('crm_token');
      if (token) {
        // Try to verify token with backend
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // Token invalid, try demo credentials
          const userData = {
            id: '1',
            name: 'Admin User',
            email: 'admin@signatureproperties.com',
            role: 'Admin',
            projectIds: [1, 2, 3]
          };
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      setIsLoading(true);
      
      // Try backend authentication first
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('crm_token', data.token);
        setUser(data.user);
        setCurrentView('dashboard');
        showToast('Login successful! Welcome to Signature Properties CRM', 'success');
        return;
      }

      // Fallback to demo credentials
      const validCredentials = [
        { email: 'admin@signatureproperties.com', password: 'admin123', role: 'Admin' },
        { email: 'admin', password: 'admin', role: 'Admin' },
        { email: 'demo@signatureproperties.com', password: 'demo123', role: 'Admin' },
        { email: 'manager@signatureproperties.com', password: 'manager123', role: 'Project Manager' },
        { email: 'sales@signatureproperties.com', password: 'sales123', role: 'Sales Executive' }
      ];

      const isValid = validCredentials.some(
        cred => cred.email === credentials.email && cred.password === credentials.password
      );

      if (!isValid) {
        throw new Error('Invalid credentials');
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get user role from credentials
      const userCred = validCredentials.find(
        cred => cred.email === credentials.email && cred.password === credentials.password
      );
      
      const mockUser = {
        id: '1',
        name: userCred.role === 'Admin' ? 'Admin User' : 
              userCred.role === 'Project Manager' ? 'Project Manager' : 
              userCred.role === 'Sales Executive' ? 'Sales Executive' : 'Demo User',
        email: credentials.email,
        role: userCred.role,
        projectIds: [1, 2, 3]
      };
      
      localStorage.setItem('crm_token', 'dev-token-' + Date.now());
      setUser(mockUser);
      setCurrentView('dashboard');
      
      // Show success toast
      showToast('Login successful! Welcome to Signature Properties CRM', 'success');
      
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('crm_token');
    setUser(null);
    setCurrentView('dashboard');
    showToast('Logged out successfully', 'info');
  };

  // Show installation wizard if not installed
  if (installationStatus === 'not-installed') {
    return <InstallationWizard />;
  }

  // Show loading during installation status check
  if (installationStatus === 'checking') {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking installation status...</p>
        </div>
      </div>
    );
  }

  // Show loading during auth check
  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CRM...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user) {
    return <LoginForm onLogin={handleLogin} isLoading={isLoading} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'leads':
        return <LeadsModule user={user} />;
      case 'opportunities':
        return <OpportunitiesModule user={user} />;
      case 'site-visits':
        return <SiteVisitsModule user={user} />;
      case 'whatsapp':
        return <WhatsAppModule user={user} />;
      case 'reports':
        return <ReportsModule user={user} />;
      case 'users':
        return <UsersModule user={user} />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <CrmProvider>
      <div className="flex flex-col h-screen bg-background">
        <CrmHeader 
          currentView={currentView} 
          onViewChange={setCurrentView}
          user={user}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
        
        {/* Modal Components */}
        <AddLeadModal user={user} />
        <AddOpportunityModal user={user} />
        <ScheduleVisitModal user={user} />
        <WhatsAppModal user={user} />
        
        <SimpleToaster />
      </div>
    </CrmProvider>
  );
}

function LoginForm({ onLogin, isLoading }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!credentials.email || !credentials.password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      await onLogin(credentials);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setCredentials({ email: demoEmail, password: demoPassword });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
          <p className="mt-2 text-gray-600">Welcome to Signature Properties CRM</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
          
          <div className="text-center">
            <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-md border border-blue-200">
              <p className="font-medium text-blue-800 mb-3">Demo Credentials</p>
              <div className="space-y-2">
                <div className="bg-white p-2 rounded border">
                  <p className="font-medium text-blue-700">Quick Login:</p>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('admin', 'admin')}
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    admin / admin
                  </button>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• admin@signatureproperties.com / admin123</p>
                  <p>• manager@signatureproperties.com / manager123</p>
                  <p>• sales@signatureproperties.com / sales123</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Simple toast component to replace complex sonner
function SimpleToaster() {
  return (
    <div id="toast-container" className="fixed top-4 right-4 z-50 space-y-2">
      {/* Toasts will be dynamically added here */}
    </div>
  );
}

// Export a simple toast function for components to use
export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `
    px-4 py-2 rounded-md shadow-lg text-white transform transition-all duration-300 translate-x-full
    ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : type === 'info' ? 'bg-blue-500' : 'bg-gray-500'}
  `;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-x-full');
  }, 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('translate-x-full');
    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// Make toast available globally
window.showToast = showToast;