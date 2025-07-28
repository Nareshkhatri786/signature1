export const GENERAL_SETTINGS_DEFAULT = {
  companyName: 'Signature Properties',
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  currency: 'INR',
  fiscalYearStart: 'April',
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  workingHours: { start: '09:00', end: '18:00' },
  autoAssignLeads: true,
  leadAgingDays: 30,
  opportunityAgingDays: 60,
  enableNotifications: true,
  enableEmailAlerts: true,
  enableSMSAlerts: false
};

export const WHATSAPP_SETTINGS_DEFAULT = {
  businessNumbers: [
    { id: '1', number: '+91 98765 43210', name: 'Primary Sales', active: true },
    { id: '2', number: '+91 98765 43211', name: 'Secondary Sales', active: true },
    { id: '3', number: '+91 98765 43212', name: 'Support', active: false }
  ],
  templates: [
    { id: '1', name: 'Welcome Message', category: 'greeting', active: true },
    { id: '2', name: 'Follow-up Reminder', category: 'follow_up', active: true },
    { id: '3', name: 'Site Visit Confirmation', category: 'appointment', active: true }
  ],
  autoReply: true,
  businessHours: true,
  deliveryReports: true,
  webhookUrl: '',
  apiKey: ''
};

export const DATABASE_SETTINGS_DEFAULT = {
  host: 'localhost',
  port: '5432',
  database: 'signature_crm',
  username: 'postgres',
  connectionPool: 10,
  backupSchedule: 'daily',
  backupRetention: 30,
  enableAuditLog: true,
  enableDataEncryption: true
};

export const MOCK_CUSTOM_FIELDS = [
  {
    id: '1',
    name: 'budget_range',
    label: 'Budget Range',
    type: 'select' as const,
    module: 'leads' as const,
    required: false,
    options: ['0-50L', '50L-1Cr', '1Cr-2Cr', '2Cr+'],
    order: 1,
    active: true
  },
  {
    id: '2',
    name: 'property_type',
    label: 'Property Type Preference',
    type: 'multiselect' as const,
    module: 'leads' as const,
    required: false,
    options: ['Apartment', 'Villa', 'Plot', 'Commercial'],
    order: 2,
    active: true
  }
];

export const MOCK_PIPELINE_STAGES = [
  { id: '1', name: 'New Lead', color: '#3b82f6', order: 1, type: 'leads' as const, active: true },
  { id: '2', name: 'Qualified', color: '#f59e0b', order: 2, type: 'leads' as const, active: true },
  { id: '3', name: 'Interested', color: '#10b981', order: 3, type: 'leads' as const, active: true },
  { id: '4', name: 'Scheduled', color: '#8b5cf6', order: 1, type: 'opportunities' as const, active: true },
  { id: '5', name: 'Visit Done', color: '#06b6d4', order: 2, type: 'opportunities' as const, active: true },
  { id: '6', name: 'Negotiation', color: '#f59e0b', order: 3, type: 'opportunities' as const, active: true },
  { id: '7', name: 'Booking', color: '#10b981', order: 4, type: 'opportunities' as const, active: true },
  { id: '8', name: 'Lost', color: '#ef4444', order: 5, type: 'opportunities' as const, active: true }
];

export const MOCK_USER_ROLES = [
  {
    id: '1',
    name: 'Admin',
    description: 'Full system access',
    permissions: ['all'],
    active: true
  },
  {
    id: '2',
    name: 'Project Manager',
    description: 'Manage projects and teams',
    permissions: ['leads:read', 'leads:write', 'opportunities:read', 'opportunities:write', 'reports:read'],
    active: true
  },
  {
    id: '3',
    name: 'Sales Executive',
    description: 'Manage leads and opportunities',
    permissions: ['leads:read', 'leads:write', 'opportunities:read', 'opportunities:write'],
    active: true
  },
  {
    id: '4',
    name: 'Telecaller',
    description: 'Handle calls and basic lead management',
    permissions: ['leads:read', 'leads:write'],
    active: true
  }
];

export const SETTINGS_TABS = [
  { id: 'general', label: 'General', icon: 'Settings' },
  { id: 'fields', label: 'Fields', icon: 'Fields' },
  { id: 'pipelines', label: 'Pipelines', icon: 'Sliders' },
  { id: 'users', label: 'Users & Roles', icon: 'Users' },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'MessageSquare' },
  { id: 'projects', label: 'Projects', icon: 'Building' },
  { id: 'database', label: 'Database', icon: 'Database' },
  { id: 'security', label: 'Security', icon: 'Shield' },
  { id: 'notifications', label: 'Notifications', icon: 'Bell' },
  { id: 'appearance', label: 'Appearance', icon: 'Palette' }
];

export interface CustomField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'boolean';
  module: 'leads' | 'opportunities' | 'contacts';
  required: boolean;
  options?: string[];
  defaultValue?: string;
  order: number;
  active: boolean;
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
  type: 'leads' | 'opportunities';
  active: boolean;
  autoActions?: string[];
}

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  description: string;
  active: boolean;
}