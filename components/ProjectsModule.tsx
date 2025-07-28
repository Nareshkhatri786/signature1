import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { useCrm } from './CrmContext';
import { 
  Search, 
  Plus, 
  MapPin, 
  Building, 
  Users, 
  DollarSign,
  TrendingUp,
  Eye
} from 'lucide-react';

interface ProjectsModuleProps {
  user: any;
}

export function ProjectsModule({ user }: ProjectsModuleProps) {
  const { projects, filteredLeads, filteredOpportunities } = useCrm();
  const [searchTerm, setSearchTerm] = useState('');
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProjectStats = (projectId: number) => {
    const leads = filteredLeads.filter(l => l.projectId === projectId);
    const opportunities = filteredOpportunities.filter(o => o.projectId === projectId);
    const totalValue = opportunities.reduce((sum, o) => sum + o.value, 0);
    return { leads: leads.length, opportunities: opportunities.length, totalValue };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pre-Launch': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Launched': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Under Construction': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Completed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleViewProject = (project: any) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage your real estate projects and track performance
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Project
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => {
          const stats = getProjectStats(project.id);
          return (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" />
                      {project.location}
                    </div>
                  </div>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium">{project.type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Units</p>
                    <p className="font-medium">{project.totalUnits}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Available</p>
                    <p className="font-medium">{project.availableUnits}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Manager</p>
                    <p className="font-medium">{project.managerName}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Price Range</p>
                  <p className="font-medium">
                    ₹{(project.priceRange.min / 10000000).toFixed(1)}Cr - ₹{(project.priceRange.max / 10000000).toFixed(1)}Cr
                  </p>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>Leads</span>
                    </div>
                    <span className="font-medium">{stats.leads}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Opportunities</span>
                    </div>
                    <span className="font-medium">{stats.opportunities}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      <span>Pipeline Value</span>
                    </div>
                    <span className="font-medium">₹{(stats.totalValue / 10000000).toFixed(1)}Cr</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleViewProject(project)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Project Details Modal */}
      <Dialog open={showProjectDetails} onOpenChange={setShowProjectDetails}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
            <DialogDescription>
              Comprehensive information about the selected project.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProject && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-medium">{selectedProject.name}</h3>
                  <div className="flex items-center gap-1 text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" />
                    {selectedProject.location}
                  </div>
                </div>
                <Badge className={getStatusColor(selectedProject.status)}>
                  {selectedProject.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Project Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{selectedProject.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Units:</span>
                      <span>{selectedProject.totalUnits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Available Units:</span>
                      <span>{selectedProject.availableUnits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sold Units:</span>
                      <span>{selectedProject.totalUnits - selectedProject.availableUnits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Manager:</span>
                      <span>{selectedProject.managerName}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Performance Metrics</h4>
                  <div className="space-y-3">
                    {(() => {
                      const stats = getProjectStats(selectedProject.id);
                      return (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-600" />
                              <span className="text-sm">Total Leads</span>
                            </div>
                            <span className="font-medium">{stats.leads}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-green-600" />
                              <span className="text-sm">Opportunities</span>
                            </div>
                            <span className="font-medium">{stats.opportunities}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-purple-600" />
                              <span className="text-sm">Pipeline Value</span>
                            </div>
                            <span className="font-medium">₹{(stats.totalValue / 10000000).toFixed(1)}Cr</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span>Minimum Price:</span>
                    <span className="font-medium">₹{(selectedProject.priceRange.min / 10000000).toFixed(2)}Cr</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Maximum Price:</span>
                    <span className="font-medium">₹{(selectedProject.priceRange.max / 10000000).toFixed(2)}Cr</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProjectDetails(false)}>
              Close
            </Button>
            <Button>
              Edit Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}