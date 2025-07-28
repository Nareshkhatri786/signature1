import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { useCrm } from './CrmContext';
import { Loader2, Plus, TrendingUp } from 'lucide-react';

interface AddOpportunityModalProps {
  user: any;
}

export function AddOpportunityModal({ user }: AddOpportunityModalProps) {
  const { 
    showAddOpportunityModal, 
    setShowAddOpportunityModal, 
    projects,
    leads,
    refreshData 
  } = useCrm();

  const [formData, setFormData] = useState({
    leadId: '',
    projectId: '',
    stage: 'Scheduled' as 'Scheduled' | 'Visit Done' | 'Negotiation' | 'Booking' | 'Lost',
    value: '',
    probability: '50',
    visitDate: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const stages = [
    { value: 'Scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
    { value: 'Visit Done', label: 'Visit Done', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Negotiation', label: 'Negotiation', color: 'bg-orange-100 text-orange-800' },
    { value: 'Booking', label: 'Booking', color: 'bg-green-100 text-green-800' },
    { value: 'Lost', label: 'Lost', color: 'bg-red-100 text-red-800' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.leadId) newErrors.leadId = 'Lead is required';
    if (!formData.projectId) newErrors.projectId = 'Project is required';
    if (!formData.value || parseFloat(formData.value) <= 0) newErrors.value = 'Valid value is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would make the actual API call
      console.log('Creating opportunity:', formData);
      
      const selectedLead = leads.find(l => l.id.toString() === formData.leadId);
      const selectedProject = projects.find(p => p.id.toString() === formData.projectId);
      
      if (window.showToast) {
        window.showToast(`Opportunity created for ${selectedLead?.name} in ${selectedProject?.name}`, 'success');
      }
      
      refreshData();
      setShowAddOpportunityModal(false);
      
      // Reset form
      setFormData({
        leadId: '',
        projectId: '',
        stage: 'Scheduled',
        value: '',
        probability: '50',
        visitDate: '',
        notes: ''
      });
      
    } catch (error) {
      if (window.showToast) {
        window.showToast('Failed to create opportunity', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Filter projects based on user access
  const accessibleProjects = projects.filter(project => 
    user.role === 'Admin' || user.projectIds?.includes(project.id)
  );

  // Filter leads based on user access
  const accessibleLeads = leads.filter(lead => 
    user.role === 'Admin' || user.projectIds?.includes(lead.project_id)
  );

  const selectedLead = leads.find(l => l.id.toString() === formData.leadId);

  return (
    <Dialog open={showAddOpportunityModal} onOpenChange={setShowAddOpportunityModal}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Add New Opportunity
          </DialogTitle>
          <DialogDescription>
            Create a new opportunity by filling out the form below. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Lead and Project Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lead">Lead *</Label>
                <Select 
                  value={formData.leadId} 
                  onValueChange={(value) => {
                    handleInputChange('leadId', value);
                    // Auto-set project based on lead
                    const lead = leads.find(l => l.id.toString() === value);
                    if (lead) {
                      handleInputChange('projectId', lead.project_id.toString());
                    }
                  }}
                >
                  <SelectTrigger className={errors.leadId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {accessibleLeads.map(lead => (
                      <SelectItem key={lead.id} value={lead.id.toString()}>
                        <div className="flex flex-col">
                          <span>{lead.name}</span>
                          <span className="text-xs text-muted-foreground">{lead.phone}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.leadId && <p className="text-sm text-red-500">{errors.leadId}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="project">Project *</Label>
                <Select 
                  value={formData.projectId} 
                  onValueChange={(value) => handleInputChange('projectId', value)}
                >
                  <SelectTrigger className={errors.projectId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {accessibleProjects.map(project => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        <div className="flex flex-col">
                          <span>{project.name}</span>
                          <span className="text-xs text-muted-foreground">{project.location}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.projectId && <p className="text-sm text-red-500">{errors.projectId}</p>}
              </div>
            </div>
          </div>

          {/* Opportunity Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <Select 
                  value={formData.stage} 
                  onValueChange={(value) => handleInputChange('stage', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map(stage => (
                      <SelectItem key={stage.value} value={stage.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            stage.value === 'Scheduled' ? 'bg-blue-500' :
                            stage.value === 'Visit Done' ? 'bg-yellow-500' :
                            stage.value === 'Negotiation' ? 'bg-orange-500' :
                            stage.value === 'Booking' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          {stage.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="value">Deal Value (₹) *</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', e.target.value)}
                  placeholder="5000000"
                  className={errors.value ? 'border-red-500' : ''}
                />
                {errors.value && <p className="text-sm text-red-500">{errors.value}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="probability">Probability (%)</Label>
                <div className="space-y-2">
                  <Input
                    id="probability"
                    type="range"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => handleInputChange('probability', e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span className="font-medium">{formData.probability}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="visitDate">Visit Date</Label>
                <Input
                  id="visitDate"
                  type="datetime-local"
                  value={formData.visitDate}
                  onChange={(e) => handleInputChange('visitDate', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any additional notes about the opportunity..."
              rows={3}
            />
          </div>

          {/* Preview */}
          {selectedLead && formData.projectId && formData.value && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Opportunity Preview</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Lead:</strong> {selectedLead.name}</p>
                <p><strong>Project:</strong> {projects.find(p => p.id.toString() === formData.projectId)?.name}</p>
                <p><strong>Value:</strong> ₹{parseInt(formData.value).toLocaleString('en-IN')}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={stages.find(s => s.value === formData.stage)?.color}>
                    {formData.stage}
                  </Badge>
                  <Badge variant="outline">
                    {formData.probability}% Probability
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </form>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setShowAddOpportunityModal(false)}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Opportunity...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Opportunity
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}