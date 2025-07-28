import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { toast } from 'sonner@2.0.3';
import { useCrm } from './CrmContext';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Clock, 
  Check, 
  CheckCheck,
  Search,
  Filter,
  Paperclip,
  Smile,
  MoreVertical
} from 'lucide-react';

interface WhatsAppMessage {
  id: string;
  type: 'sent' | 'received';
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  isTemplate?: boolean;
}

interface WhatsAppChat {
  id: string;
  contactName: string;
  contactPhone: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: WhatsAppMessage[];
  leadId?: number;
  opportunityId?: number;
}

export function WhatsAppModal() {
  const { 
    showWhatsAppModal, 
    setShowWhatsAppModal, 
    filteredLeads,
    filteredOpportunities,
    isMobile
  } = useCrm();

  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Mock WhatsApp data
  const [chats] = useState<WhatsAppChat[]>([
    {
      id: '1',
      contactName: 'Raj Patel',
      contactPhone: '+91 9876543210',
      lastMessage: 'Thank you for the information',
      lastMessageTime: new Date('2024-01-21T14:30:00'),
      unreadCount: 0,
      leadId: 1,
      messages: [
        {
          id: '1',
          type: 'sent',
          content: 'Hi Raj, thank you for your interest in Signature Heights. I wanted to share some details about our 3BHK apartments.',
          timestamp: new Date('2024-01-21T10:00:00'),
          status: 'read',
          isTemplate: true
        },
        {
          id: '2',
          type: 'received',
          content: 'Yes, please share the details. What are the price ranges?',
          timestamp: new Date('2024-01-21T10:15:00'),
          status: 'read'
        },
        {
          id: '3',
          type: 'sent',
          content: 'Our 3BHK apartments range from ₹2.5Cr to ₹3.5Cr. They come with premium amenities including swimming pool, gym, and garden area.',
          timestamp: new Date('2024-01-21T10:20:00'),
          status: 'read'
        },
        {
          id: '4',
          type: 'received',
          content: 'Thank you for the information',
          timestamp: new Date('2024-01-21T14:30:00'),
          status: 'read'
        }
      ]
    },
    {
      id: '2',
      contactName: 'Priya Sharma',
      contactPhone: '+91 9876543211',
      lastMessage: 'When can we schedule a visit?',
      lastMessageTime: new Date('2024-01-21T16:45:00'),
      unreadCount: 2,
      leadId: 2,
      messages: [
        {
          id: '1',
          type: 'sent',
          content: 'Hello Priya! Welcome to the Signature Gardens family. We have some exciting updates about the pre-launch offers.',
          timestamp: new Date('2024-01-21T09:00:00'),
          status: 'read',
          isTemplate: true
        },
        {
          id: '2',
          type: 'received',
          content: 'Hi! Yes, I\'m very interested. What are the current offers?',
          timestamp: new Date('2024-01-21T16:30:00'),
          status: 'read'
        },
        {
          id: '3',
          type: 'received',
          content: 'When can we schedule a visit?',
          timestamp: new Date('2024-01-21T16:45:00'),
          status: 'read'
        }
      ]
    }
  ]);

  const messageTemplates = [
    {
      id: 'welcome',
      name: 'Welcome Message',
      content: 'Welcome to {{project}}! Thank you for your interest. I\'m {{agent}} and I\'ll be assisting you with all your queries.'
    },
    {
      id: 'follow_up',
      name: 'Follow-up',
      content: 'Hi {{name}}, I wanted to follow up on your interest in {{project}}. Do you have any questions I can help with?'
    },
    {
      id: 'price_info',
      name: 'Price Information',
      content: 'Here are the current price details for {{project}}: {{details}}. Would you like to schedule a site visit to see the property?'
    },
    {
      id: 'visit_reminder',
      name: 'Visit Reminder',
      content: 'Hi {{name}}, this is a reminder about your site visit to {{project}} scheduled for {{date}} at {{time}}. Looking forward to meeting you!'
    }
  ];

  const filteredChats = chats.filter(chat =>
    chat.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.contactPhone.includes(searchTerm)
  );

  const selectedChatData = selectedChat ? chats.find(c => c.id === selectedChat) : null;

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChatData) return;

    const message: WhatsAppMessage = {
      id: Date.now().toString(),
      type: 'sent',
      content: newMessage,
      timestamp: new Date(),
      status: 'sent'
    };

    // In real app, you would update the chat messages
    console.log('Sending message:', message);
    
    setNewMessage('');
    toast.success('Message sent!');
  };

  const handleUseTemplate = (template: any) => {
    if (!selectedChatData) return;
    
    let content = template.content;
    content = content.replace('{{name}}', selectedChatData.contactName);
    content = content.replace('{{project}}', 'Signature Heights');
    content = content.replace('{{agent}}', 'John Doe');
    
    setNewMessage(content);
    setSelectedTemplate('');
  };

  return (
    <Dialog open={showWhatsAppModal} onOpenChange={setShowWhatsAppModal}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] p-0">
        <div className="flex flex-col h-[600px]">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              WhatsApp Business
            </DialogTitle>
            <DialogDescription>
              Manage WhatsApp conversations with leads and clients. Send messages, use templates, and track engagement.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* Chat List */}
            <div className={`border-r bg-muted/30 ${isMobile && selectedChat ? 'hidden' : 'flex'} flex-col ${isMobile ? 'w-full' : 'w-80'}`}>
              {/* Search */}
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search chats..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Chats */}
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {filteredChats.map(chat => (
                    <div
                      key={chat.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                        selectedChat === chat.id ? 'bg-accent' : ''
                      }`}
                      onClick={() => setSelectedChat(chat.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {chat.contactName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">{chat.contactName}</p>
                            <span className="text-xs text-muted-foreground">
                              {chat.lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                            {chat.unreadCount > 0 && (
                              <Badge variant="default" className="h-5 w-5 text-xs rounded-full p-0 flex items-center justify-center">
                                {chat.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className={`flex flex-col flex-1 ${isMobile && !selectedChat ? 'hidden' : 'flex'}`}>
              {selectedChatData ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isMobile && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedChat(null)}
                          >
                            ←
                          </Button>
                        )}
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {selectedChatData.contactName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{selectedChatData.contactName}</p>
                          <p className="text-xs text-muted-foreground">{selectedChatData.contactPhone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {selectedChatData.messages.map(message => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              message.type === 'sent'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            {message.isTemplate && (
                              <Badge variant="secondary" className="mb-2 text-xs">
                                Template Message
                              </Badge>
                            )}
                            <p className="text-sm">{message.content}</p>
                            <div className={`flex items-center gap-1 mt-2 justify-end ${
                              message.type === 'sent' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              <span className="text-xs">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {message.type === 'sent' && (
                                <div className="ml-1">
                                  {message.status === 'read' ? (
                                    <CheckCheck className="w-3 h-3 text-blue-400" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <Tabs defaultValue="compose" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="compose">Compose</TabsTrigger>
                        <TabsTrigger value="templates">Templates</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="compose" className="space-y-2">
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <Textarea
                              placeholder="Type a message..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              rows={2}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage();
                                }
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Paperclip className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Smile className="w-4 h-4" />
                            </Button>
                            <Button size="sm" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="templates" className="space-y-2">
                        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a template..." />
                          </SelectTrigger>
                          <SelectContent>
                            {messageTemplates.map(template => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {selectedTemplate && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm mb-2">
                              {messageTemplates.find(t => t.id === selectedTemplate)?.content}
                            </p>
                            <Button size="sm" onClick={() => {
                              const template = messageTemplates.find(t => t.id === selectedTemplate);
                              if (template) handleUseTemplate(template);
                            }}>
                              Use Template
                            </Button>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a chat to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}