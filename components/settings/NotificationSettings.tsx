import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Monitor, Clock, Volume2, Check, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';

interface NotificationSettings {
  email: {
    enabled: boolean;
    newLeads: boolean;
    missedCalls: boolean;
    followUpReminders: boolean;
    siteVisitReminders: boolean;
    dealUpdates: boolean;
    dailyReports: boolean;
    weeklyReports: boolean;
    smtpServer: string;
    smtpPort: string;
    smtpUsername: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  sms: {
    enabled: boolean;
    newLeads: boolean;
    followUpReminders: boolean;
    siteVisitReminders: boolean;
    dealClosing: boolean;
    provider: 'twilio' | 'nexmo' | 'msg91' | 'custom';
    apiKey: string;
    apiSecret: string;
    senderId: string;
    templates: {
      newLead: string;
      followUp: string;
      siteVisit: string;
      dealClosing: string;
    };
  };
  whatsapp: {
    enabled: boolean;
    newLeads: boolean;
    followUpReminders: boolean;
    siteVisitReminders: boolean;
    dealUpdates: boolean;
    nurturingCampaigns: boolean;
    businessApiProvider: 'meta' | 'twilio' | 'custom';
    phoneNumberId: string;
    accessToken: string;
    webhookVerifyToken: string;
    templates: {
      newLead: string;
      followUp: string;
      siteVisit: string;
      dealUpdate: string;
      nurturing: string;
    };
  };
  inApp: {
    enabled: boolean;
    newLeads: boolean;
    followUpReminders: boolean;
    siteVisitReminders: boolean;
    dealUpdates: boolean;
    teamUpdates: boolean;
    systemAlerts: boolean;
    sound: boolean;
    desktop: boolean;
    frequency: 'immediate' | 'hourly' | 'daily';
  };
  general: {
    timezone: string;
    quietHours: {
      enabled: boolean;
      startTime: string;
      endTime: string;
    };
    workingDays: string[];
    escalation: {
      enabled: boolean;
      followUpDelay: number;
      escalateToManager: boolean;
    };
  };
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  email: {
    enabled: true,
    newLeads: true,
    missedCalls: true,
    followUpReminders: true,
    siteVisitReminders: true,
    dealUpdates: true,
    dailyReports: false,
    weeklyReports: true,
    smtpServer: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: 'noreply@signatureproperties.com',
    fromName: 'Signature Properties CRM'
  },
  sms: {
    enabled: false,
    newLeads: true,
    followUpReminders: true,
    siteVisitReminders: true,
    dealClosing: true,
    provider: 'twilio',
    apiKey: '',
    apiSecret: '',
    senderId: 'SignProp',
    templates: {
      newLead: 'Hi {name}, thank you for your interest in {project}. Our team will contact you shortly.',
      followUp: 'Hi {name}, this is a follow-up regarding your interest in {project}. Let us know if you have any questions.',
      siteVisit: 'Hi {name}, your site visit for {project} is scheduled on {date} at {time}. See you there!',
      dealClosing: 'Hi {name}, congratulations! Your booking for {project} is confirmed. Welcome to the family!'
    }
  },
  whatsapp: {
    enabled: true,
    newLeads: true,
    followUpReminders: true,
    siteVisitReminders: true,
    dealUpdates: true,
    nurturingCampaigns: true,
    businessApiProvider: 'meta',
    phoneNumberId: '',
    accessToken: '',
    webhookVerifyToken: '',
    templates: {
      newLead: 'signature_properties_new_lead',
      followUp: 'signature_properties_follow_up',
      siteVisit: 'signature_properties_site_visit',
      dealUpdate: 'signature_properties_deal_update',
      nurturing: 'signature_properties_nurturing'
    }
  },
  inApp: {
    enabled: true,
    newLeads: true,
    followUpReminders: true,
    siteVisitReminders: true,
    dealUpdates: true,
    teamUpdates: true,
    systemAlerts: true,
    sound: true,
    desktop: true,
    frequency: 'immediate'
  },
  general: {
    timezone: 'Asia/Kolkata',
    quietHours: {
      enabled: true,
      startTime: '22:00',
      endTime: '08:00'
    },
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    escalation: {
      enabled: true,
      followUpDelay: 24,
      escalateToManager: true
    }
  }
};

interface NotificationSettingsProps {
  settings?: NotificationSettings;
  onSettingsChange?: (settings: NotificationSettings) => void;
}

export default function NotificationSettings({ settings, onSettingsChange }: NotificationSettingsProps) {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(
    settings || DEFAULT_NOTIFICATION_SETTINGS
  );
  const [activeTab, setActiveTab] = useState('email');
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setNotificationSettings(settings);
    }
  }, [settings]);

  const handleSettingsChange = (newSettings: NotificationSettings) => {
    setNotificationSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const updateSettings = (path: string[], value: any) => {
    const newSettings = { ...notificationSettings };
    let current: any = newSettings;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    
    handleSettingsChange(newSettings);
  };

  const testConnection = async (provider: 'email' | 'sms' | 'whatsapp') => {
    setTestingProvider(provider);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setTestingProvider(null);
    
    // Show success toast
    if (window.showToast) {
      window.showToast(`${provider.toUpperCase()} connection test successful!`, 'success');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Notification Settings</h2>
          <p className="text-muted-foreground">Configure how you receive notifications and alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Check className="h-3 w-3" />
            Auto-save enabled
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            SMS
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="inapp" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            In-App
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            General
          </TabsTrigger>
        </TabsList>

        {/* Email Notifications */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Notifications
                  </CardTitle>
                  <CardDescription>Configure email notification preferences and SMTP settings</CardDescription>
                </div>
                <Switch
                  checked={notificationSettings.email.enabled}
                  onCheckedChange={(checked) => updateSettings(['email', 'enabled'], checked)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Events */}
              <div className="space-y-4">
                <h4>Email Notifications For:</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'newLeads', label: 'New Leads' },
                    { key: 'missedCalls', label: 'Missed Calls' },
                    { key: 'followUpReminders', label: 'Follow Up Reminders' },
                    { key: 'siteVisitReminders', label: 'Site Visit Reminders' },
                    { key: 'dealUpdates', label: 'Deal Updates' },
                    { key: 'dailyReports', label: 'Daily Reports' },
                    { key: 'weeklyReports', label: 'Weekly Reports' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <Label htmlFor={`email-${item.key}`}>{item.label}</Label>
                      <Switch
                        id={`email-${item.key}`}
                        checked={notificationSettings.email[item.key as keyof typeof notificationSettings.email] as boolean}
                        onCheckedChange={(checked) => updateSettings(['email', item.key], checked)}
                        disabled={!notificationSettings.email.enabled}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* SMTP Configuration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4>SMTP Configuration</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => testConnection('email')}
                    disabled={testingProvider === 'email'}
                  >
                    {testingProvider === 'email' ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-server">SMTP Server</Label>
                    <Input
                      id="smtp-server"
                      placeholder="smtp.gmail.com"
                      value={notificationSettings.email.smtpServer}
                      onChange={(e) => updateSettings(['email', 'smtpServer'], e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">SMTP Port</Label>
                    <Input
                      id="smtp-port"
                      placeholder="587"
                      value={notificationSettings.email.smtpPort}
                      onChange={(e) => updateSettings(['email', 'smtpPort'], e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-username">Username</Label>
                    <Input
                      id="smtp-username"
                      placeholder="your-email@gmail.com"
                      value={notificationSettings.email.smtpUsername}
                      onChange={(e) => updateSettings(['email', 'smtpUsername'], e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-password">Password</Label>
                    <Input
                      id="smtp-password"
                      type="password"
                      placeholder="App Password"
                      value={notificationSettings.email.smtpPassword}
                      onChange={(e) => updateSettings(['email', 'smtpPassword'], e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="from-email">From Email</Label>
                    <Input
                      id="from-email"
                      placeholder="noreply@signatureproperties.com"
                      value={notificationSettings.email.fromEmail}
                      onChange={(e) => updateSettings(['email', 'fromEmail'], e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="from-name">From Name</Label>
                    <Input
                      id="from-name"
                      placeholder="Signature Properties CRM"
                      value={notificationSettings.email.fromName}
                      onChange={(e) => updateSettings(['email', 'fromName'], e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS Notifications */}
        <TabsContent value="sms" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    SMS Notifications
                  </CardTitle>
                  <CardDescription>Configure SMS notification preferences and provider settings</CardDescription>
                </div>
                <Switch
                  checked={notificationSettings.sms.enabled}
                  onCheckedChange={(checked) => updateSettings(['sms', 'enabled'], checked)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* SMS Events */}
              <div className="space-y-4">
                <h4>SMS Notifications For:</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'newLeads', label: 'New Leads' },
                    { key: 'followUpReminders', label: 'Follow Up Reminders' },
                    { key: 'siteVisitReminders', label: 'Site Visit Reminders' },
                    { key: 'dealClosing', label: 'Deal Closing' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <Label htmlFor={`sms-${item.key}`}>{item.label}</Label>
                      <Switch
                        id={`sms-${item.key}`}
                        checked={notificationSettings.sms[item.key as keyof typeof notificationSettings.sms] as boolean}
                        onCheckedChange={(checked) => updateSettings(['sms', item.key], checked)}
                        disabled={!notificationSettings.sms.enabled}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* SMS Provider Configuration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4>SMS Provider Configuration</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => testConnection('sms')}
                    disabled={testingProvider === 'sms'}
                  >
                    {testingProvider === 'sms' ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sms-provider">SMS Provider</Label>
                    <Select
                      value={notificationSettings.sms.provider}
                      onValueChange={(value: any) => updateSettings(['sms', 'provider'], value)}
                    >
                      <SelectTrigger id="sms-provider">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twilio">Twilio</SelectItem>
                        <SelectItem value="nexmo">Vonage (Nexmo)</SelectItem>
                        <SelectItem value="msg91">MSG91</SelectItem>
                        <SelectItem value="custom">Custom API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sms-sender-id">Sender ID</Label>
                    <Input
                      id="sms-sender-id"
                      placeholder="SignProp"
                      value={notificationSettings.sms.senderId}
                      onChange={(e) => updateSettings(['sms', 'senderId'], e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sms-api-key">API Key</Label>
                    <Input
                      id="sms-api-key"
                      type="password"
                      placeholder="Your API Key"
                      value={notificationSettings.sms.apiKey}
                      onChange={(e) => updateSettings(['sms', 'apiKey'], e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sms-api-secret">API Secret</Label>
                    <Input
                      id="sms-api-secret"
                      type="password"
                      placeholder="Your API Secret"
                      value={notificationSettings.sms.apiSecret}
                      onChange={(e) => updateSettings(['sms', 'apiSecret'], e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* SMS Templates */}
              <div className="space-y-4">
                <h4>SMS Templates</h4>
                <div className="space-y-4">
                  {Object.entries(notificationSettings.sms.templates).map(([key, template]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={`sms-template-${key}`} className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                      <Textarea
                        id={`sms-template-${key}`}
                        placeholder={`${key} SMS template`}
                        value={template}
                        onChange={(e) => updateSettings(['sms', 'templates', key], e.target.value)}
                        rows={2}
                      />
                      <p className="text-xs text-muted-foreground">
                        Available variables: {'{name}'}, {'{project}'}, {'{date}'}, {'{time}'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Notifications */}
        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    WhatsApp Business API
                  </CardTitle>
                  <CardDescription>Configure WhatsApp Business API for automated messaging</CardDescription>
                </div>
                <Switch
                  checked={notificationSettings.whatsapp.enabled}
                  onCheckedChange={(checked) => updateSettings(['whatsapp', 'enabled'], checked)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* WhatsApp Events */}
              <div className="space-y-4">
                <h4>WhatsApp Messages For:</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'newLeads', label: 'New Lead Welcome' },
                    { key: 'followUpReminders', label: 'Follow Up Reminders' },
                    { key: 'siteVisitReminders', label: 'Site Visit Reminders' },
                    { key: 'dealUpdates', label: 'Deal Updates' },
                    { key: 'nurturingCampaigns', label: 'Nurturing Campaigns' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <Label htmlFor={`whatsapp-${item.key}`}>{item.label}</Label>
                      <Switch
                        id={`whatsapp-${item.key}`}
                        checked={notificationSettings.whatsapp[item.key as keyof typeof notificationSettings.whatsapp] as boolean}
                        onCheckedChange={(checked) => updateSettings(['whatsapp', item.key], checked)}
                        disabled={!notificationSettings.whatsapp.enabled}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* WhatsApp Business API Configuration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4>WhatsApp Business API Configuration</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => testConnection('whatsapp')}
                    disabled={testingProvider === 'whatsapp'}
                  >
                    {testingProvider === 'whatsapp' ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-provider">API Provider</Label>
                    <Select
                      value={notificationSettings.whatsapp.businessApiProvider}
                      onValueChange={(value: any) => updateSettings(['whatsapp', 'businessApiProvider'], value)}
                    >
                      <SelectTrigger id="whatsapp-provider">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meta">Meta (Facebook)</SelectItem>
                        <SelectItem value="twilio">Twilio WhatsApp API</SelectItem>
                        <SelectItem value="custom">Custom Provider</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-phone-id">Phone Number ID</Label>
                    <Input
                      id="whatsapp-phone-id"
                      placeholder="Your WhatsApp Phone Number ID"
                      value={notificationSettings.whatsapp.phoneNumberId}
                      onChange={(e) => updateSettings(['whatsapp', 'phoneNumberId'], e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="whatsapp-access-token">Access Token</Label>
                    <Input
                      id="whatsapp-access-token"
                      type="password"
                      placeholder="Your WhatsApp Business API Access Token"
                      value={notificationSettings.whatsapp.accessToken}
                      onChange={(e) => updateSettings(['whatsapp', 'accessToken'], e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="whatsapp-webhook-token">Webhook Verify Token</Label>
                    <Input
                      id="whatsapp-webhook-token"
                      placeholder="Webhook verification token"
                      value={notificationSettings.whatsapp.webhookVerifyToken}
                      onChange={(e) => updateSettings(['whatsapp', 'webhookVerifyToken'], e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* WhatsApp Message Templates */}
              <div className="space-y-4">
                <h4>WhatsApp Message Templates</h4>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Template Approval Required</p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                        WhatsApp message templates must be approved by Meta before use. Enter your approved template names below.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {Object.entries(notificationSettings.whatsapp.templates).map(([key, template]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={`whatsapp-template-${key}`} className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1')} Template Name
                      </Label>
                      <Input
                        id={`whatsapp-template-${key}`}
                        placeholder={`${key.toLowerCase()}_template_name`}
                        value={template}
                        onChange={(e) => updateSettings(['whatsapp', 'templates', key], e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* In-App Notifications */}
        <TabsContent value="inapp" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    In-App Notifications
                  </CardTitle>
                  <CardDescription>Configure browser and desktop notification preferences</CardDescription>
                </div>
                <Switch
                  checked={notificationSettings.inApp.enabled}
                  onCheckedChange={(checked) => updateSettings(['inApp', 'enabled'], checked)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* In-App Events */}
              <div className="space-y-4">
                <h4>Show In-App Notifications For:</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'newLeads', label: 'New Leads' },
                    { key: 'followUpReminders', label: 'Follow Up Reminders' },
                    { key: 'siteVisitReminders', label: 'Site Visit Reminders' },
                    { key: 'dealUpdates', label: 'Deal Updates' },
                    { key: 'teamUpdates', label: 'Team Updates' },
                    { key: 'systemAlerts', label: 'System Alerts' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <Label htmlFor={`inapp-${item.key}`}>{item.label}</Label>
                      <Switch
                        id={`inapp-${item.key}`}
                        checked={notificationSettings.inApp[item.key as keyof typeof notificationSettings.inApp] as boolean}
                        onCheckedChange={(checked) => updateSettings(['inApp', item.key], checked)}
                        disabled={!notificationSettings.inApp.enabled}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* In-App Preferences */}
              <div className="space-y-4">
                <h4>Notification Preferences</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound-enabled">Sound Notifications</Label>
                    <Switch
                      id="sound-enabled"
                      checked={notificationSettings.inApp.sound}
                      onCheckedChange={(checked) => updateSettings(['inApp', 'sound'], checked)}
                      disabled={!notificationSettings.inApp.enabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="desktop-enabled">Desktop Notifications</Label>
                    <Switch
                      id="desktop-enabled"
                      checked={notificationSettings.inApp.desktop}
                      onCheckedChange={(checked) => updateSettings(['inApp', 'desktop'], checked)}
                      disabled={!notificationSettings.inApp.enabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notification-frequency">Notification Frequency</Label>
                    <Select
                      value={notificationSettings.inApp.frequency}
                      onValueChange={(value: any) => updateSettings(['inApp', 'frequency'], value)}
                      disabled={!notificationSettings.inApp.enabled}
                    >
                      <SelectTrigger id="notification-frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="hourly">Hourly Digest</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                General Notification Settings
              </CardTitle>
              <CardDescription>Configure global notification preferences and schedules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timezone */}
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={notificationSettings.general.timezone}
                  onValueChange={(value) => updateSettings(['general', 'timezone'], value)}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (UTC+05:30)</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (UTC-05:00)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (UTC+00:00)</SelectItem>
                    <SelectItem value="Asia/Dubai">Asia/Dubai (UTC+04:00)</SelectItem>
                    <SelectItem value="Asia/Singapore">Asia/Singapore (UTC+08:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Quiet Hours */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4>Quiet Hours</h4>
                    <p className="text-sm text-muted-foreground">Disable notifications during specific hours</p>
                  </div>
                  <Switch
                    checked={notificationSettings.general.quietHours.enabled}
                    onCheckedChange={(checked) => updateSettings(['general', 'quietHours', 'enabled'], checked)}
                  />
                </div>
                {notificationSettings.general.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quiet-start">Start Time</Label>
                      <Input
                        id="quiet-start"
                        type="time"
                        value={notificationSettings.general.quietHours.startTime}
                        onChange={(e) => updateSettings(['general', 'quietHours', 'startTime'], e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quiet-end">End Time</Label>
                      <Input
                        id="quiet-end"
                        type="time"
                        value={notificationSettings.general.quietHours.endTime}
                        onChange={(e) => updateSettings(['general', 'quietHours', 'endTime'], e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Working Days */}
              <div className="space-y-4">
                <h4>Working Days</h4>
                <p className="text-sm text-muted-foreground">Select days when notifications should be sent</p>
                <div className="grid grid-cols-3 gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                    const dayKey = day.toLowerCase();
                    const isSelected = notificationSettings.general.workingDays.includes(dayKey);
                    return (
                      <Button
                        key={day}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          const currentDays = notificationSettings.general.workingDays;
                          const newDays = isSelected 
                            ? currentDays.filter(d => d !== dayKey)
                            : [...currentDays, dayKey];
                          updateSettings(['general', 'workingDays'], newDays);
                        }}
                      >
                        {day.slice(0, 3)}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Escalation Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4>Escalation Settings</h4>
                    <p className="text-sm text-muted-foreground">Auto-escalate missed follow-ups to managers</p>
                  </div>
                  <Switch
                    checked={notificationSettings.general.escalation.enabled}
                    onCheckedChange={(checked) => updateSettings(['general', 'escalation', 'enabled'], checked)}
                  />
                </div>
                {notificationSettings.general.escalation.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="escalation-delay">Escalation Delay (hours)</Label>
                      <Input
                        id="escalation-delay"
                        type="number"
                        min="1"
                        max="168"
                        value={notificationSettings.general.escalation.followUpDelay}
                        onChange={(e) => updateSettings(['general', 'escalation', 'followUpDelay'], parseInt(e.target.value))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="escalate-manager">Escalate to Manager</Label>
                      <Switch
                        id="escalate-manager"
                        checked={notificationSettings.general.escalation.escalateToManager}
                        onCheckedChange={(checked) => updateSettings(['general', 'escalation', 'escalateToManager'], checked)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}