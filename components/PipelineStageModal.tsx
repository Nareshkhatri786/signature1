import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
  type: 'leads' | 'opportunities';
  active: boolean;
  autoActions?: string[];
}

interface PipelineStageModalProps {
  stage?: PipelineStage;
  onClose: () => void;
  onSave: (stage: PipelineStage | Omit<PipelineStage, 'id'>) => void;
}

const predefinedColors = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Yellow', value: '#f59e0b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Cyan', value: '#06b6d4' }
];

export default function PipelineStageModal({ stage, onClose, onSave }: PipelineStageModalProps) {
  const [formData, setFormData] = useState<PipelineStage | Omit<PipelineStage, 'id'>>(stage || {
    name: '',
    color: '#3b82f6',
    order: 1,
    type: 'leads',
    active: true,
    autoActions: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{stage ? 'Edit Pipeline Stage' : 'Add Pipeline Stage'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stageName">Stage Name</Label>
            <Input
              id="stageName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Qualified"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stageType">Pipeline Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: 'leads' | 'opportunities') => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leads">Leads Pipeline</SelectItem>
                <SelectItem value="opportunities">Opportunities Pipeline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stageOrder">Stage Order</Label>
            <Input
              id="stageOrder"
              type="number"
              min="1"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Stage Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`w-full h-10 rounded-md border-2 flex items-center justify-center ${
                    formData.color === color.value ? 'border-foreground' : 'border-border'
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setFormData({ ...formData, color: color.value })}
                >
                  {formData.color === color.value && (
                    <span className="text-white text-xs font-medium">✓</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-16 h-8 p-1 border rounded"
              />
              <span className="text-sm text-muted-foreground">Custom Color</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: formData.color }}
              />
              <span className="font-medium">{formData.name || 'Stage Name'}</span>
              <Badge variant="outline">{formData.type}</Badge>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="stageActive"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
            <Label htmlFor="stageActive">Active stage</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {stage ? 'Update' : 'Add'} Stage
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}