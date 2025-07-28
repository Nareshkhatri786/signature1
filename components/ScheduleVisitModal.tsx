import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';

import { useCrm } from './CrmContext';
import { CalendarIcon, Clock, MapPin, User, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export function ScheduleVisitModal() {
  const { 
    showScheduleVisitModal, 
    setShowScheduleVisitModal, 
    filteredOpportunities,
    filteredLeads,
    projects,
    user,
    refreshData 
  } = useCrm();

  const [formData, setFormData] = useState({
    type: 'opportunity', // 'opportunity' or 'lead'
    targetId: '',
    visitDate: undefined as Date | undefined,
    visitTime: '',
    notes: '',
    reminder: '1' // hours before
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00'
  ];

  const reminderOptions = [
    { value: '0.5', label: '30 minutes before' },
    { value: '1', label: '1 hour before' },
    { value: '2', label: '2 hours before' },
    { value: '24', label: '1 day before' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.targetId) newErrors.targetId = 'Please select a lead or opportunity';
    if (!formData.visitDate) newErrors.visitDate = 'Visit date is required';
    if (!formData.visitTime) newErrors.visitTime = 'Visit time is required';
    
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
      
      const target = formData.type === 'opportunity' 
        ? filteredOpportunities.find(o => o.id.toString() === formData.targetId)
        : filteredLeads.find(l => l.id.toString() === formData.targetId);
      
      console.log('Scheduling visit:', {
        ...formData,
        visitDateTime: new Date(`${formData.visitDate?.toDateString()} ${formData.visitTime}`)
      });
      
      toast.success('Site visit scheduled!', {
        description: `Visit with ${target?.leadName || (target as any)?.name} scheduled for ${format(formData.visitDate!, 'MMM dd')} at ${formData.visitTime}`
      });
      
      refreshData();
      setShowScheduleVisitModal(false);
      
      // Reset form
      setFormData({
        type: 'opportunity',
        targetId: '',
        visitDate: undefined,
        visitTime: '',
        notes: '',
        reminder: '1'
      });
      
    } catch (error) {
      toast.error('Failed to schedule visit', {
        description: 'Please try again later'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectedTarget = formData.type === 'opportunity' 
    ? filteredOpportunities.find(o => o.id.toString() === formData.targetId)
    : filteredLeads.find(l => l.id.toString() === formData.targetId);

  const selectedProject = selectedTarget 
    ? projects.find(p => p.id === selectedTarget.projectId)
    : null;

  return (
    <Dialog open={showScheduleVisitModal} onOpenChange={setShowScheduleVisitModal}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Schedule Site Visit
          </DialogTitle>
          <DialogDescription>
            Schedule a site visit for a lead or opportunity. Select the client, date, and time for the visit.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Visit Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => {
                  handleInputChange('type', value);
                  handleInputChange('targetId', ''); // Reset target selection
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="opportunity">Existing Opportunity</SelectItem>
                  <SelectItem value="lead">Qualified Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target">
                Select {formData.type === 'opportunity' ? 'Opportunity' : 'Lead'} *
              </Label>
              <Select 
                value={formData.targetId} 
                onValueChange={(value) => handleInputChange('targetId', value)}
              >
                <SelectTrigger className={errors.targetId ? 'border-red-500' : ''}>
                  <SelectValue placeholder={`Choose ${formData.type}...`} />
                </SelectTrigger>
                <SelectContent>
                  {(formData.type === 'opportunity' ? filteredOpportunities : filteredLeads)
                    .map((item: any) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        <div className="flex flex-col">
                          <span>{item.leadName || item.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.projectName} • {item.phone}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.targetId && <p className="text-sm text-red-500">{errors.targetId}</p>}
            </div>
          </div>

          {/* Selected Target Info */}
          {selectedTarget && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{(selectedTarget as any).leadName || (selectedTarget as any).name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedTarget.phone}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      <MapPin className="w-3 h-3 mr-1" />
                      {selectedProject?.name}
                    </Badge>
                    {formData.type === 'opportunity' && (
                      <Badge variant="secondary" className="text-xs">
                        ₹{((selectedTarget as any).value / 10000000).toFixed(1)}Cr
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Date & Time Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Visit Date *</Label>
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${errors.visitDate ? 'border-red-500' : ''}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.visitDate ? format(formData.visitDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.visitDate}
                    onSelect={(date) => {
                      handleInputChange('visitDate', date);
                      setShowCalendar(false);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.visitDate && <p className="text-sm text-red-500">{errors.visitDate}</p>}
            </div>

            <div className="space-y-2">
              <Label>Visit Time *</Label>
              <Select 
                value={formData.visitTime} 
                onValueChange={(value) => handleInputChange('visitTime', value)}
              >
                <SelectTrigger className={errors.visitTime ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {time}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.visitTime && <p className="text-sm text-red-500">{errors.visitTime}</p>}
            </div>
          </div>

          {/* Reminder */}
          <div className="space-y-2">
            <Label>Reminder</Label>
            <Select 
              value={formData.reminder} 
              onValueChange={(value) => handleInputChange('reminder', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reminderOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add visit agenda, special instructions, or other notes..."
              rows={3}
            />
          </div>

          {/* Visit Summary */}
          {formData.visitDate && formData.visitTime && selectedTarget && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Visit Summary</h4>
              <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <p><strong>Client:</strong> {(selectedTarget as any).leadName || (selectedTarget as any).name}</p>
                <p><strong>Project:</strong> {selectedProject?.name}</p>
                <p><strong>Date & Time:</strong> {format(formData.visitDate, 'PPP')} at {formData.visitTime}</p>
                <p><strong>Reminder:</strong> {reminderOptions.find(r => r.value === formData.reminder)?.label}</p>
              </div>
            </div>
          )}
        </form>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setShowScheduleVisitModal(false)}
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
                Scheduling...
              </>
            ) : (
              <>
                <CalendarIcon className="w-4 h-4 mr-2" />
                Schedule Visit
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}