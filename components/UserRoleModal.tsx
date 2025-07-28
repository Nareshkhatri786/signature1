import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  description: string;
  active: boolean;
}

interface UserRoleModalProps {
  role?: UserRole;
  onClose: () => void;
  onSave: (role: UserRole | Omit<UserRole, 'id'>) => void;
}

const availablePermissions = [
  {
    category: 'Leads',
    permissions: [
      { id: 'leads:read', name: 'View Leads', description: 'Can view lead information' },
      { id: 'leads:write', name: 'Edit Leads', description: 'Can create and edit leads' },
      { id: 'leads:delete', name: 'Delete Leads', description: 'Can delete leads' },
      { id: 'leads:assign', name: 'Assign Leads', description: 'Can assign leads to team members' },
      { id: 'leads:export', name: 'Export Leads', description: 'Can export lead data' }
    ]
  },
  {
    category: 'Opportunities',
    permissions: [
      { id: 'opportunities:read', name: 'View Opportunities', description: 'Can view opportunity information' },
      { id: 'opportunities:write', name: 'Edit Opportunities', description: 'Can create and edit opportunities' },
      { id: 'opportunities:delete', name: 'Delete Opportunities', description: 'Can delete opportunities' },
      { id: 'opportunities:assign', name: 'Assign Opportunities', description: 'Can assign opportunities to team members' }
    ]
  },
  {
    category: 'Site Visits',
    permissions: [
      { id: 'visits:read', name: 'View Site Visits', description: 'Can view site visit information' },
      { id: 'visits:write', name: 'Manage Site Visits', description: 'Can schedule and manage site visits' },
      { id: 'visits:assign', name: 'Assign Visits', description: 'Can assign visits to team members' }
    ]
  },
  {
    category: 'WhatsApp',
    permissions: [
      { id: 'whatsapp:read', name: 'View WhatsApp', description: 'Can view WhatsApp conversations' },
      { id: 'whatsapp:send', name: 'Send WhatsApp', description: 'Can send WhatsApp messages' },
      { id: 'whatsapp:templates', name: 'Manage Templates', description: 'Can manage WhatsApp templates' },
      { id: 'whatsapp:settings', name: 'WhatsApp Settings', description: 'Can configure WhatsApp settings' }
    ]
  },
  {
    category: 'Reports',
    permissions: [
      { id: 'reports:read', name: 'View Reports', description: 'Can view reports and analytics' },
      { id: 'reports:export', name: 'Export Reports', description: 'Can export report data' },
      { id: 'reports:advanced', name: 'Advanced Reports', description: 'Can access advanced reporting features' }
    ]
  },
  {
    category: 'Administration',
    permissions: [
      { id: 'users:read', name: 'View Users', description: 'Can view user information' },
      { id: 'users:write', name: 'Manage Users', description: 'Can create and edit users' },
      { id: 'users:delete', name: 'Delete Users', description: 'Can delete users' },
      { id: 'settings:read', name: 'View Settings', description: 'Can view system settings' },
      { id: 'settings:write', name: 'Manage Settings', description: 'Can modify system settings' },
      { id: 'all', name: 'Full Access', description: 'Complete access to all features' }
    ]
  }
];

export default function UserRoleModal({ role, onClose, onSave }: UserRoleModalProps) {
  const [formData, setFormData] = useState<UserRole | Omit<UserRole, 'id'>>(role || {
    name: '',
    permissions: [],
    description: '',
    active: true
  });

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (permissionId === 'all') {
      if (checked) {
        // If "Full Access" is selected, select all permissions
        const allPermissions = availablePermissions.flatMap(category => 
          category.permissions.map(p => p.id)
        );
        setFormData({ ...formData, permissions: allPermissions });
      } else {
        // If "Full Access" is unselected, clear all permissions
        setFormData({ ...formData, permissions: [] });
      }
    } else {
      if (checked) {
        setFormData({ 
          ...formData, 
          permissions: [...formData.permissions, permissionId] 
        });
      } else {
        setFormData({ 
          ...formData, 
          permissions: formData.permissions.filter(p => p !== permissionId) 
        });
      }
    }
  };

  const isPermissionChecked = (permissionId: string) => {
    return formData.permissions.includes(permissionId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{role ? 'Edit User Role' : 'Add User Role'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roleName">Role Name</Label>
              <Input
                id="roleName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Sales Executive"
                required
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="roleActive"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label htmlFor="roleActive">Active role</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="roleDescription">Description</Label>
            <Textarea
              id="roleDescription"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this role"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Permissions</Label>
              <Badge variant="outline">
                {formData.permissions.length} selected
              </Badge>
            </div>

            <div className="space-y-4">
              {availablePermissions.map((category) => (
                <div key={category.category} className="space-y-3">
                  <h4 className="font-medium text-sm text-foreground">{category.category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-4">
                    {category.permissions.map((permission) => (
                      <div key={permission.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={permission.id}
                          checked={isPermissionChecked(permission.id)}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(permission.id, checked as boolean)
                          }
                          className="mt-1"
                        />
                        <div className="space-y-1 flex-1">
                          <Label 
                            htmlFor={permission.id} 
                            className="text-sm font-medium cursor-pointer"
                          >
                            {permission.name}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {category.category !== 'Administration' && <Separator />}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Selected Permissions Preview</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[60px] bg-muted/30">
              {formData.permissions.length > 0 ? (
                formData.permissions.map((permissionId) => {
                  const permission = availablePermissions
                    .flatMap(cat => cat.permissions)
                    .find(p => p.id === permissionId);
                  return permission ? (
                    <Badge key={permissionId} variant="secondary" className="text-xs">
                      {permission.name}
                    </Badge>
                  ) : null;
                })
              ) : (
                <span className="text-muted-foreground text-sm">No permissions selected</span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name.trim()}>
              {role ? 'Update' : 'Add'} Role
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}