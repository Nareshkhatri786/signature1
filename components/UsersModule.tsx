import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  Search, 
  Plus, 
  UserCheck, 
  UserX, 
  Edit, 
  Shield,
  Users as UsersIcon,
  Building
} from 'lucide-react';

interface UsersModuleProps {
  user: any;
}

const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@signatureproperties.com',
    role: 'Admin',
    status: 'Active',
    projectIds: [1, 2, 3],
    projectNames: ['All Projects'],
    lastLogin: new Date('2024-01-21T10:30:00'),
    leadsHandled: 45,
    opportunitiesManaged: 12
  },
  {
    id: 2,
    name: 'Sarah Wilson',
    email: 'sarah@signatureproperties.com',
    role: 'Project Manager',
    status: 'Active',
    projectIds: [1, 3],
    projectNames: ['Signature Heights', 'Signature Plaza'],
    lastLogin: new Date('2024-01-21T09:15:00'),
    leadsHandled: 32,
    opportunitiesManaged: 8
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike@signatureproperties.com',
    role: 'Project Manager',
    status: 'Active',
    projectIds: [2],
    projectNames: ['Signature Gardens'],
    lastLogin: new Date('2024-01-21T08:45:00'),
    leadsHandled: 28,
    opportunitiesManaged: 6
  },
  {
    id: 4,
    name: 'Alex Kumar',
    email: 'alex@signatureproperties.com',
    role: 'Telecaller',
    status: 'Active',
    projectIds: [1],
    projectNames: ['Signature Heights'],
    lastLogin: new Date('2024-01-21T11:00:00'),
    leadsHandled: 67,
    opportunitiesManaged: 0
  },
  {
    id: 5,
    name: 'Lisa Chen',
    email: 'lisa@signatureproperties.com',
    role: 'Sales Executive',
    status: 'Active',
    projectIds: [2],
    projectNames: ['Signature Gardens'],
    lastLogin: new Date('2024-01-21T07:30:00'),
    leadsHandled: 23,
    opportunitiesManaged: 15
  }
];

export function UsersModule({ user }: UsersModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [users] = useState(mockUsers);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Project Manager': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Sales Executive': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Telecaller': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const roleStats = {
    Admin: users.filter(u => u.role === 'Admin').length,
    'Project Manager': users.filter(u => u.role === 'Project Manager').length,
    'Sales Executive': users.filter(u => u.role === 'Sales Executive').length,
    'Telecaller': users.filter(u => u.role === 'Telecaller').length,
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage team members, roles, and permissions
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{roleStats.Admin}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Project Managers</p>
                <p className="text-2xl font-bold">{roleStats['Project Manager']}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Sales Executives</p>
                <p className="text-2xl font-bold">{roleStats['Sales Executive']}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Telecallers</p>
                <p className="text-2xl font-bold">{roleStats.Telecaller}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-48">
                      {user.projectNames.join(', ')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Leads: {user.leadsHandled}</div>
                      {user.opportunitiesManaged > 0 && (
                        <div>Opportunities: {user.opportunitiesManaged}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {user.lastLogin.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleViewUser(user)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <UserX className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View and manage user information, roles, and permissions.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {selectedUser.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getRoleColor(selectedUser.role)}>
                      {selectedUser.role}
                    </Badge>
                    <Badge className={getStatusColor(selectedUser.status)}>
                      {selectedUser.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Access Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Role:</strong> {selectedUser.role}</div>
                    <div><strong>Status:</strong> {selectedUser.status}</div>
                    <div><strong>Last Login:</strong> {selectedUser.lastLogin.toLocaleString()}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Leads Handled:</strong> {selectedUser.leadsHandled}</div>
                    <div><strong>Opportunities:</strong> {selectedUser.opportunitiesManaged}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Project Access</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.projectNames.map((project: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {project}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDetails(false)}>
              Close
            </Button>
            <Button>
              Edit User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}