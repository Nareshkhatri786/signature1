import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { useCrm } from './CrmContext';
import { toast } from 'sonner@2.0.3';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Plus, 
  Clock, 
  Check, 
  CheckCheck,
  Users,
  TrendingUp,
  Eye,
  Settings,
  Edit,
  Trash2,
  Copy,
  FileText,
  Image,
  Paperclip,
  Play,
  ChevronUp,
  ChevronDown,
  Shuffle,
  Target
} from 'lucide-react';

interface WhatsAppModuleProps {
  user: any;
}

// Mock WhatsApp data
const mockCampaigns = [
  {
    id: 1,
    name: 'Welcome Series - Signature Heights',
    status: 'Active',
    totalRecipients: 45,
    messagesSent: 135,
    delivered: 128,
    read: 94,
    replies: 23,
    createdAt: new Date('2024-01-15'),
    lastSent: new Date('2024-01-21T10:30:00')
  },
  {
    id: 2,
    name: 'Follow-up Campaign - Gardens',
    status: 'Active',
    totalRecipients: 32,
    messagesSent: 64,
    delivered: 62,
    read: 41,
    replies: 15,
    createdAt: new Date('2024-01-18'),
    lastSent: new Date('2024-01-21T09:15:00')
  },
  {
    id: 3,
    name: 'Price Update - Plaza',
    status: 'Completed',
    totalRecipients: 28,
    messagesSent: 28,
    delivered: 27,
    read: 24,
    replies: 8,
    createdAt: new Date('2024-01-20'),
    lastSent: new Date('2024-01-20T16:00:00')
  }
];

const mockConversations = [
  {
    id: 1,
    contactName: 'Raj Patel',
    contactPhone: '+91 9876543210',
    lastMessage: 'Thank you for the information',
    lastMessageTime: new Date('2024-01-21T14:30:00'),
    unreadCount: 0,
    status: 'Active',
    leadId: 1,
    projectName: 'Signature Heights'
  },
  {
    id: 2,
    contactName: 'Priya Sharma',
    contactPhone: '+91 9876543211',
    lastMessage: 'When can we schedule a visit?',
    lastMessageTime: new Date('2024-01-21T16:45:00'),
    unreadCount: 2,
    status: 'Pending',
    leadId: 2,
    projectName: 'Signature Gardens'
  },
  {
    id: 3,
    contactName: 'Amit Gupta',
    contactPhone: '+91 9876543212',
    lastMessage: 'I am interested in the 3BHK unit',
    lastMessageTime: new Date('2024-01-21T12:20:00'),
    unreadCount: 1,
    status: 'Hot',
    leadId: 3,
    projectName: 'Signature Heights'
  }
];

// Mock templates with comprehensive data
const initialTemplates = [
  {
    id: 1,
    name: 'Welcome Message',
    body: 'Welcome to &#123;&#123;project&#125;&#125;! Thank you for your interest. I\'m &#123;&#123;agent&#125;&#125; and I\'ll be assisting you with your property requirements.',
    tags: ['Week 1', 'Welcome'],
    type: 'Text',
    mediaPath: null,
    createdBy: 'Admin',
    projectSpecific: false,
    projectIds: [],
    replyRate: 0.85,
    usageCount: 156
  },
  {
    id: 2,
    name: 'Follow-up Day 3',
    body: 'Hi &#123;&#123;name&#125;&#125;, I wanted to follow up on your interest in &#123;&#123;project&#125;&#125;. Do you have any specific questions about the amenities or pricing?',
    tags: ['Week 1', 'Follow-up'],
    type: 'Text',
    mediaPath: null,
    createdBy: 'Admin',
    projectSpecific: false,
    projectIds: [],
    replyRate: 0.72,
    usageCount: 134
  },
  {
    id: 3,
    name: 'Site Visit Reminder',
    body: 'Hi &#123;&#123;name&#125;&#125;, this is a reminder about your site visit to &#123;&#123;project&#125;&#125; scheduled for &#123;&#123;date&#125;&#125; at &#123;&#123;time&#125;&#125;. Looking forward to meeting you!',
    tags: ['Visit Reminder', 'Opportunity'],
    type: 'Text',
    mediaPath: null,
    createdBy: 'Admin',
    projectSpecific: false,
    projectIds: [],
    replyRate: 0.91,
    usageCount: 89
  },
  {
    id: 4,
    name: 'Price Update Notification',
    body: 'Exciting news &#123;&#123;name&#125;&#125;! We have updated pricing for &#123;&#123;project&#125;&#125;. Please find the latest price sheet attached.',
    tags: ['Week 2', 'Pricing'],
    type: 'Media',
    mediaPath: 'price_sheet.pdf',
    createdBy: 'Admin',
    projectSpecific: true,
    projectIds: [1, 2],
    replyRate: 0.68,
    usageCount: 67
  },
  {
    id: 5,
    name: 'Monthly Newsletter',
    body: 'Hi &#123;&#123;name&#125;&#125;, here\'s what\'s happening at &#123;&#123;project&#125;&#125; this month. Construction progress, new amenities, and upcoming events!',
    tags: ['Month 2+', 'Newsletter'],
    type: 'Media',
    mediaPath: 'newsletter.jpg',
    createdBy: 'Admin',
    projectSpecific: false,
    projectIds: [],
    replyRate: 0.45,
    usageCount: 234
  }
];

// Mock nurture flow configuration
const initialNurtureFlow = [
  {
    week: 'Week 1',
    frequency: 3,
    templateIds: [1, 2],
    delayDays: [0, 2, 5],
    enabled: true
  },
  {
    week: 'Week 2', 
    frequency: 2,
    templateIds: [4],
    delayDays: [0, 4],
    enabled: true
  },
  {
    week: 'Week 3-4',
    frequency: 1,
    templateIds: [5],
    delayDays: [0],
    enabled: true
  },
  {
    week: 'Month 2+',
    frequency: 1,
    templateIds: [5],
    delayDays: [0],
    enabled: true
  }
];

export function WhatsAppModule({ user }: WhatsAppModuleProps) {
  const { setShowWhatsAppModal, projects } = useCrm();
  const [activeTab, setActiveTab] = useState('conversations');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCampaignDetails, setShowCampaignDetails] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  
  // Template Management States
  const [templates, setTemplates] = useState(initialTemplates);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    body: '',
    tags: [] as string[],
    type: 'Text',
    projectSpecific: false,
    projectIds: [] as number[]
  });
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState({
    name: 'Raj Patel',
    project: 'Signature Heights',
    agent: 'Sarah Wilson',
    date: '25th Jan 2024',
    time: '2:00 PM'
  });

  // Nurture Flow States
  const [nurtureFlow, setNurtureFlow] = useState(initialNurtureFlow);
  const [showNurtureModal, setShowNurtureModal] = useState(false);
  const [editingNurture, setEditingNurture] = useState<any>(null);

  const filteredConversations = mockConversations.filter(conv =>
    conv.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.contactPhone.includes(searchTerm) ||
    conv.projectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Hot': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Text': return <FileText className="w-4 h-4" />;
      case 'Media': return <Image className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const handleViewCampaign = (campaign: any) => {
    setSelectedCampaign(campaign);
    setShowCampaignDetails(true);
  };

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({
      name: '',
      body: '',
      tags: [],
      type: 'Text',
      projectSpecific: false,
      projectIds: []
    });
    setShowTemplateModal(true);
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      body: template.body,
      tags: template.tags,
      type: template.type,
      projectSpecific: template.projectSpecific,
      projectIds: template.projectIds
    });
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = () => {
    if (!templateForm.name || !templateForm.body) {
      toast.error('Please fill in all required fields');
      return;
    }

    const templateData = {
      ...templateForm,
      id: editingTemplate ? editingTemplate.id : Date.now(),
      createdBy: user.name,
      replyRate: editingTemplate ? editingTemplate.replyRate : 0,
      usageCount: editingTemplate ? editingTemplate.usageCount : 0,
      mediaPath: templateForm.type === 'Media' ? 'uploaded_file.pdf' : null
    };

    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? templateData : t));
      toast.success('Template updated successfully');
    } else {
      setTemplates([...templates, templateData]);
      toast.success('Template created successfully');
    }

    setShowTemplateModal(false);
  };

  const handleDeleteTemplate = (templateId: number) => {
    setTemplates(templates.filter(t => t.id !== templateId));
    toast.success('Template deleted successfully');
  };

  const handleDuplicateTemplate = (template: any) => {
    const duplicated = {
      ...template,
      id: Date.now(),
      name: `${template.name} (Copy)`,
      usageCount: 0
    };
    setTemplates([...templates, duplicated]);
    toast.success('Template duplicated successfully');
  };

  const renderPreview = (body: string) => {
    let preview = body;
    Object.entries(previewData).forEach(([key, value]) => {
      const regex = new RegExp(`&#123;&#123;${key}&#125;&#125;`, 'g');
      preview = preview.replace(regex, value);
    });
    return preview;
  };

  const handleConfigureNurture = (flow: any) => {
    setEditingNurture(flow);
    setShowNurtureModal(true);
  };

  const totalStats = {
    messagesSent: mockCampaigns.reduce((sum, c) => sum + c.messagesSent, 0),
    delivered: mockCampaigns.reduce((sum, c) => sum + c.delivered, 0),
    read: mockCampaigns.reduce((sum, c) => sum + c.read, 0),
    replies: mockCampaigns.reduce((sum, c) => sum + c.replies, 0)
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">WhatsApp Management</h1>
          <p className="text-muted-foreground">
            Manage templates, campaigns, conversations, and nurturing flows
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowWhatsAppModal(true)}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Open Chat
          </Button>
          <Button variant="outline" onClick={handleAddTemplate}>
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Messages Sent</p>
                <p className="text-2xl font-bold">{totalStats.messagesSent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold">{totalStats.delivered}</p>
                <p className="text-sm text-green-600">
                  {((totalStats.delivered / totalStats.messagesSent) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCheck className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Read</p>
                <p className="text-2xl font-bold">{totalStats.read}</p>
                <p className="text-sm text-purple-600">
                  {((totalStats.read / totalStats.delivered) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Replies</p>
                <p className="text-2xl font-bold">{totalStats.replies}</p>
                <p className="text-sm text-orange-600">
                  {((totalStats.replies / totalStats.read) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="nurture">Nurture Flow</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardContent>
          </Card>

          {/* Conversations List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredConversations.map(conv => (
              <Card key={conv.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {conv.contactName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{conv.contactName}</p>
                        <p className="text-sm text-muted-foreground">{conv.contactPhone}</p>
                        <p className="text-sm text-muted-foreground">{conv.projectName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(conv.status)}>
                        {conv.status}
                      </Badge>
                      {conv.unreadCount > 0 && (
                        <Badge variant="default" className="h-5 w-5 text-xs rounded-full p-0 flex items-center justify-center">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm truncate">{conv.lastMessage}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {conv.lastMessageTime.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
                    <Eye className="w-4 h-4 mr-2" />
                    {showPreview ? 'Hide' : 'Show'} Preview
                  </Button>
                  <Button onClick={handleAddTemplate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTemplates.map(template => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(template.type)}
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          by {template.createdBy} • Used {template.usageCount} times
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEditTemplate(template)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDuplicateTemplate(template)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteTemplate(template.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                      {template.projectSpecific && (
                        <Badge variant="secondary">Project Specific</Badge>
                      )}
                    </div>

                    <div className="text-sm bg-muted p-3 rounded-md">
                      {showPreview ? renderPreview(template.body) : template.body}
                    </div>

                    {template.mediaPath && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Paperclip className="w-3 h-3" />
                        {template.mediaPath}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">Reply Rate:</span>
                        <span className="font-medium">{(template.replyRate * 100).toFixed(1)}%</span>
                      </div>
                      <Button size="sm" variant="outline">
                        <Play className="w-3 h-3 mr-1" />
                        Use Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="nurture" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nurture Flow Configuration</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure automatic message sequences for lead nurturing
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {nurtureFlow.map((flow, index) => (
                <div key={flow.week} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{flow.week}</h3>
                      <Badge variant={flow.enabled ? "default" : "secondary"}>
                        {flow.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleConfigureNurture(flow)}>
                        <Settings className="w-3 h-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Messages per week</p>
                      <p className="font-medium">{flow.frequency}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Assigned Templates</p>
                      <p className="font-medium">{flow.templateIds.length} templates</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Delay Schedule</p>
                      <p className="font-medium">{flow.delayDays.join(', ')} days</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Assigned Templates:</p>
                    <div className="flex flex-wrap gap-2">
                      {flow.templateIds.map(templateId => {
                        const template = templates.find(t => t.id === templateId);
                        return template ? (
                          <Badge key={templateId} variant="outline">
                            {template.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h4 className="font-medium mb-2">A/B Testing</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Test different templates to optimize engagement rates
                </p>
                <Button size="sm" variant="outline">
                  <Shuffle className="w-3 h-3 mr-1" />
                  Enable A/B Testing
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {mockCampaigns.map(campaign => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium">{campaign.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Created: {campaign.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Recipients</p>
                      <p className="font-medium">{campaign.totalRecipients}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Messages Sent</p>
                      <p className="font-medium">{campaign.messagesSent}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Delivered</p>
                      <p className="font-medium">{campaign.delivered}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Replies</p>
                      <p className="font-medium">{campaign.replies}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Last sent: {campaign.lastSent.toLocaleString()}
                    </p>
                    <Button variant="outline" size="sm" onClick={() => handleViewCampaign(campaign)}>
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
            <DialogDescription>
              Create or modify WhatsApp message templates with variable support.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  placeholder="Enter template name"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="template-type">Type</Label>
                <Select value={templateForm.type} onValueChange={(value) => 
                  setTemplateForm({...templateForm, type: value})
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Text">Text Only</SelectItem>
                    <SelectItem value="Media">Text + Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="template-body">Message Body</Label>
              <Textarea
                id="template-body"
                placeholder="Enter your message. Use {{name}}, {{project}}, {{agent}}, {{date}}, {{time}} for variables"
                value={templateForm.body}
                onChange={(e) => setTemplateForm({...templateForm, body: e.target.value})}
                rows={4}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Available variables: &#123;&#123;name&#125;&#125;, &#123;&#123;project&#125;&#125;, &#123;&#123;agent&#125;&#125;, &#123;&#123;date&#125;&#125;, &#123;&#123;time&#125;&#125;
              </p>
            </div>

            {templateForm.type === 'Media' && (
              <div>
                <Label>Attach Media</Label>
                <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                  <Paperclip className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload image or PDF (Max 25MB)
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Choose File
                  </Button>
                </div>
              </div>
            )}

            <div>
              <Label>Tags</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {['Week 1', 'Week 2', 'Week 3', 'Week 3-4', 'Month 2+', 'Welcome', 'Follow-up', 'Visit Reminder', 'Opportunity', 'Pricing', 'Newsletter'].map(tag => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={tag}
                      checked={templateForm.tags.includes(tag)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setTemplateForm({...templateForm, tags: [...templateForm.tags, tag]});
                        } else {
                          setTemplateForm({...templateForm, tags: templateForm.tags.filter(t => t !== tag)});
                        }
                      }}
                    />
                    <label htmlFor={tag} className="text-sm">{tag}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="project-specific"
                  checked={templateForm.projectSpecific}
                  onCheckedChange={(checked) => 
                    setTemplateForm({...templateForm, projectSpecific: !!checked})
                  }
                />
                <label htmlFor="project-specific" className="text-sm">
                  Project-specific template
                </label>
              </div>

              {templateForm.projectSpecific && (
                <div>
                  <Label>Select Projects</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {projects.map(project => (
                      <div key={project.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`project-${project.id}`}
                          checked={templateForm.projectIds.includes(project.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setTemplateForm({
                                ...templateForm, 
                                projectIds: [...templateForm.projectIds, project.id]
                              });
                            } else {
                              setTemplateForm({
                                ...templateForm, 
                                projectIds: templateForm.projectIds.filter(id => id !== project.id)
                              });
                            }
                          }}
                        />
                        <label htmlFor={`project-${project.id}`} className="text-sm">
                          {project.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {templateForm.body && (
              <div>
                <Label>Live Preview</Label>
                <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border mt-2">
                  <p className="text-sm">{renderPreview(templateForm.body)}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              {editingTemplate ? 'Update' : 'Create'} Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Campaign Details Modal */}
      <Dialog open={showCampaignDetails} onOpenChange={setShowCampaignDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Campaign Details</DialogTitle>
            <DialogDescription>
              Detailed analytics and information about the selected WhatsApp campaign.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCampaign && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium">{selectedCampaign.name}</h3>
                  <p className="text-muted-foreground">
                    Created: {selectedCampaign.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <Badge className={getStatusColor(selectedCampaign.status)}>
                  {selectedCampaign.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Campaign Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Recipients:</span>
                      <span className="font-medium">{selectedCampaign.totalRecipients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Messages Sent:</span>
                      <span className="font-medium">{selectedCampaign.messagesSent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivered:</span>
                      <span className="font-medium">{selectedCampaign.delivered}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Read:</span>
                      <span className="font-medium">{selectedCampaign.read}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Replies:</span>
                      <span className="font-medium">{selectedCampaign.replies}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Performance Rates</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Delivery Rate:</span>
                      <span className="font-medium">
                        {((selectedCampaign.delivered / selectedCampaign.messagesSent) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Read Rate:</span>
                      <span className="font-medium">
                        {((selectedCampaign.read / selectedCampaign.delivered) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reply Rate:</span>
                      <span className="font-medium">
                        {((selectedCampaign.replies / selectedCampaign.read) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCampaignDetails(false)}>
              Close
            </Button>
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              Edit Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nurture Flow Configuration Modal */}
      <Dialog open={showNurtureModal} onOpenChange={setShowNurtureModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Configure Nurture Flow</DialogTitle>
            <DialogDescription>
              Set up automatic message sequences and timing for lead nurturing.
            </DialogDescription>
          </DialogHeader>
          
          {editingNurture && (
            <div className="space-y-6">
              <div>
                <Label>Week: {editingNurture.week}</Label>
              </div>

              <div>
                <Label htmlFor="frequency">Messages per week</Label>
                <Select defaultValue={editingNurture.frequency.toString()}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 message</SelectItem>
                    <SelectItem value="2">2 messages</SelectItem>
                    <SelectItem value="3">3 messages</SelectItem>
                    <SelectItem value="4">4 messages</SelectItem>
                    <SelectItem value="5">5 messages</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Assign Templates</Label>
                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                  {templates.map(template => (
                    <div key={template.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`nurture-template-${template.id}`}
                        defaultChecked={editingNurture.templateIds.includes(template.id)}
                      />
                      <label 
                        htmlFor={`nurture-template-${template.id}`} 
                        className="text-sm flex-1"
                      >
                        {template.name}
                      </label>
                      <div className="flex gap-1">
                        {template.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Message Schedule (Days from start)</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {editingNurture.delayDays.map((day, index) => (
                    <Input
                      key={index}
                      type="number"
                      placeholder={`Day ${index + 1}`}
                      defaultValue={day}
                      min="0"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Day 0 = immediate, Day 2 = after 2 days, etc.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNurtureModal(false)}>
              Cancel
            </Button>
            <Button>
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}