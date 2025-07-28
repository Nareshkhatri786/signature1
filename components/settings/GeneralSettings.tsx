import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';

interface GeneralSettingsProps {
  settings: any;
  onSettingsChange: (settings: any) => void;
}

export default function GeneralSettings({ settings, onSettingsChange }: GeneralSettingsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => onSettingsChange({...settings, companyName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={settings.timezone} onValueChange={(value) => onSettingsChange({...settings, timezone: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select value={settings.dateFormat} onValueChange={(value) => onSettingsChange({...settings, dateFormat: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={settings.currency} onValueChange={(value) => onSettingsChange({...settings, currency: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Hours & Working Days</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Working Hours</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={settings.workingHours.start}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    workingHours: { ...settings.workingHours, start: e.target.value }
                  })}
                />
                <span>to</span>
                <Input
                  type="time"
                  value={settings.workingHours.end}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    workingHours: { ...settings.workingHours, end: e.target.value }
                  })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fiscal Year Start</Label>
              <Select value={settings.fiscalYearStart} onValueChange={(value) => onSettingsChange({...settings, fiscalYearStart: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="January">January</SelectItem>
                  <SelectItem value="April">April</SelectItem>
                  <SelectItem value="July">July</SelectItem>
                  <SelectItem value="October">October</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lead & Opportunity Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leadAgingDays">Lead Aging (Days)</Label>
              <Input
                id="leadAgingDays"
                type="number"
                value={settings.leadAgingDays}
                onChange={(e) => onSettingsChange({...settings, leadAgingDays: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opportunityAgingDays">Opportunity Aging (Days)</Label>
              <Input
                id="opportunityAgingDays"
                type="number"
                value={settings.opportunityAgingDays}
                onChange={(e) => onSettingsChange({...settings, opportunityAgingDays: parseInt(e.target.value)})}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="autoAssignLeads"
              checked={settings.autoAssignLeads}
              onCheckedChange={(checked) => onSettingsChange({...settings, autoAssignLeads: checked})}
            />
            <Label htmlFor="autoAssignLeads">Auto-assign new leads to team members</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}