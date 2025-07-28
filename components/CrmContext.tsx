import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api' 
  : '/api';

// Development mode flag - set to true when backend is not available
const IS_DEVELOPMENT_MODE = true;

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: 'Admin' | 'Project Manager' | 'Sales Executive' | 'Telecaller';
  projectIds: number[];
  avatar?: string;
}

export interface DateFilter {
  type: 'today' | 'week' | 'month' | 'custom';
  startDate?: Date;
  endDate?: Date;
  label: string;
}

export interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  source: string;
  project_id: number;
  project_name: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Unqualified';
  priority: 'High' | 'Medium' | 'Low';
  assigned_to: number;
  assigned_to_name: string;
  notes?: string;
  next_follow_up?: string;
  budget_min?: number;
  budget_max?: number;
  requirements?: string;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: number;
  lead_id: number;
  lead_name: string;
  lead_phone: string;
  lead_email: string;
  project_id: number;
  project_name: string;
  stage: 'Scheduled' | 'Visit Done' | 'Negotiation' | 'Booking' | 'Lost';
  value: number;
  probability: number;
  visit_date?: string;
  expected_close_date?: string;
  assigned_to: number;
  assigned_to_name: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SiteVisit {
  id: number;
  opportunity_id?: number;
  lead_id?: number;
  lead_name: string;
  lead_phone: string;
  project_id: number;
  project_name: string;
  visit_date: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  assigned_to: number;
  assigned_to_name: string;
  notes?: string;
  feedback?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  name: string;
  location: string;
  description?: string;
  status: string;
  total_units?: number;
  available_units?: number;
  price_range_min?: number;
  price_range_max?: number;
  created_at: string;
  updated_at: string;
}

export interface Interaction {
  id: number;
  lead_id?: number;
  opportunity_id?: number;
  type: 'call' | 'email' | 'whatsapp' | 'meeting' | 'sms';
  direction?: 'inbound' | 'outbound';
  outcome?: string;
  notes?: string;
  duration?: string;
  created_by: number;
  created_at: string;
}

interface CrmContextType {
  // Filters
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
  selectedProject: number | null;
  setSelectedProject: (projectId: number | null) => void;
  
  // Data
  leads: Lead[];
  opportunities: Opportunity[];
  projects: Project[];
  siteVisits: SiteVisit[];
  
  // Loading states
  loading: {
    leads: boolean;
    opportunities: boolean;
    projects: boolean;
    siteVisits: boolean;
  };
  
  // Modals
  showAddLeadModal: boolean;
  setShowAddLeadModal: (show: boolean) => void;
  showAddOpportunityModal: boolean;
  setShowAddOpportunityModal: (show: boolean) => void;
  showScheduleVisitModal: boolean;
  setShowScheduleVisitModal: (show: boolean) => void;
  showWhatsAppModal: boolean;
  setShowWhatsAppModal: (show: boolean) => void;
  
  // Selected items
  selectedSiteVisit: SiteVisit | null;
  setSelectedSiteVisit: (visit: SiteVisit | null) => void;
  
  // Actions
  refreshData: () => Promise<void>;
  createLead: (leadData: any) => Promise<boolean>;
  createOpportunity: (opportunityData: any) => Promise<boolean>;
  createInteraction: (interactionData: any) => Promise<boolean>;
  getInteractions: (type: 'lead' | 'opportunity', id: number) => Promise<Interaction[]>;
  
  // Computed
  filteredLeads: Lead[];
  filteredOpportunities: Opportunity[];
  filteredSiteVisits: SiteVisit[];
  isMobile: boolean;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export function CrmProvider({ children }: { children: React.ReactNode }) {
  // Filter state
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    type: 'today',
    label: 'Today'
  });
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  
  // Data state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState({
    leads: false,
    opportunities: false,
    projects: false,
    siteVisits: false
  });
  
  // Modal state
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showAddOpportunityModal, setShowAddOpportunityModal] = useState(false);
  const [showScheduleVisitModal, setShowScheduleVisitModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Selected items state
  const [selectedSiteVisit, setSelectedSiteVisit] = useState<SiteVisit | null>(null);

  // Mock data for development mode
  const mockProjects = [
    { id: 1, name: 'Skyline Residences', location: 'Whitefield, Bangalore', description: 'Premium residential apartments', status: 'Active', total_units: 120, available_units: 45, price_range_min: 25000000, price_range_max: 35000000, created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: 2, name: 'Green Valley Apartments', location: 'Electronic City, Bangalore', description: 'Eco-friendly apartments', status: 'Active', total_units: 80, available_units: 32, price_range_min: 18000000, price_range_max: 28000000, created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: 3, name: 'Premium Villas', location: 'Sarjapur Road, Bangalore', description: 'Luxury villas', status: 'Active', total_units: 24, available_units: 8, price_range_min: 60000000, price_range_max: 85000000, created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: 4, name: 'Commercial Complex', location: 'MG Road, Bangalore', description: 'Commercial spaces', status: 'Active', total_units: 50, available_units: 15, price_range_min: 40000000, price_range_max: 120000000, created_at: '2024-01-01', updated_at: '2024-01-01' }
  ];

  const mockLeads = [
    { id: 1, name: 'Raj Patel', phone: '+91 9876543210', email: 'raj.patel@email.com', source: 'Website', status: 'New', priority: 'High', project_id: 1, project_name: 'Skyline Residences', assigned_to: 3, assigned_to_name: 'Sarah Wilson', budget_min: 25000000, budget_max: 30000000, requirements: '3BHK, East facing', created_at: '2024-01-20T00:00:00Z', updated_at: '2024-01-20T00:00:00Z' },
    { id: 2, name: 'Anita Gupta', phone: '+91 9876543211', email: 'anita.gupta@email.com', source: 'Facebook', status: 'Contacted', priority: 'Medium', project_id: 1, project_name: 'Skyline Residences', assigned_to: 3, assigned_to_name: 'Sarah Wilson', budget_min: 20000000, budget_max: 25000000, requirements: '2BHK, Investment', created_at: '2024-01-19T00:00:00Z', updated_at: '2024-01-19T00:00:00Z' },
    { id: 3, name: 'Vikram Singh', phone: '+91 9876543212', email: 'vikram.singh@email.com', source: 'Referral', status: 'Qualified', priority: 'High', project_id: 2, project_name: 'Green Valley Apartments', assigned_to: 4, assigned_to_name: 'Mike Johnson', budget_min: 18000000, budget_max: 22000000, requirements: '2BHK, Ready to move', created_at: '2024-01-18T00:00:00Z', updated_at: '2024-01-18T00:00:00Z' }
  ];

  const mockOpportunities = [
    { id: 1, lead_id: 3, lead_name: 'Vikram Singh', lead_phone: '+91 9876543212', lead_email: 'vikram.singh@email.com', project_id: 2, project_name: 'Green Valley Apartments', stage: 'Visit Done', value: 20000000, probability: 75, visit_date: '2024-01-25T10:00:00Z', assigned_to: 4, assigned_to_name: 'Mike Johnson', notes: 'Very interested, discussing loan options', created_at: '2024-01-19T00:00:00Z', updated_at: '2024-01-19T00:00:00Z' },
    { id: 2, lead_id: 2, lead_name: 'Anita Gupta', lead_phone: '+91 9876543211', lead_email: 'anita.gupta@email.com', project_id: 1, project_name: 'Skyline Residences', stage: 'Negotiation', value: 30000000, probability: 85, visit_date: '2024-01-28T14:00:00Z', assigned_to: 3, assigned_to_name: 'Sarah Wilson', notes: 'Ready to book if 5% discount available', created_at: '2024-01-20T00:00:00Z', updated_at: '2024-01-20T00:00:00Z' }
  ];

  const mockSiteVisits = [
    { 
      id: 1, 
      opportunity_id: 1, 
      lead_name: 'Vikram Singh', 
      leadName: 'Vikram Singh',
      lead_phone: '+91 9876543212', 
      phone: '+91 9876543212',
      project_id: 2, 
      projectId: 2,
      project_name: 'Green Valley Apartments', 
      projectName: 'Green Valley Apartments',
      visit_date: '2024-12-28T10:00:00Z', 
      visitDate: '2024-12-28T10:00:00Z',
      visitTime: '10:00 AM',
      status: 'Completed', 
      assigned_to: 4, 
      assignedTo: 4,
      assigned_to_name: 'Mike Johnson', 
      assignedToName: 'Mike Johnson',
      notes: 'Customer liked the location and amenities', 
      type: 'First Visit',
      created_at: '2024-01-20T00:00:00Z', 
      updated_at: '2024-01-25T10:00:00Z' 
    },
    { 
      id: 2, 
      opportunity_id: 2, 
      lead_name: 'Anita Gupta', 
      leadName: 'Anita Gupta',
      lead_phone: '+91 9876543211', 
      phone: '+91 9876543211',
      project_id: 1, 
      projectId: 1,
      project_name: 'Skyline Residences', 
      projectName: 'Skyline Residences',
      visit_date: '2024-12-29T14:00:00Z', 
      visitDate: '2024-12-29T14:00:00Z',
      visitTime: '2:00 PM',
      status: 'Scheduled', 
      assigned_to: 3, 
      assignedTo: 3,
      assigned_to_name: 'Sarah Wilson', 
      assignedToName: 'Sarah Wilson',
      notes: 'Site visit scheduled for weekend', 
      type: 'Second Visit',
      created_at: '2024-01-21T00:00:00Z', 
      updated_at: '2024-01-21T00:00:00Z' 
    },
    { 
      id: 3, 
      opportunity_id: 1, 
      lead_name: 'Raj Patel', 
      leadName: 'Raj Patel',
      lead_phone: '+91 9876543210', 
      phone: '+91 9876543210',
      project_id: 1, 
      projectId: 1,
      project_name: 'Skyline Residences', 
      projectName: 'Skyline Residences',
      visit_date: '2024-12-27T11:00:00Z', 
      visitDate: '2024-12-27T11:00:00Z',
      visitTime: '11:00 AM',
      status: 'Scheduled', 
      assigned_to: 3, 
      assignedTo: 3,
      assigned_to_name: 'Sarah Wilson', 
      assignedToName: 'Sarah Wilson',
      notes: 'First time visitor, very interested', 
      type: 'First Visit',
      created_at: '2024-01-26T00:00:00Z', 
      updated_at: '2024-01-26T00:00:00Z' 
    }
  ];

  // API helper function with fallback to mock data
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    // In development mode, use mock data
    if (IS_DEVELOPMENT_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      
      // Return mock data based on endpoint
      if (endpoint === '/leads') return mockLeads;
      if (endpoint === '/opportunities') return mockOpportunities;
      if (endpoint === '/projects') return mockProjects;
      if (endpoint === '/site-visits') return mockSiteVisits;
      if (endpoint.startsWith('/interactions/')) return [];
      
      return { success: true };
    }

    // Try real API call
    try {
      const token = localStorage.getItem('crm_token');
      const url = `${API_BASE_URL}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || 'Request failed');
      }

      return response.json();
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      // Fallback to mock data if API fails
      if (endpoint === '/leads') return mockLeads;
      if (endpoint === '/opportunities') return mockOpportunities;
      if (endpoint === '/projects') return mockProjects;
      if (endpoint === '/site-visits') return mockSiteVisits;
      throw error;
    }
  };

  // Data fetching functions
  const fetchLeads = async () => {
    setLoading(prev => ({ ...prev, leads: true }));
    try {
      const data = await apiCall('/leads');
      setLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(prev => ({ ...prev, leads: false }));
    }
  };

  const fetchOpportunities = async () => {
    setLoading(prev => ({ ...prev, opportunities: true }));
    try {
      const data = await apiCall('/opportunities');
      setOpportunities(data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(prev => ({ ...prev, opportunities: false }));
    }
  };

  const fetchProjects = async () => {
    setLoading(prev => ({ ...prev, projects: true }));
    try {
      const data = await apiCall('/projects');
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(prev => ({ ...prev, projects: false }));
    }
  };

  const fetchSiteVisits = async () => {
    setLoading(prev => ({ ...prev, siteVisits: true }));
    try {
      const data = await apiCall('/site-visits');
      setSiteVisits(data);
    } catch (error) {
      console.error('Error fetching site visits:', error);
    } finally {
      setLoading(prev => ({ ...prev, siteVisits: false }));
    }
  };

  const refreshData = async () => {
    await Promise.all([
      fetchLeads(),
      fetchOpportunities(),
      fetchProjects(),
      fetchSiteVisits(),
    ]);
  };

  // Create functions
  const createLead = async (leadData: any): Promise<boolean> => {
    try {
      await apiCall('/leads', {
        method: 'POST',
        body: JSON.stringify(leadData),
      });
      await fetchLeads();
      return true;
    } catch (error) {
      console.error('Error creating lead:', error);
      return false;
    }
  };

  const createOpportunity = async (opportunityData: any): Promise<boolean> => {
    try {
      await apiCall('/opportunities', {
        method: 'POST',
        body: JSON.stringify(opportunityData),
      });
      await fetchOpportunities();
      return true;
    } catch (error) {
      console.error('Error creating opportunity:', error);
      return false;
    }
  };

  const createInteraction = async (interactionData: any): Promise<boolean> => {
    try {
      await apiCall('/interactions', {
        method: 'POST',
        body: JSON.stringify(interactionData),
      });
      return true;
    } catch (error) {
      console.error('Error creating interaction:', error);
      return false;
    }
  };

  const getInteractions = async (type: 'lead' | 'opportunity', id: number): Promise<Interaction[]> => {
    try {
      const data = await apiCall(`/interactions/${type}/${id}`);
      return data;
    } catch (error) {
      console.error('Error fetching interactions:', error);
      return [];
    }
  };

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, []);

  // Computed values
  const filteredLeads = React.useMemo(() => {
    let filtered = leads;

    // Project filtering
    if (selectedProject) {
      filtered = filtered.filter(lead => lead.project_id === selectedProject);
    }

    // Date filtering
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (dateFilter.type === 'today') {
      filtered = filtered.filter(lead => {
        const createdDate = new Date(lead.created_at);
        const createdDateOnly = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate());
        return createdDateOnly.getTime() === today.getTime();
      });
    } else if (dateFilter.type === 'week') {
      filtered = filtered.filter(lead => new Date(lead.created_at) >= weekAgo);
    }

    return filtered;
  }, [leads, selectedProject, dateFilter]);

  const filteredOpportunities = React.useMemo(() => {
    let filtered = opportunities;

    // Project filtering
    if (selectedProject) {
      filtered = filtered.filter(opp => opp.project_id === selectedProject);
    }

    return filtered;
  }, [opportunities, selectedProject]);

  const filteredSiteVisits = React.useMemo(() => {
    let filtered = siteVisits;

    // Project filtering
    if (selectedProject) {
      filtered = filtered.filter(visit => visit.project_id === selectedProject);
    }

    return filtered;
  }, [siteVisits, selectedProject]);

  const value: CrmContextType = {
    dateFilter,
    setDateFilter,
    selectedProject,
    setSelectedProject,
    leads,
    opportunities,
    projects,
    siteVisits,
    loading,
    showAddLeadModal,
    setShowAddLeadModal,
    showAddOpportunityModal,
    setShowAddOpportunityModal,
    showScheduleVisitModal,
    setShowScheduleVisitModal,
    showWhatsAppModal,
    setShowWhatsAppModal,
    selectedSiteVisit,
    setSelectedSiteVisit,
    refreshData,
    createLead,
    createOpportunity,
    createInteraction,
    getInteractions,
    filteredLeads,
    filteredOpportunities,
    filteredSiteVisits,
    isMobile
  };

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const context = useContext(CrmContext);
  if (context === undefined) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
}