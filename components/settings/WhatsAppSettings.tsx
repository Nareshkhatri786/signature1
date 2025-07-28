import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

interface WhatsAppSettingsProps {
  settings: any;
  onSettingsChange: (settings: any) => void;
}

export default function WhatsAppSettings({ settings, onSettingsChange }: WhatsAppSettingsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Business Numbers</CardTitle>
          <p className="text-muted-foreground">Manage your WhatsApp business accounts</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings.businessNumbers.map((number: any) => (
              <div key={number.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{number.name}</p>
                  <p className="text-muted-foreground">{number.number}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={number.active ? 'default' : 'secondary'}>
                    {number.active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Switch
                    checked={number.active}
                    onCheckedChange={(checked) => {
                      onSettingsChange({
                        ...settings,
                        businessNumbers: settings.businessNumbers.map((n: any) =>
                          n.id === number.id ? { ...n, active: checked } : n
                        )
                      });
                    }}
                  />
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              Add Business Number
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              placeholder="https://your-domain.com/webhook"
              value={settings.webhookUrl}
              onChange={(e) => onSettingsChange({...settings, webhookUrl: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your WhatsApp API key"
              value={settings.apiKey}
              onChange={(e) => onSettingsChange({...settings, apiKey: e.target.value})}
            />
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="autoReply"
                checked={settings.autoReply}
                onCheckedChange={(checked) => onSettingsChange({...settings, autoReply: checked})}
              />
              <Label htmlFor="autoReply">Enable auto-reply messages</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="businessHours"
                checked={settings.businessHours}
                onCheckedChange={(checked) => onSettingsChange({...settings, businessHours: checked})}
              />
              <Label htmlFor="businessHours">Respect business hours for messaging</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="deliveryReports"
                checked={settings.deliveryReports}
                onCheckedChange={(checked) => onSettingsChange({...settings, deliveryReports: checked})}
              />
              <Label htmlFor="deliveryReports">Enable delivery reports</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}