import React, { useState } from 'react';
import { Menu, X, ChevronDown, User, Settings, LogOut, Bell, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface CrmHeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
  user: any;
  onLogout: () => void;
}

export default function CrmHeader({ currentView, onViewChange, user, onLogout }: CrmHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      items: [
        { id: 'dashboard', label: 'Overview' }
      ]
    },
    {
      id: 'sales',
      label: 'Sales',
      items: [
        { id: 'leads', label: 'Leads' },
        { id: 'opportunities', label: 'Opportunities' },
        { id: 'site-visits', label: 'Site Visits' }
      ]
    },
    {
      id: 'crm',
      label: 'CRM',
      items: [
        { id: 'leads-insights', label: 'Leads Insights' },
        { id: 'whatsapp', label: 'WhatsApp' }
      ]
    },
    {
      id: 'reporting',
      label: 'Reporting',
      items: [
        { id: 'reports', label: 'Team Insights' }
      ]
    },
    {
      id: 'admin',
      label: 'Admin',
      items: [
        { id: 'users', label: 'Users' },
        { id: 'settings', label: 'Settings' }
      ]
    }
  ];

  const handleNavClick = (itemId: string) => {
    // Map certain items to their actual views
    const viewMapping: { [key: string]: string } = {
      'leads-insights': 'leads',
      'team-insights': 'reports'
    };
    
    const targetView = viewMapping[itemId] || itemId;
    onViewChange(targetView);
    setIsMobileMenuOpen(false);
  };

  const getCurrentPageTitle = () => {
    for (const section of navigationItems) {
      for (const item of section.items) {
        if (item.id === currentView || 
            (item.id === 'leads-insights' && currentView === 'leads') ||
            (item.id === 'team-insights' && currentView === 'reports')) {
          return item.label;
        }
      }
    }
    return 'Dashboard';
  };

  return (
    <header className="crm-header border-b">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Company Name */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-white rounded flex items-center justify-center mr-3">
                <span className="text-blue-600 font-bold text-lg">S</span>
              </div>
              <div className="hidden lg:block">
                <h1 className="text-xl font-semibold text-white">Signature Properties</h1>
                <p className="text-white/80 text-sm">Pre-Sales CRM</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-1">
            {navigationItems.map((section) => (
              <DropdownMenu key={section.id}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={`crm-nav-item ${section.items.some(item => 
                      item.id === currentView || 
                      (item.id === 'leads-insights' && currentView === 'leads') ||
                      (item.id === 'team-insights' && currentView === 'reports')
                    ) ? 'active' : ''}`}
                  >
                    {section.label}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="crm-dropdown">
                  {section.items.map((item) => (
                    <DropdownMenuItem 
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`cursor-pointer ${
                        item.id === currentView || 
                        (item.id === 'leads-insights' && currentView === 'leads') ||
                        (item.id === 'team-insights' && currentView === 'reports')
                          ? 'bg-accent text-accent-foreground' 
                          : ''
                      }`}
                    >
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input
                placeholder="Search..."
                className="pl-10 w-64 bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-white/10 flex items-center space-x-2">
                  <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden md:inline">{user?.name || 'User'}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="font-medium">{user?.name || 'User'}</p>
                  <p className="text-sm text-muted-foreground">{user?.email || 'user@example.com'}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNavClick('settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="crm-mobile-menu absolute left-0 right-0 top-16 bg-white border-r shadow-xl z-50 max-h-screen overflow-y-auto">
              <div className="px-4 py-6 space-y-6">
                {navigationItems.map((section) => (
                  <div key={section.id}>
                    <h3 className="font-medium text-foreground mb-3">{section.label}</h3>
                    <div className="space-y-2 ml-4">
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            item.id === currentView || 
                            (item.id === 'leads-insights' && currentView === 'leads') ||
                            (item.id === 'team-insights' && currentView === 'reports')
                              ? 'bg-primary text-primary-foreground' 
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t">
                  <button
                    onClick={() => handleNavClick('settings')}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={onLogout}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Page Title */}
      <div className="lg:hidden bg-white border-b px-4 py-3">
        <h2 className="text-lg font-semibold text-foreground">{getCurrentPageTitle()}</h2>
      </div>
    </header>
  );
}