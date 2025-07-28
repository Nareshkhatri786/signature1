import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, AlertCircle, Loader2, Database, Shield, User, Settings } from 'lucide-react';

interface InstallationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface InstallationData {
  database: {
    host: string;
    port: string;
    name: string;
    username: string;
    password: string;
  };
  application: {
    jwtSecret: string;
    corsOrigin: string;
  };
  admin: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
}

export default function InstallationWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'testing' | 'success' | 'error'>('none');

  const [installationData, setInstallationData] = useState<InstallationData>({
    database: {
      host: 'postgres',
      port: '5432',
      name: 'signature_crm',
      username: 'crm_user',
      password: ''
    },
    application: {
      jwtSecret: '',
      corsOrigin: typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
    },
    admin: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const steps: InstallationStep[] = [
    {
      id: 'database',
      title: 'Database Configuration',
      description: 'Configure your PostgreSQL database connection',
      icon: <Database className="h-5 w-5" />,
      completed: false
    },
    {
      id: 'application',
      title: 'Application Settings',
      description: 'Set up security and application configuration',
      icon: <Settings className="h-5 w-5" />,
      completed: false
    },
    {
      id: 'admin',
      title: 'Admin User',
      description: 'Create the administrator account',
      icon: <User className="h-5 w-5" />,
      completed: false
    },
    {
      id: 'install',
      title: 'Installation',
      description: 'Complete the setup process',
      icon: <Shield className="h-5 w-5" />,
      completed: false
    }
  ];

  const generateJWTSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let secret = '';
    for (let i = 0; i < 64; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setInstallationData(prev => ({
      ...prev,
      application: { ...prev.application, jwtSecret: secret }
    }));
  };

  const testDatabaseConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus('testing');
    
    try {
      const response = await fetch('/api/install/test-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(installationData.database)
      });

      if (response.ok) {
        setConnectionStatus('success');
        setError('');
      } else {
        const error = await response.json();
        setConnectionStatus('error');
        setError(error.message || 'Database connection failed');
      }
    } catch (error) {
      setConnectionStatus('error');
      setError('Unable to connect to database. Please check your configuration.');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setError('');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const handleInstall = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Validate admin password match
      if (installationData.admin.password !== installationData.admin.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Validate required fields
      if (!installationData.admin.name || !installationData.admin.email || !installationData.admin.password) {
        throw new Error('All admin fields are required');
      }

      if (!installationData.database.password) {
        throw new Error('Database password is required');
      }

      if (!installationData.application.jwtSecret) {
        throw new Error('JWT secret is required');
      }

      // Perform installation
      const response = await fetch('/api/install/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(installationData)
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess('Installation completed successfully!');
        
        // Redirect to login page after success
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Installation failed');
      }
    } catch (error) {
      setError(error.message || 'Installation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateDatabaseField = (field: keyof InstallationData['database'], value: string) => {
    setInstallationData(prev => ({
      ...prev,
      database: { ...prev.database, [field]: value }
    }));
    setConnectionStatus('none');
  };

  const updateApplicationField = (field: keyof InstallationData['application'], value: string) => {
    setInstallationData(prev => ({
      ...prev,
      application: { ...prev.application, [field]: value }
    }));
  };

  const updateAdminField = (field: keyof InstallationData['admin'], value: string) => {
    setInstallationData(prev => ({
      ...prev,
      admin: { ...prev.admin, [field]: value }
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Database Configuration
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="db-host">Database Host</Label>
                <Input
                  id="db-host"
                  value={installationData.database.host}
                  onChange={(e) => updateDatabaseField('host', e.target.value)}
                  placeholder="postgres"
                />
              </div>
              <div>
                <Label htmlFor="db-port">Port</Label>
                <Input
                  id="db-port"
                  value={installationData.database.port}
                  onChange={(e) => updateDatabaseField('port', e.target.value)}
                  placeholder="5432"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="db-name">Database Name</Label>
              <Input
                id="db-name"
                value={installationData.database.name}
                onChange={(e) => updateDatabaseField('name', e.target.value)}
                placeholder="signature_crm"
              />
            </div>
            <div>
              <Label htmlFor="db-username">Database Username</Label>
              <Input
                id="db-username"
                value={installationData.database.username}
                onChange={(e) => updateDatabaseField('username', e.target.value)}
                placeholder="crm_user"
              />
            </div>
            <div>
              <Label htmlFor="db-password">Database Password</Label>
              <Input
                id="db-password"
                type="password"
                value={installationData.database.password}
                onChange={(e) => updateDatabaseField('password', e.target.value)}
                placeholder="Enter database password"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={testDatabaseConnection}
                disabled={testingConnection || !installationData.database.password}
              >
                {testingConnection ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>
              
              {connectionStatus === 'success' && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Connected
                </div>
              )}
              
              {connectionStatus === 'error' && (
                <div className="flex items-center text-red-600">
                  <AlertCircle className="mr-1 h-4 w-4" />
                  Failed
                </div>
              )}
            </div>
          </div>
        );

      case 1: // Application Settings
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="jwt-secret">JWT Secret</Label>
              <div className="flex space-x-2">
                <Input
                  id="jwt-secret"
                  value={installationData.application.jwtSecret}
                  onChange={(e) => updateApplicationField('jwtSecret', e.target.value)}
                  placeholder="Enter JWT secret or generate one"
                />
                <Button variant="outline" onClick={generateJWTSecret}>
                  Generate
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                This will be used to sign authentication tokens. Keep it secure!
              </p>
            </div>
            
            <div>
              <Label htmlFor="cors-origin">CORS Origin</Label>
              <Input
                id="cors-origin"
                value={installationData.application.corsOrigin}
                onChange={(e) => updateApplicationField('corsOrigin', e.target.value)}
                placeholder="http://localhost:3000"
              />
              <p className="text-sm text-gray-600 mt-1">
                The URL where your CRM will be accessed from
              </p>
            </div>
          </div>
        );

      case 2: // Admin User
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-name">Full Name</Label>
              <Input
                id="admin-name"
                value={installationData.admin.name}
                onChange={(e) => updateAdminField('name', e.target.value)}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="admin-email">Email Address</Label>
              <Input
                id="admin-email"
                type="email"
                value={installationData.admin.email}
                onChange={(e) => updateAdminField('email', e.target.value)}
                placeholder="admin@signatureproperties.com"
              />
            </div>
            <div>
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={installationData.admin.password}
                onChange={(e) => updateAdminField('password', e.target.value)}
                placeholder="Enter password"
              />
            </div>
            <div>
              <Label htmlFor="admin-confirm-password">Confirm Password</Label>
              <Input
                id="admin-confirm-password"
                type="password"
                value={installationData.admin.confirmPassword}
                onChange={(e) => updateAdminField('confirmPassword', e.target.value)}
                placeholder="Confirm password"
              />
            </div>
          </div>
        );

      case 3: // Installation Summary
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Installation Summary</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>Database:</strong> {installationData.database.name} on {installationData.database.host}:{installationData.database.port}</p>
                <p><strong>Admin User:</strong> {installationData.admin.name} ({installationData.admin.email})</p>
                <p><strong>CORS Origin:</strong> {installationData.application.corsOrigin}</p>
              </div>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will create the database tables, configure the application, and set up your admin account. 
                Make sure all information is correct before proceeding.
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <div className="p-6">
          <div className="text-center mb-8">
            <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Signature Properties CRM</h1>
            <p className="text-gray-600 mt-2">Installation Wizard</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full border-2 
                    ${index <= currentStep 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'border-gray-300 text-gray-400'
                    }
                  `}>
                    {index < currentStep ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      w-16 h-0.5 ml-2
                      ${index < currentStep ? 'bg-blue-600' : 'bg-gray-300'}
                    `} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                {steps[currentStep].title}
              </h2>
              <p className="text-sm text-gray-600">
                {steps[currentStep].description}
              </p>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4" variant="default">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Step Content */}
          <div className="mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={currentStep === 0 || isLoading}
            >
              Back
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button 
                onClick={handleNext}
                disabled={
                  (currentStep === 0 && connectionStatus !== 'success') ||
                  (currentStep === 1 && !installationData.application.jwtSecret) ||
                  (currentStep === 2 && (!installationData.admin.name || !installationData.admin.email || !installationData.admin.password || installationData.admin.password !== installationData.admin.confirmPassword))
                }
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleInstall}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Installing...
                  </>
                ) : (
                  'Install CRM'
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}