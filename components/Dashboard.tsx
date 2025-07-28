import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer 
} from 'recharts';
import { 
  Users, 
  Target, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Filter,
  Eye,
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useCrm } from './CrmContext';
import { format } from 'date-fns';

interface DashboardProps {
  user: any;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

export function Dashboard({ user }: DashboardProps) {
  const { 
    dateFilter, 
    setDateFilter, 
    selectedProject, 
    setSelectedProject, 
    filteredLeads, 
    filteredOpportunities,
    filteredSiteVisits, 
    projects,
    setCurrentView,
    setSelectedLead,
    setSelectedOpportunity,
    setShowAddLeadModal,
    setShowScheduleVisitModal,
    setShowWhatsAppModal,
    isMobile
  } = useCrm();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDrillDown, setShowDrillDown] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Calculate KPIs based on filtered data
  const totalLeads = filteredLeads.length;
  const qualifiedLeads = filteredLeads.filter(lead => lead.status === 'Qualified').length;
  const totalOpportunities = filteredOpportunities.length;
  const activeOpportunities = filteredOpportunities.filter(opp => 
    !['Booking', 'Lost'].includes(opp.stage)
  ).length;
  
  const totalValue = filteredOpportunities.reduce((sum, opp) => sum + opp.value, 0);
  const negotiationValue = filteredOpportunities
    .filter(opp => opp.stage === 'Negotiation')
    .reduce((sum, opp) => sum + opp.value, 0);
  const bookingValue = filteredOpportunities
    .filter(opp => opp.stage === 'Booking')
    .reduce((sum, opp) => sum + opp.value, 0);

  const pendingFollowUps = filteredLeads.filter(lead => 
    lead.nextFollowUp && new Date(lead.nextFollowUp) <= new Date()
  );
  
  const overdueFollowUps = filteredLeads.filter(lead => 
    lead.nextFollowUp && new Date(lead.nextFollowUp) < new Date()
  );

  const upcomingVisits = filteredOpportunities.filter(opp => 
    opp.visitDate && new Date(opp.visitDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  // Site visit metrics
  const todaysVisits = filteredSiteVisits.filter(visit => {
    const visitDate = new Date(visit.visitDate);
    const today = new Date();
    return visitDate.toDateString() === today.toDateString() && visit.status === 'Scheduled';
  });

  const tomorrowsVisits = filteredSiteVisits.filter(visit => {
    const visitDate = new Date(visit.visitDate);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return visitDate.toDateString() === tomorrow.toDateString() && visit.status === 'Scheduled';
  });

  const missedVisits = filteredSiteVisits.filter(visit => visit.status === 'Missed');
  const completedVisits = filteredSiteVisits.filter(visit => visit.status === 'Completed');

  // Chart data
  const leadsBySource = Object.entries(
    filteredLeads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const opportunityByStage = Object.entries(
    filteredOpportunities.reduce((acc, opp) => {
      acc[opp.stage] = (acc[opp.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const weeklyTrend = [
    { name: 'Mon', leads: 12, opportunities: 3 },
    { name: 'Tue', leads: 19, opportunities: 5 },
    { name: 'Wed', leads: 15, opportunities: 2 },
    { name: 'Thu', leads: 22, opportunities: 7 },
    { name: 'Fri', leads: 18, opportunities: 4 },
    { name: 'Sat', leads: 8, opportunities: 1 },
    { name: 'Sun', leads: 5, opportunities: 1 }
  ];

  const handleDateFilterChange = (type: string) => {
    let label = '';
    let startDate, endDate;
    
    switch (type) {
      case 'today':
        label = 'Today';
        break;
      case 'week':
        label = 'This Week';
        break;
      case 'month':
        label = 'This Month';
        break;
      case 'custom':
        label = 'Custom Range';
        startDate = selectedDate;
        endDate = selectedDate;
        break;
    }
    
    setDateFilter({ 
      type: type as any, 
      label, 
      startDate, 
      endDate 
    });
  };

  const handleKPIClick = (type: string) => {
    setShowDrillDown(type);
  };

  const KPICard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    color = 'blue',
    onClick,
    clickable = false
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    trend?: { value: number; isPositive: boolean };
    color?: string;
    onClick?: () => void;
    clickable?: boolean;
  }) => (
    <Card 
      className={`transition-all duration-200 ${
        clickable 
          ? 'cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98]' 
          : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{trend.value}%</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
            <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const QuickActionButton = ({ 
    icon: Icon, 
    label, 
    onClick, 
    variant = 'default',
    size = 'default'
  }: {
    icon: any;
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
    size?: 'default' | 'sm' | 'lg';
  }) => (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className="gap-2 transition-all hover:scale-105 active:scale-95"
    >
      <Icon className="w-4 h-4" />
      {!isMobile && label}
    </Button>
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}. Here's your {user.role.toLowerCase()} overview.
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedProject?.toString() || 'all'} onValueChange={(value) => 
            setSelectedProject(value === 'all' ? null : parseInt(value))
          }>
            <SelectTrigger className="w-full sm:w-[180px]">
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

          <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="w-4 h-4" />
                {dateFilter.label}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-4 space-y-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => {
                    handleDateFilterChange('today');
                    setShowDatePicker(false);
                  }}
                >
                  Today
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => {
                    handleDateFilterChange('week');
                    setShowDatePicker(false);
                  }}
                >
                  This Week
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => {
                    handleDateFilterChange('month');
                    setShowDatePicker(false);
                  }}
                >
                  This Month
                </Button>
                <div className="border-t pt-2">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        handleDateFilterChange('custom');
                        setShowDatePicker(false);
                      }
                    }}
                    className="rounded-md"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <QuickActionButton
          icon={Plus}
          label="Add Lead"
          onClick={() => setShowAddLeadModal(true)}
        />
        <QuickActionButton
          icon={CalendarIcon}
          label="Schedule Visit"
          onClick={() => setShowScheduleVisitModal(true)}
          variant="outline"
        />
        <QuickActionButton
          icon={MessageSquare}
          label="WhatsApp"
          onClick={() => setShowWhatsAppModal(true)}
          variant="outline"
        />
        <QuickActionButton
          icon={Filter}
          label="Reports"
          onClick={() => setCurrentView('reports')}
          variant="secondary"
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPICard
          title="Total Leads"
          value={totalLeads}
          subtitle={`${qualifiedLeads} qualified`}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          color="blue"
          clickable
          onClick={() => handleKPIClick('leads')}
        />
        <KPICard
          title="Active Opportunities"
          value={activeOpportunities}
          subtitle={`${totalOpportunities} total`}
          icon={Target}
          trend={{ value: 8, isPositive: true }}
          color="green"
          clickable
          onClick={() => handleKPIClick('opportunities')}
        />
        <KPICard
          title="Today's Visits"
          value={todaysVisits.length}
          subtitle={`${tomorrowsVisits.length} tomorrow`}
          icon={CalendarIcon}
          color="purple"
          clickable
          onClick={() => setCurrentView('site-visits')}
        />
        <KPICard
          title="Pipeline Value"
          value={`₹${(totalValue / 10000000).toFixed(1)}Cr`}
          subtitle={`₹${(negotiationValue / 10000000).toFixed(1)}Cr in negotiation`}
          icon={TrendingUp}
          trend={{ value: 15, isPositive: true }}
          color="teal"
          clickable
          onClick={() => handleKPIClick('pipeline')}
        />
        <KPICard
          title="Follow-ups Due"
          value={pendingFollowUps.length}
          subtitle={`${overdueFollowUps.length} overdue`}
          icon={Clock}
          color={overdueFollowUps.length > 0 ? "red" : "orange"}
          clickable
          onClick={() => handleKPIClick('followups')}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="leads" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="opportunities" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leadsBySource}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {leadsBySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Follow-ups */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today's Follow-ups</CardTitle>
            <Badge variant={overdueFollowUps.length > 0 ? "destructive" : "secondary"}>
              {pendingFollowUps.length} pending
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingFollowUps.slice(0, 5).map(lead => (
              <div 
                key={lead.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedLead(lead);
                  setCurrentView('leads');
                }}
              >
                <div className={`w-2 h-2 rounded-full ${
                  lead.nextFollowUp && new Date(lead.nextFollowUp) < new Date() 
                    ? 'bg-red-500' 
                    : 'bg-yellow-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.projectName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Phone className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <MessageSquare className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            {pendingFollowUps.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                <p>All caught up! No pending follow-ups.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Visits */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Site Visits</CardTitle>
            <Badge variant="outline">{upcomingVisits.length} scheduled</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingVisits.slice(0, 5).map(opp => (
              <div 
                key={opp.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedOpportunity(opp);
                  setCurrentView('opportunities');
                }}
              >
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{opp.leadName}</p>
                  <p className="text-xs text-muted-foreground">{opp.projectName}</p>
                  <p className="text-xs text-muted-foreground">
                    {opp.visitDate && format(new Date(opp.visitDate), 'MMM dd, HH:mm')}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  ₹{(opp.value / 10000000).toFixed(1)}Cr
                </Badge>
              </div>
            ))}
            {upcomingVisits.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="w-8 h-8 mx-auto mb-2" />
                <p>No upcoming visits scheduled.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Drill-down Modal */}
      <Dialog open={!!showDrillDown} onOpenChange={() => setShowDrillDown(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {showDrillDown === 'leads' && 'Leads Details'}
              {showDrillDown === 'opportunities' && 'Opportunities Details'}
              {showDrillDown === 'pipeline' && 'Pipeline Analysis'}
              {showDrillDown === 'followups' && 'Follow-up Management'}
            </DialogTitle>
            <DialogDescription>
              {showDrillDown === 'leads' && 'Detailed breakdown of your leads data with analytics and insights.'}
              {showDrillDown === 'opportunities' && 'Comprehensive view of your opportunities pipeline and performance metrics.'}
              {showDrillDown === 'pipeline' && 'In-depth analysis of your sales pipeline value and conversion rates.'}
              {showDrillDown === 'followups' && 'Manage and track all your follow-up activities and schedules.'}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              {showDrillDown === 'leads' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{filteredLeads.filter(l => l.status === 'New').length}</p>
                        <p className="text-sm text-muted-foreground">New Leads</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">{filteredLeads.filter(l => l.status === 'Contacted').length}</p>
                        <p className="text-sm text-muted-foreground">Contacted</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{filteredLeads.filter(l => l.status === 'Qualified').length}</p>
                        <p className="text-sm text-muted-foreground">Qualified</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {showDrillDown === 'opportunities' && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={opportunityByStage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="w-8 h-8 mx-auto mb-2" />
                <p>Detailed view implementation would go here</p>
                <Button 
                  className="mt-4"
                  onClick={() => {
                    setShowDrillDown(null);
                    if (showDrillDown === 'leads') setCurrentView('leads');
                    if (showDrillDown === 'opportunities') setCurrentView('opportunities');
                  }}
                >
                  View Full Module
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}