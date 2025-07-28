import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { CustomField } from './SettingsConstants';

interface CustomFieldModalProps {
  field?: CustomField;
  onClose: () => void;
  onSave: (field: CustomField | Omit<CustomField, 'id'>) => void;
}

export default function CustomFieldModal({ field, onClose, onSave }: CustomFieldModalProps) {
  const [formData, setFormData] = useState<CustomField | Omit<CustomField, 'id'>>(field || {
    name: '',
    label: '',
    type: 'text',
    module: 'leads',
    required: false,
    options: [],
    order: 1,
    active: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{field ? 'Edit Custom Field' : 'Add Custom Field'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fieldName">Field Name</Label>
            <Input
              id="fieldName"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., budget_range"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fieldLabel">Field Label</Label>
            <Input
              id="fieldLabel"
              value={formData.label}
              onChange={(e) => setFormData({...formData, label: e.target.value})}
              placeholder="e.g., Budget Range"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fieldType">Field Type</Label>
            <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="select">Select</SelectItem>
                <SelectItem value="multiselect">Multi-select</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fieldModule">Module</Label>
            <Select value={formData.module} onValueChange={(value: any) => setFormData({...formData, module: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leads">Leads</SelectItem>
                <SelectItem value="opportunities">Opportunities</SelectItem>
                <SelectItem value="contacts">Contacts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(formData.type === 'select' || formData.type === 'multiselect') && (
            <div className="space-y-2">
              <Label htmlFor="fieldOptions">Options (one per line)</Label>
              <Textarea
                id="fieldOptions"
                value={formData.options?.join('\n') || ''}
                onChange={(e) => setFormData({...formData, options: e.target.value.split('\n').filter(o => o.trim())})}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
              />
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Switch
              id="fieldRequired"
              checked={formData.required}
              onCheckedChange={(checked) => setFormData({...formData, required: checked})}
            />
            <Label htmlFor="fieldRequired">Required field</Label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!formData.name.trim()}>
              {field ? 'Update' : 'Add'} Field
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}