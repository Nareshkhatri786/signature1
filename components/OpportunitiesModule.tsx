import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  MessageSquare,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Download,
  TrendingUp,
  IndianRupee
} from 'lucide-react';
import { useCrm } from './CrmContext';
import { OpportunityDetailModal } from './OpportunityDetailModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface OpportunitiesModuleProps {
  user: any;
}

export function OpportunitiesModule({ user }: OpportunitiesModuleProps) {
  const { 
    filteredOpportunities, 
    setShowAddOpportunityModal,
    isMobile
  } = useCrm();
  
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');

  // Filter opportunities based on search and filters
  const displayedOpportunities = filteredOpportunities.filter(opp => {
    const matchesSearch = opp.lead_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (opp.lead_email && opp.lead_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         opp.lead_phone.includes(searchTerm);
    const matchesStage = stageFilter === 'all' || opp.stage === stageFilter;
    const matchesProject = projectFilter === 'all' || opp.project_name === projectFilter;
    
    return matchesSearch && matchesStage && matchesProject;
  });

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Visit Done': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Negotiation': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Booking': return 'bg-green-100 text-green-800 border-green-200';
      case 'Lost': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name || typeof name !== 'string') return 'N/A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPipelineValue = () => {
    return displayedOpportunities.reduce((total, opp) => total + opp.value, 0);
  };

  const getConversionRate = () => {
    const totalOpps = displayedOpportunities.length;
    const closedOpps = displayedOpportunities.filter(opp => opp.stage === 'Booking').length;
    return totalOpps > 0 ? ((closedOpps / totalOpps) * 100).toFixed(1) : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Pipeline Management</h1>
          <p className="text-sm text-muted-foreground">
            Track opportunities through your sales pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {/* Export functionality */}}
            variant="outline"
            size="sm"
            className="hidden sm:flex"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAddOpportunityModal(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Opportunity
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {displayedOpportunities.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Opportunities</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(getPipelineValue()).replace('₹', '₹')}
            </div>
            <div className="text-sm text-muted-foreground">Pipeline Value</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {displayedOpportunities.filter(o => o.stage === 'Booking').length}
            </div>
            <div className="text-sm text-muted-foreground">Closed Won</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {getConversionRate()}%
            </div>
            <div className="text-sm text-muted-foreground">Win Rate</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search opportunities by lead name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Visit Done">Visit Done</SelectItem>
              <SelectItem value="Negotiation">Negotiation</SelectItem>
              <SelectItem value="Booking">Booking</SelectItem>
              <SelectItem value="Lost">Lost</SelectItem>
            </SelectContent>
          </Select>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="Skyline Residences">Skyline Residences</SelectItem>
              <SelectItem value="Green Valley Apartments">Green Valley Apartments</SelectItem>
              <SelectItem value="Premium Villas">Premium Villas</SelectItem>
              <SelectItem value="Commercial Complex">Commercial Complex</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Opportunities Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Probability</TableHead>
                <TableHead>Visit Date</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedOpportunities.map((opportunity) => (
                <TableRow key={opportunity.id} className="hover:bg-muted/50 cursor-pointer">
                  <TableCell>
                    <div 
                      className="flex items-center gap-3"
                      onClick={() => setSelectedOpportunity(opportunity)}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(opportunity.lead_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium hover:text-primary transition-colors">
                          {opportunity.lead_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {opportunity.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{opportunity.lead_phone}</div>
                      <div className="text-xs text-muted-foreground">{opportunity.lead_email || 'No email'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStageColor(opportunity.stage)}>
                      {opportunity.stage}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{opportunity.project_name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {formatCurrency(opportunity.value)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="text-sm">{opportunity.probability}%</div>
                      <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${opportunity.probability}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {opportunity.visit_date ? (
                      <div className={`text-sm ${
                        new Date(opportunity.visit_date) <= new Date() 
                          ? 'text-green-600 font-medium' 
                          : 'text-muted-foreground'
                      }`}>
                        {formatDate(opportunity.visit_date)}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">No visit scheduled</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(opportunity.created_at)}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOpportunity(opportunity);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Call functionality
                        }}
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          // WhatsApp functionality
                        }}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedOpportunity(opportunity)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Opportunity
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule Visit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Update Stage
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Opportunity
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {displayedOpportunities.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No opportunities found matching your criteria.</p>
          </div>
        )}
      </Card>

      {/* Opportunity Detail Modal */}
      {selectedOpportunity && (
        <OpportunityDetailModal
          opportunity={selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
        />
      )}
    </div>
  );
}