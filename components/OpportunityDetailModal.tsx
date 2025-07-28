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
  AlertCircle,
  IndianRupee,
  TrendingUp,
  MapPin,
  Home
} from 'lucide-react';

interface OpportunityDetailModalProps {
  opportunity: any;
  onClose: () => void;
}

export function OpportunityDetailModal({ opportunity, onClose }: OpportunityDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [interactionType, setInteractionType] = useState('call');
  const [callOutcome, setCallOutcome] = useState('');
  const [interactionNotes, setInteractionNotes] = useState('');

  // Early return if no opportunity data
  if (!opportunity) {
    return null;
  }

  const getInitials = (name: string | undefined) => {
    if (!name || typeof name !== 'string') return 'N/A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Visit Done': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Negotiation': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Booking': return 'bg-green-100 text-green-800 border-green-200';
      case 'Lost': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Mock interaction data
  const interactions = [
    {
      id: 1,
      type: 'call',
      direction: 'outbound',
      duration: '8 min',
      outcome: 'Positive',
      notes: 'Discussed pricing and payment plans. Customer interested in 3BHK unit. Scheduled site visit for next weekend.',
      timestamp: '18/01/2024, 2:30 pm',
      user: 'John Doe'
    },
    {
      id: 2,
      type: 'meeting',
      location: 'Site Visit',
      outcome: 'Completed',
      notes: 'Site visit completed. Customer liked the location and amenities. Showed strong interest in unit 304.',
      timestamp: '20/01/2024, 11:00 am',
      user: 'John Doe'
    },
    {
      id: 3,
      type: 'whatsapp',
      message: 'Thank you for visiting Skyline Residences. Attached are the floor plans and pricing for unit 304.',
      status: 'delivered',
      timestamp: '20/01/2024, 6:45 pm',
      user: 'John Doe'
    },
    {
      id: 4,
      type: 'call',
      direction: 'inbound',
      duration: '12 min',
      outcome: 'Negotiation',
      notes: 'Customer called to negotiate price. Discussed various payment options and offered 5% discount for immediate booking.',
      timestamp: '22/01/2024, 10:15 am',
      user: 'John Doe'
    }
  ];

  // Mock pipeline progression
  const pipelineStages = [
    { stage: 'Scheduled', completed: true, date: '15/01/2024' },
    { stage: 'Visit Done', completed: true, date: '20/01/2024' },
    { stage: 'Negotiation', completed: true, date: '22/01/2024' },
    { stage: 'Booking', completed: false, date: null },
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

  const handleStageUpdate = (newStage: string) => {
    // Update stage logic here
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="sr-only">Opportunity Details: {opportunity.lead_name}</DialogTitle>
          <DialogDescription className="sr-only">
            Detailed information about opportunity for {opportunity.lead_name} including lead information, interactions, pipeline progression, and notes.
          </DialogDescription>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(opportunity.lead_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-medium">{opportunity.lead_name}</h2>
                <p className="text-sm text-muted-foreground">
                  {opportunity.project_name} • {formatCurrency(opportunity.value)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue={opportunity.stage} onValueChange={handleStageUpdate}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Visit Done">Visit Done</SelectItem>
                  <SelectItem value="Negotiation">Negotiation</SelectItem>
                  <SelectItem value="Booking">Booking</SelectItem>
                  <SelectItem value="Lost">Lost</SelectItem>
                </SelectContent>
              </Select>
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
                <TabsTrigger value="pipeline" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Pipeline
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
                  {/* Lead Information */}
                  <Card className="p-6">
                    <h3 className="font-medium mb-4">Lead Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Name</label>
                        <p className="mt-1">{opportunity.lead_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <div className="mt-1 flex items-center gap-2">
                          <span>{opportunity.lead_phone}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Phone className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <div className="mt-1 flex items-center gap-2">
                          <span>{opportunity.lead_email || 'No email'}</span>
                          {opportunity.lead_email && (
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Mail className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Opportunity Details */}
                  <Card className="p-6">
                    <h3 className="font-medium mb-4">Opportunity Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Stage</label>
                        <div className="mt-1">
                          <Badge className={getStageColor(opportunity.stage)}>
                            {opportunity.stage}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Value</label>
                        <p className="mt-1 text-lg font-medium text-green-600">
                          {formatCurrency(opportunity.value)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Probability</label>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="font-medium">{opportunity.probability}%</span>
                          <Progress value={opportunity.probability} className="flex-1" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                        <p className="mt-1">{opportunity.assigned_to_name || 'Unassigned'}</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Project Information */}
                <Card className="p-6">
                  <h3 className="font-medium mb-4">Project Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Project</label>
                      <div className="mt-1 flex items-center gap-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{opportunity.project_name}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Unit Type</label>
                      <div className="mt-1 flex items-center gap-2">
                        <Home className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">3 BHK Premium</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Location</label>
                      <div className="mt-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Whitefield, Bangalore</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Visit Information */}
                {opportunity.visit_date && (
                  <Card className="p-6">
                    <h3 className="font-medium mb-4">Visit Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Visit Date</label>
                        <div className="mt-1 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {new Date(opportunity.visit_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Visit Status</label>
                        <div className="mt-1">
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Completed
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
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
                            <SelectItem value="negotiation">Negotiation</SelectItem>
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
                          {interaction.type === 'meeting' && (
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-orange-600" />
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
                            {interaction.notes || interaction.message}
                          </p>
                          
                          {interaction.location && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                              <MapPin className="w-3 h-3" />
                              <span>{interaction.location}</span>
                            </div>
                          )}
                          
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

              <TabsContent value="pipeline" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-4">Pipeline Progression</h3>
                    <div className="space-y-4">
                      {pipelineStages.map((stage, index) => (
                        <div key={stage.stage} className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            stage.completed 
                              ? 'bg-green-500 text-white' 
                              : opportunity.stage === stage.stage
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                            {stage.completed ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <span>{index + 1}</span>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className={`font-medium ${
                                stage.completed || opportunity.stage === stage.stage
                                  ? 'text-foreground'
                                  : 'text-muted-foreground'
                              }`}>
                                {stage.stage}
                              </span>
                              {stage.date && (
                                <span className="text-sm text-muted-foreground">
                                  {stage.date}
                                </span>
                              )}
                            </div>
                            
                            {opportunity.stage === stage.stage && !stage.completed && (
                              <div className="mt-1">
                                <Badge variant="outline" className="text-xs">
                                  Current Stage
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Card className="p-6">
                    <h4 className="font-medium mb-4">Quick Actions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button variant="outline" className="justify-start">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Follow-up
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Proposal
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Phone className="w-4 h-4 mr-2" />
                        Make Call
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Update Stage
                      </Button>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="notes" className="mt-0">
                <div className="space-y-6">
                  <Card className="p-6">
                    <h4 className="font-medium mb-4">Add New Note</h4>
                    <Textarea
                      placeholder="Add notes about this opportunity..."
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
                        <span className="text-sm text-muted-foreground">1 hour ago</span>
                      </div>
                      <p className="text-sm">
                        Customer is very interested in unit 304 with the east-facing balcony. 
                        They appreciated the amenities and location. Ready to proceed with booking 
                        if we can offer 5% discount and flexible payment terms.
                      </p>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium">John Doe</span>
                        <span className="text-sm text-muted-foreground">2 days ago</span>
                      </div>
                      <p className="text-sm">
                        Site visit went very well. Customer was impressed with the construction quality 
                        and the view from the 3rd floor. Discussed pricing and available units. 
                        They will get back to us within a week.
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