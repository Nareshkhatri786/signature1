import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { 
  X, 
  Edit, 
  Phone, 
  Mail, 
  MessageSquare, 
  User, 
  Building,
  Calendar,
  Plus,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Send,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface LeadDetailModalProps {
  lead: any;
  onClose: () => void;
}

export function LeadDetailModal({ lead, onClose }: LeadDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [interactionType, setInteractionType] = useState('call');
  const [callOutcome, setCallOutcome] = useState('');
  const [interactionNotes, setInteractionNotes] = useState('');

  // Early return if no lead data
  if (!lead) {
    return null;
  }

  const getInitials = (name: string | undefined) => {
    if (!name || typeof name !== 'string') return 'N/A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Qualified': return 'bg-green-100 text-green-800 border-green-200';
      case 'Unqualified': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Mock interaction data
  const interactions = [
    {
      id: 1,
      type: 'call',
      direction: 'outbound',
      duration: '5 min',
      outcome: 'Positive',
      notes: 'Initial contact made. Customer interested in 2BHK units. Scheduled site visit for next week.',
      timestamp: '15/01/2024, 10:30 am',
      user: 'John Doe'
    },
    {
      id: 2,
      type: 'whatsapp',
      message: 'Thank you for your interest in Skyline Residences. Here are the floor plans you requested.',
      status: 'delivered',
      timestamp: '16/01/2024, 02:20 pm',
      user: 'John Doe'
    },
    {
      id: 3,
      type: 'email',
      subject: 'Skyline Residences - Pricing Details',
      status: 'opened',
      timestamp: '17/01/2024, 09:15 am',
      user: 'John Doe'
    }
  ];

  // Mock nurturing campaign data
  const nurturingCampaign = [
    {
      week: 1,
      message: 'Welcome to Skyline Residences! Discover your dream home with us.',
      status: 'delivered',
      timestamp: '15/01/2024, 09:00 am',
      viewed: true
    },
    {
      week: 1,
      message: 'Explore our premium amenities: Swimming pool, Gym, Kids play area & more!',
      status: 'delivered',
      timestamp: '17/01/2024, 10:00 am',
      viewed: true
    },
    {
      week: 1,
      message: 'Limited time offer: Book now and save ₹2 lakhs! T&C apply.',
      status: 'delivered',
      timestamp: '19/01/2024, 11:00 am',
      viewed: false
    },
    {
      week: 2,
      message: 'Quick check on your housing requirements. Available Today 10 AM to 6 PM.',
      status: 'pending',
      timestamp: '22/01/2024, 09:30 am',
      viewed: false
    }
  ];

  const handleAddInteraction = () => {
    // Add interaction logic here
    setShowAddInteraction(false);
    setInteractionType('call');
    setCallOutcome('');
    setInteractionNotes('');
  };

  const handleAddNote = () => {
    // Add note logic here
    setNewNote('');
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="sr-only">Lead Details: {lead.name}</DialogTitle>
          <DialogDescription className="sr-only">
            Detailed information about lead {lead.name} including contact information, interactions, nurturing progress, and notes.
          </DialogDescription>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(lead.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-medium">{lead.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {lead.project} • {lead.source}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="interactions" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Interactions
                </TabsTrigger>
                <TabsTrigger value="nurturing" className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Nurturing
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Notes
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto p-6 pt-4">
              <TabsContent value="overview" className="mt-0 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <Card className="p-6">
                    <h3 className="font-medium mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Name</label>
                        <p className="mt-1">{lead.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <div className="mt-1 flex items-center gap-2">
                          <span>{lead.phone}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Phone className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <div className="mt-1 flex items-center gap-2">
                          <span>{lead.email || 'No email'}</span>
                          {lead.email && (
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Mail className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Lead Details */}
                  <Card className="p-6">
                    <h3 className="font-medium mb-4">Lead Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <div className="mt-1">
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Source</label>
                        <p className="mt-1">{lead.source}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Project</label>
                        <p className="mt-1">{lead.project_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                        <p className="mt-1">John Doe</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Requirements */}
                <Card className="p-6">
                  <h3 className="font-medium mb-4">Requirements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Budget Range</label>
                      <p className="mt-1 text-lg font-medium">
                        {lead.budget_min && lead.budget_max 
                          ? `₹${(lead.budget_min / 10000000).toFixed(1)}-${(lead.budget_max / 10000000).toFixed(1)}Cr`
                          : 'Not specified'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Requirements</label>
                      <p className="mt-1 text-lg font-medium">{lead.requirements || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Priority</label>
                      <p className="mt-1 text-lg font-medium">{lead.priority}</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="interactions" className="mt-0">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-medium">Interaction History</h3>
                  <Button onClick={() => setShowAddInteraction(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Interaction
                  </Button>
                </div>

                {showAddInteraction && (
                  <Card className="p-6 mb-6">
                    <h4 className="font-medium mb-4">Add New Interaction</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <Select value={interactionType} onValueChange={setInteractionType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select interaction type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="call">Phone Call</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {interactionType === 'call' && (
                        <Select value={callOutcome} onValueChange={setCallOutcome}>
                          <SelectTrigger>
                            <SelectValue placeholder="Call outcome" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="positive">Positive</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                            <SelectItem value="negative">Negative</SelectItem>
                            <SelectItem value="no-answer">No Answer</SelectItem>
                            <SelectItem value="busy">Busy</SelectItem>
                            <SelectItem value="callback">Callback Requested</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <Textarea
                      placeholder="Add interaction notes..."
                      value={interactionNotes}
                      onChange={(e) => setInteractionNotes(e.target.value)}
                      className="mb-4"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleAddInteraction}>Add Interaction</Button>
                      <Button variant="outline" onClick={() => setShowAddInteraction(false)}>
                        Cancel
                      </Button>
                    </div>
                  </Card>
                )}

                <div className="space-y-4">
                  {interactions.map((interaction) => (
                    <Card key={interaction.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {interaction.type === 'call' && (
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              {interaction.direction === 'inbound' ? (
                                <PhoneIncoming className="w-5 h-5 text-blue-600" />
                              ) : (
                                <PhoneOutgoing className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                          )}
                          {interaction.type === 'whatsapp' && (
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <MessageSquare className="w-5 h-5 text-green-600" />
                            </div>
                          )}
                          {interaction.type === 'email' && (
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <Mail className="w-5 h-5 text-purple-600" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium capitalize">{interaction.type}</span>
                              {interaction.duration && (
                                <span className="text-sm text-muted-foreground">
                                  ({interaction.duration})
                                </span>
                              )}
                              {interaction.outcome && (
                                <Badge variant="outline" className="text-xs">
                                  {interaction.outcome}
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {interaction.timestamp}
                            </span>
                          </div>
                          
                          <p className="text-sm mb-2">
                            {interaction.notes || interaction.message || interaction.subject}
                          </p>
                          
                          {interaction.status && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span>Status:</span>
                              <span className="capitalize">{interaction.status}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="nurturing" className="mt-0">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-medium">Nurturing Campaign</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">Progress:</span>
                      <Progress value={65} className="w-32" />
                      <span className="text-sm font-medium">65%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {nurturingCampaign.map((campaign, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <Badge variant="outline" className="text-xs mb-2">
                            Week {campaign.week}
                          </Badge>
                          <div className={`w-3 h-3 rounded-full ${
                            campaign.status === 'delivered' ? 'bg-green-500' :
                            campaign.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'
                          }`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={campaign.status === 'delivered' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {campaign.status}
                              </Badge>
                              {campaign.viewed && (
                                <div className="flex items-center gap-1 text-green-600">
                                  <Eye className="w-3 h-3" />
                                  <span className="text-xs">Viewed</span>
                                </div>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {campaign.timestamp}
                            </span>
                          </div>
                          
                          <p className="text-sm">{campaign.message}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="notes" className="mt-0">
                <div className="space-y-6">
                  <Card className="p-6">
                    <h4 className="font-medium mb-4">Add New Note</h4>
                    <Textarea
                      placeholder="Add notes about this lead..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="mb-4"
                      rows={4}
                    />
                    <Button onClick={handleAddNote}>Add Note</Button>
                  </Card>

                  {/* Existing Notes */}
                  <div className="space-y-4">
                    <Card className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium">John Doe</span>
                        <span className="text-sm text-muted-foreground">2 hours ago</span>
                      </div>
                      <p className="text-sm">
                        Customer showed strong interest in 2BHK unit. Prefers east-facing apartment. 
                        Budget is flexible up to ₹60 lakhs. Scheduling site visit for this weekend.
                      </p>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium">John Doe</span>
                        <span className="text-sm text-muted-foreground">1 day ago</span>
                      </div>
                      <p className="text-sm">
                        Initial contact established. Customer is relocating from Mumbai to Bangalore 
                        for job purposes. Looking for immediate possession.
                      </p>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}