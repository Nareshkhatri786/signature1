import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { UserRole } from './SettingsConstants';

interface UserRolesSettingsProps {
  userRoles: UserRole[];
  onAddRole: () => void;
  onEditRole: (role: UserRole) => void;
  onDeleteRole: (roleId: string) => void;
}

export default function UserRolesSettings({ 
  userRoles, 
  onAddRole, 
  onEditRole, 
  onDeleteRole 
}: UserRolesSettingsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User Roles & Permissions</CardTitle>
          <p className="text-muted-foreground">Manage user roles and their permissions</p>
        </div>
        <Button onClick={onAddRole}>
          Add Role
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {userRoles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <p className="text-muted-foreground text-sm">{role.description}</p>
                  </div>
                  <Badge variant={role.active ? 'default' : 'secondary'}>
                    {role.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Permissions:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {role.permissions.slice(0, 3).map((permission, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditRole(role)}
                    >
                      Edit Role
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteRole(role.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}