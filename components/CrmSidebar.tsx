import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { 
  Home, 
  Users, 
  Target, 
  Building, 
  BarChart3, 
  MessageSquare,
  Settings,
  UserCog,
  Menu,
  Bell,
  LogOut,
  Calendar
} from 'lucide-react';
import { useCrm } from './CrmContext';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  userRole: string;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['Admin', 'Project Manager', 'Sales Executive', 'Telecaller'] },
  { id: 'leads', label: 'Leads', icon: Users, roles: ['Admin', 'Project Manager', 'Telecaller'] },
  { id: 'opportunities', label: 'Opportunities', icon: Target, roles: ['Admin', 'Project Manager', 'Sales Executive'] },
  { id: 'site-visits', label: 'Site Visits', icon: Calendar, roles: ['Admin', 'Project Manager', 'Sales Executive', 'Telecaller'] },
  { id: 'projects', label: 'Projects', icon: Building, roles: ['Admin', 'Project Manager'] },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, roles: ['Admin', 'Project Manager', 'Sales Executive', 'Telecaller'] },
  { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['Admin', 'Project Manager'] },
  { id: 'users', label: 'Users', icon: UserCog, roles: ['Admin'] },
];

function SidebarContent({ currentView, onViewChange, userRole, onClose }: SidebarProps & { onClose?: () => void }) {
  const { user, filteredLeads, filteredOpportunities, filteredSiteVisits } = useCrm();
  
  const accessibleItems = menuItems.filter(item => item.roles.includes(userRole));
  
  // Calculate notification counts
  const pendingFollowUps = filteredLeads.filter(lead => 
    lead.nextFollowUp && new Date(lead.nextFollowUp) <= new Date()
  ).length;
  
  const upcomingVisits = filteredOpportunities.filter(opp => 
    opp.visitDate && new Date(opp.visitDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
  ).length;

  const todaysVisits = filteredSiteVisits.filter(visit => {
    const visitDate = new Date(visit.visitDate);
    const today = new Date();
    return visitDate.toDateString() === today.toDateString() && visit.status === 'Scheduled';
  }).length;

  const handleNavigation = (viewId: string) => {
    onViewChange(viewId);
    onClose?.(); // Close mobile sheet when navigating
  };

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Building className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          <h1 className="text-xl font-medium text-sidebar-foreground">Signature Properties</h1>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-sidebar-accent-foreground">
              {user.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/60">{user.role}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Bell className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {accessibleItems.map(item => {
          const IconComponent = item.icon;
          const isActive = currentView === item.id;
          
          // Add notification badges
          let notificationCount = 0;
          if (item.id === 'leads') notificationCount = pendingFollowUps;
          if (item.id === 'opportunities') notificationCount = upcomingVisits;
          if (item.id === 'site-visits') notificationCount = todaysVisits;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start gap-3 h-10 transition-all ${
                isActive 
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' 
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
              onClick={() => handleNavigation(item.id)}
            >
              <IconComponent className="w-4 h-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {notificationCount > 0 && (
                <Badge 
                  variant={isActive ? "secondary" : "default"} 
                  className="h-5 px-1.5 text-xs min-w-[20px] justify-center"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}

export function Sidebar(props: SidebarProps) {
  const { isMobile } = useCrm();

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="fixed top-4 left-4 z-50 md:hidden bg-background shadow-lg"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-80">
          <SidebarContent 
            {...props} 
            onClose={() => {
              // The sheet will handle closing
            }} 
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="w-64 flex-shrink-0">
      <SidebarContent {...props} />
    </div>
  );
}