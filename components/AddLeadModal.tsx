import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';

import { useCrm } from './CrmContext';
import { Loader2, Plus, X } from 'lucide-react';

interface AddLeadModalProps {
  user: any;
}

export function AddLeadModal({ user }: AddLeadModalProps) {
  const { 
    showAddLeadModal, 
    setShowAddLeadModal, 
    projects,
    refreshData 
  } = useCrm();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    source: '',
    projectId: '',
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
    notes: '',
    followUpDate: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sources = ['Housing.com', 'WhatsApp', 'Referral', 'Walk-in', 'Social Media', 'Advertisement'];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.projectId) newErrors.projectId = 'Project is required';
    if (!formData.source) newErrors.source = 'Source is required';
    
    // Phone validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }
    
    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

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
      console.log('Creating lead:', formData);
      
      if (window.showToast) {
        window.showToast(`Lead ${formData.name} created successfully in ${projects.find(p => p.id.toString() === formData.projectId)?.name}`, 'success');
      }
      
      refreshData();
      setShowAddLeadModal(false);
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        source: '',
        projectId: '',
        priority: 'Medium',
        notes: '',
        followUpDate: ''
      });
      
    } catch (error) {
      if (window.showToast) {
        window.showToast('Failed to create lead. Please try again.', 'error');
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

  const accessibleProjects = projects.filter(project => 
    user.role === 'Admin' || user.projectIds?.includes(project.id)
  );

  return (
    <Dialog open={showAddLeadModal} onOpenChange={setShowAddLeadModal}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Lead
          </DialogTitle>
          <DialogDescription>
            Create a new lead by filling out the form below. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+91 9876543210"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="email@example.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
          </div>

          {/* Lead Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              
              <div className="space-y-2">
                <Label htmlFor="source">Lead Source *</Label>
                <Select 
                  value={formData.source} 
                  onValueChange={(value) => handleInputChange('source', value)}
                >
                  <SelectTrigger className={errors.source ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map(source => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.source && <p className="text-sm text-red-500">{errors.source}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => handleInputChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        High
                      </div>
                    </SelectItem>
                    <SelectItem value="Medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="Low">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Low
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="followUpDate">Next Follow-up</Label>
                <Input
                  id="followUpDate"
                  type="datetime-local"
                  value={formData.followUpDate}
                  onChange={(e) => handleInputChange('followUpDate', e.target.value)}
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
              placeholder="Add any additional notes about the lead..."
              rows={3}
            />
          </div>

          {/* Preview */}
          {formData.name && formData.projectId && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Lead Preview</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Name:</strong> {formData.name}</p>
                <p><strong>Project:</strong> {projects.find(p => p.id.toString() === formData.projectId)?.name}</p>
                <p><strong>Source:</strong> {formData.source}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={
                    formData.priority === 'High' ? 'destructive' : 
                    formData.priority === 'Medium' ? 'default' : 'secondary'
                  }>
                    {formData.priority} Priority
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
            onClick={() => setShowAddLeadModal(false)}
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
                Creating Lead...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Lead
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}