import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useCrm } from './CrmContext';
import { format, isToday, isTomorrow, addDays, startOfWeek } from 'date-fns';
import { 
  Search, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  MessageSquare,
  CheckCircle,
  XCircle,
  RotateCcw,
  AlertCircle,
  Eye,
  Edit,
  Bell,
  Users,
  FileText,
  UserCheck,
  Timer
} from 'lucide-react';

interface SiteVisitsModuleProps {
  user: any;
}

export function SiteVisitsModule({ user }: SiteVisitsModuleProps) {
  const { 
    filteredSiteVisits,
    selectedProject,
    setSelectedProject,
    projects,
    setShowScheduleVisitModal,
    isMobile
  } = useCrm();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('today');

  // Safe property access helper
  const safeGet = (obj: any, path: string[], fallback: any = '') => {
    try {
      return path.reduce((current, key) => current?.[key], obj) ?? fallback;
    } catch {
      return fallback;
    }
  };

  // Safe date parsing helper
  const safeParseDate = (dateStr: string | Date) => {
    try {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  // Safe date formatting helper
  const safeDateFormat = (dateStr: string | Date, formatStr: string = 'MMM dd, yyyy') => {
    try {
      const date = safeParseDate(dateStr);
      return date ? format(date, formatStr) : 'Invalid Date';
    } catch {
      return 'Invalid Date';
    }
  };

  // Enhanced filtering with safe date handling
  const getFilteredVisits = (filterType: string) => {
    if (!Array.isArray(filteredSiteVisits)) return [];
    
    let filtered = filteredSiteVisits;
    const today = new Date();

    switch (filterType) {
      case 'today':
        return filtered.filter(visit => {
          const visitDate = safeParseDate(safeGet(visit, ['visitDate']) || safeGet(visit, ['visit_date']));
          return visitDate && isToday(visitDate);
        });
      
      case 'tomorrow':
        return filtered.filter(visit => {
          const visitDate = safeParseDate(safeGet(visit, ['visitDate']) || safeGet(visit, ['visit_date']));
          return visitDate && isTomorrow(visitDate);
        });
      
      case 'weekend':
        return filtered.filter(visit => {
          const visitDate = safeParseDate(safeGet(visit, ['visitDate']) || safeGet(visit, ['visit_date']));
          if (!visitDate) return false;
          
          try {
            const saturday = addDays(startOfWeek(today, { weekStartsOn: 1 }), 5);
            const sunday = addDays(startOfWeek(today, { weekStartsOn: 1 }), 6);
            return (
              format(visitDate, 'yyyy-MM-dd') === format(saturday, 'yyyy-MM-dd') ||
              format(visitDate, 'yyyy-MM-dd') === format(sunday, 'yyyy-MM-dd')
            ) && visit.status === 'Scheduled';
          } catch {
            return false;
          }
        });
      
      case 'week':
        const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });
        const thisWeekEnd = addDays(thisWeekStart, 4);
        return filtered.filter(visit => {
          const visitDate = safeParseDate(safeGet(visit, ['visitDate']) || safeGet(visit, ['visit_date']));
          return visitDate && visitDate >= thisWeekStart && visitDate <= thisWeekEnd && visit.status === 'Scheduled';
        });
      
      case 'missed':
        return filtered.filter(visit => visit.status === 'Missed');
      
      case 'completed':
        return filtered.filter(visit => visit.status === 'Completed');
      
      case 'followups':
        return filtered.filter(visit => {
          const visitDate = safeParseDate(safeGet(visit, ['visitDate']) || safeGet(visit, ['visit_date']));
          return visitDate && visitDate < today && visit.status === 'Scheduled';
        });
      
      case 'rescheduled':
        return filtered.filter(visit => visit.status === 'Rescheduled');
      
      default:
        return filtered;
    }
  };

  // Apply additional filters with safe property access
  const filteredAndSearchedVisits = useMemo(() => {
    let filtered = getFilteredVisits(activeTab);

    // Search filter
    if (searchTerm && Array.isArray(filtered)) {
      filtered = filtered.filter(visit => {
        const leadName = safeGet(visit, ['leadName']) || safeGet(visit, ['lead_name'], '');
        const phone = safeGet(visit, ['phone']) || safeGet(visit, ['lead_phone'], '');
        const projectName = safeGet(visit, ['projectName']) || safeGet(visit, ['project_name'], '');
        const assignedToName = safeGet(visit, ['assignedToName']) || safeGet(visit, ['assigned_to_name'], '');
        
        return (
          leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          phone.includes(searchTerm) ||
          projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignedToName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Status filter
    if (statusFilter !== 'all' && Array.isArray(filtered)) {
      filtered = filtered.filter(visit => visit.status === statusFilter);
    }

    // User filter
    if (userFilter !== 'all' && Array.isArray(filtered)) {
      filtered = filtered.filter(visit => {
        const assignedTo = safeGet(visit, ['assignedTo']) || safeGet(visit, ['assigned_to']);
        return assignedTo && assignedTo.toString() === userFilter;
      });
    }

    // Type filter
    if (typeFilter !== 'all' && Array.isArray(filtered)) {
      filtered = filtered.filter(visit => visit.type === typeFilter);
    }

    // Role-based filtering
    if (user && Array.isArray(filtered)) {
      if (user.role === 'Sales Executive' || user.role === 'Telecaller') {
        filtered = filtered.filter(visit => {
          const assignedTo = safeGet(visit, ['assignedTo']) || safeGet(visit, ['assigned_to']);
          return assignedTo && assignedTo.toString() === user.id.toString();
        });
      } else if (user.role === 'Project Manager' && user.projectIds) {
        filtered = filtered.filter(visit => {
          const projectId = safeGet(visit, ['projectId']) || safeGet(visit, ['project_id']);
          return projectId && user.projectIds.includes(projectId);
        });
      }
    }

    return filtered || [];
  }, [filteredSiteVisits, activeTab, searchTerm, statusFilter, userFilter, typeFilter, user]);

  // Get comprehensive visit stats
  const visitStats = useMemo(() => {
    if (!Array.isArray(filteredSiteVisits)) {
      return {
        totalScheduled: 0,
        completed: 0,
        missed: 0,
        rescheduled: 0,
        today: 0,
        weekend: 0,
        followupsPending: 0
      };
    }

    return {
      totalScheduled: filteredSiteVisits.filter(v => v.status === 'Scheduled').length,
      completed: filteredSiteVisits.filter(v => v.status === 'Completed').length,
      missed: filteredSiteVisits.filter(v => v.status === 'Missed').length,
      rescheduled: filteredSiteVisits.filter(v => v.status === 'Rescheduled').length,
      today: getFilteredVisits('today').length,
      weekend: getFilteredVisits('weekend').length,
      followupsPending: getFilteredVisits('followups').length
    };
  }, [filteredSiteVisits]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Missed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Rescheduled': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'First Visit': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Second Visit': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      case 'Final Visit': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'Follow-up': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Scheduled': return <Clock className="w-4 h-4" />;
      case 'Completed': return <CheckCircle className="w-4 h-4" />;
      case 'Missed': return <XCircle className="w-4 h-4" />;
      case 'Rescheduled': return <RotateCcw className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getRowBackgroundColor = (visit: any) => {
    try {
      const visitDate = safeParseDate(safeGet(visit, ['visitDate']) || safeGet(visit, ['visit_date']));
      if (!visitDate) return '';
      
      const today = new Date();
      
      if (visit.status === 'Missed') return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
      if (visit.status === 'Rescheduled') return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800';
      if (isToday(visitDate) && visit.status === 'Scheduled') return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
      if (visitDate < today && visit.status === 'Scheduled') return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
      return '';
    } catch {
      return '';
    }
  };

  // Get unique users for filter
  const users = useMemo(() => {
    if (!Array.isArray(filteredSiteVisits)) return [];
    
    const uniqueUsers = Array.from(
      new Set(filteredSiteVisits.map(v => {
        const assignedTo = safeGet(v, ['assignedTo']) || safeGet(v, ['assigned_to']);
        const assignedToName = safeGet(v, ['assignedToName']) || safeGet(v, ['assigned_to_name']);
        return `${assignedTo}:${assignedToName}`;
      }))
    ).map(userStr => {
      const [id, name] = userStr.split(':');
      return { id, name };
    }).filter(user => user.id && user.name && user.id !== 'undefined' && user.name !== 'undefined');
    
    return uniqueUsers;
  }, [filteredSiteVisits]);

  const handleViewVisit = (visit: any) => {
    if (window.showToast) {
      window.showToast(`Viewing details for ${safeGet(visit, ['leadName']) || safeGet(visit, ['lead_name'], 'Unknown')}`, 'info');
    }
  };

  const handleCompleteVisit = (visit: any) => {
    if (window.showToast) {
      window.showToast(`Visit marked as completed for ${safeGet(visit, ['leadName']) || safeGet(visit, ['lead_name'], 'Unknown')}`, 'success');
    }
  };

  const handleSendReminder = (visit: any) => {
    if (window.showToast) {
      window.showToast(`WhatsApp reminder sent to ${safeGet(visit, ['leadName']) || safeGet(visit, ['lead_name'], 'Unknown')}`, 'success');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to view site visits.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Site Visit Tracker</h1>
          <p className="text-muted-foreground">
            Schedule, track, and manage all site visits with comprehensive reporting
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowScheduleVisitModal && setShowScheduleVisitModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Schedule Visit
          </Button>
          {user.role === 'Admin' && (
            <Button variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('all')}>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{visitStats.totalScheduled}</p>
              <p className="text-sm text-muted-foreground">Scheduled</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('completed')}>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{visitStats.completed}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('missed')}>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{visitStats.missed}</p>
              <p className="text-sm text-muted-foreground">Missed</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('rescheduled')}>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{visitStats.rescheduled}</p>
              <p className="text-sm text-muted-foreground">Rescheduled</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('today')}>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{visitStats.today}</p>
              <p className="text-sm text-muted-foreground">Today</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('weekend')}>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{visitStats.weekend}</p>
              <p className="text-sm text-muted-foreground">Weekend</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('followups')}>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{visitStats.followupsPending}</p>
              <p className="text-sm text-muted-foreground">Follow-ups</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full ${isMobile ? 'grid-cols-4' : 'grid-cols-8'}`}>
              <TabsTrigger value="today" className="gap-1">
                <CalendarIcon className="w-3 h-3" />
                {!isMobile && 'Today'}
              </TabsTrigger>
              <TabsTrigger value="tomorrow" className="gap-1">
                <Timer className="w-3 h-3" />
                {!isMobile && 'Tomorrow'}
              </TabsTrigger>
              <TabsTrigger value="weekend" className="gap-1">
                <CalendarIcon className="w-3 h-3" />
                {!isMobile && 'Weekend'}
              </TabsTrigger>
              <TabsTrigger value="week" className="gap-1">
                <CalendarIcon className="w-3 h-3" />
                {!isMobile && 'Week'}
              </TabsTrigger>
              {!isMobile && (
                <>
                  <TabsTrigger value="missed" className="gap-1">
                    <XCircle className="w-3 h-3" />
                    Missed
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Completed
                  </TabsTrigger>
                  <TabsTrigger value="followups" className="gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Follow-ups
                  </TabsTrigger>
                  <TabsTrigger value="all" className="gap-1">
                    <Users className="w-3 h-3" />
                    All
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search visits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {(user.role === 'Admin' || user.role === 'Project Manager') && Array.isArray(projects) && (
              <Select value={selectedProject?.toString() || 'all'} onValueChange={(value) => 
                setSelectedProject && setSelectedProject(value === 'all' ? null : parseInt(value))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Missed">Missed</SelectItem>
                <SelectItem value="Rescheduled">Rescheduled</SelectItem>
              </SelectContent>
            </Select>

            {(user.role === 'Admin' || user.role === 'Project Manager') && (
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map(userItem => (
                    <SelectItem key={userItem.id} value={userItem.id}>
                      {userItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="First Visit">First Visit</SelectItem>
                <SelectItem value="Second Visit">Second Visit</SelectItem>
                <SelectItem value="Final Visit">Final Visit</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Visits Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              Site Visits ({filteredAndSearchedVisits.length})
              {activeTab !== 'all' && (
                <Badge variant="outline" className="ml-2 capitalize">
                  {activeTab}
                </Badge>
              )}
            </span>
            {user.role !== 'Telecaller' && (
              <div className="flex items-center gap-2 text-sm">
                <UserCheck className="w-4 h-4" />
                {user.role === 'Sales Executive' ? 'My Visits' : `${user.role} View`}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            /* Mobile Card View */
            <div className="space-y-4">
              {filteredAndSearchedVisits.map(visit => {
                const leadName = safeGet(visit, ['leadName']) || safeGet(visit, ['lead_name'], 'Unknown');
                const phone = safeGet(visit, ['phone']) || safeGet(visit, ['lead_phone'], '');
                const projectName = safeGet(visit, ['projectName']) || safeGet(visit, ['project_name'], '');
                const visitTime = safeGet(visit, ['visitTime'], '');
                const visitType = safeGet(visit, ['type'], 'Visit');
                
                return (
                  <Card key={visit.id} className={`p-4 transition-all hover:shadow-md ${getRowBackgroundColor(visit)}`}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {leadName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{leadName}</p>
                            <p className="text-sm text-muted-foreground">{phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(visit.status)}
                          <Badge className={getStatusColor(visit.status)}>
                            {visit.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarIcon className="w-3 h-3" />
                          <span>{safeDateFormat(safeGet(visit, ['visitDate']) || safeGet(visit, ['visit_date']))}</span>
                          <Clock className="w-3 h-3 ml-2" />
                          <span>{visitTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{projectName}</span>
                        </div>
                        <Badge className={getTypeColor(visitType)} variant="outline">
                          {visitType}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleViewVisit(visit)} title="View Details">
                          <Eye className="w-3 h-3" />
                        </Button>

                        {visit.status === 'Scheduled' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleCompleteVisit(visit)} title="Mark Complete">
                              <CheckCircle className="w-3 h-3" />
                            </Button>

                            <Button size="sm" variant="outline" onClick={() => handleSendReminder(visit)} title="WhatsApp Reminder">
                              <MessageSquare className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Desktop Table View */
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Visit Details</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSearchedVisits.map(visit => {
                  const leadName = safeGet(visit, ['leadName']) || safeGet(visit, ['lead_name'], 'Unknown');
                  const phone = safeGet(visit, ['phone']) || safeGet(visit, ['lead_phone'], '');
                  const projectName = safeGet(visit, ['projectName']) || safeGet(visit, ['project_name'], '');
                  const assignedToName = safeGet(visit, ['assignedToName']) || safeGet(visit, ['assigned_to_name'], '');
                  const visitTime = safeGet(visit, ['visitTime'], '');
                  const visitType = safeGet(visit, ['type'], 'Visit');
                  
                  return (
                    <TableRow 
                      key={visit.id} 
                      className={`transition-all hover:bg-accent/50 ${getRowBackgroundColor(visit)}`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {leadName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{leadName}</p>
                            <p className="text-sm text-muted-foreground">{phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          {projectName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-3 h-3" />
                            <span className="text-sm">{safeDateFormat(safeGet(visit, ['visitDate']) || safeGet(visit, ['visit_date']))}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            <span className="text-sm">{visitTime}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(visitType)} variant="outline">
                          {visitType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(visit.status)}
                          <Badge className={getStatusColor(visit.status)}>
                            {visit.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3" />
                          <span className="text-sm">{assignedToName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleViewVisit(visit)} title="View">
                            <Eye className="w-3 h-3" />
                          </Button>

                          {visit.status === 'Scheduled' && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => handleCompleteVisit(visit)} title="Complete">
                                <CheckCircle className="w-3 h-3" />
                              </Button>

                              <Button size="sm" variant="ghost" onClick={() => handleSendReminder(visit)} title="Notify">
                                <Bell className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {filteredAndSearchedVisits.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="w-8 h-8 mx-auto mb-2" />
              <p>No visits found for the selected criteria.</p>
              <Button 
                className="mt-4" 
                onClick={() => setShowScheduleVisitModal && setShowScheduleVisitModal(true)}
              >
                Schedule Your First Visit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}