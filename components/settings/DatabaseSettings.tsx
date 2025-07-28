import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';

interface DatabaseSettingsProps {
  settings: any;
  onSettingsChange: (settings: any) => void;
}

export default function DatabaseSettings({ settings, onSettingsChange }: DatabaseSettingsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Database Configuration</CardTitle>
          <p className="text-muted-foreground">Configure your PostgreSQL database connection</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dbHost">Database Host</Label>
              <Input
                id="dbHost"
                value={settings.host}
                onChange={(e) => onSettingsChange({...settings, host: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dbPort">Port</Label>
              <Input
                id="dbPort"
                value={settings.port}
                onChange={(e) => onSettingsChange({...settings, port: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dbName">Database Name</Label>
              <Input
                id="dbName"
                value={settings.database}
                onChange={(e) => onSettingsChange({...settings, database: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dbUser">Username</Label>
              <Input
                id="dbUser"
                value={settings.username}
                onChange={(e) => onSettingsChange({...settings, username: e.target.value})}
              />
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="connectionPool">Connection Pool Size</Label>
              <Input
                id="connectionPool"
                type="number"
                value={settings.connectionPool}
                onChange={(e) => onSettingsChange({...settings, connectionPool: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backupRetention">Backup Retention (Days)</Label>
              <Input
                id="backupRetention"
                type="number"
                value={settings.backupRetention}
                onChange={(e) => onSettingsChange({...settings, backupRetention: parseInt(e.target.value)})}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="enableAuditLog"
                checked={settings.enableAuditLog}
                onCheckedChange={(checked) => onSettingsChange({...settings, enableAuditLog: checked})}
              />
              <Label htmlFor="enableAuditLog">Enable audit logging</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enableDataEncryption"
                checked={settings.enableDataEncryption}
                onCheckedChange={(checked) => onSettingsChange({...settings, enableDataEncryption: checked})}
              />
              <Label htmlFor="enableDataEncryption">Enable data encryption at rest</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Button variant="outline">
              Test Connection
            </Button>
            <Button variant="outline">
              Backup Database
            </Button>
            <Button variant="outline">
              View Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}