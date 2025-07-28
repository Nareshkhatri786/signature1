import React, { useState, useEffect } from 'react';
import { Settings, Database, Users, MessageSquare, Building, Sliders, Edit, Shield, Bell, Palette } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { 
  GENERAL_SETTINGS_DEFAULT, 
  WHATSAPP_SETTINGS_DEFAULT, 
  DATABASE_SETTINGS_DEFAULT,
  MOCK_CUSTOM_FIELDS,
  MOCK_PIPELINE_STAGES,
  MOCK_USER_ROLES,
  CustomField,
  PipelineStage,
  UserRole
} from './settings/SettingsConstants';
import GeneralSettings from './settings/GeneralSettings';
import CustomFieldsSettings from './settings/CustomFieldsSettings';
import PipelineSettings from './settings/PipelineSettings';
import UserRolesSettings from './settings/UserRolesSettings';
import WhatsAppSettings from './settings/WhatsAppSettings';
import DatabaseSettings from './settings/DatabaseSettings';
import CustomFieldModal from './settings/CustomFieldModal';
import PipelineStageModal from './PipelineStageModal';
import UserRoleModal from './UserRoleModal';
import PlaceholderSettings from './settings/PlaceholderSettings';
import NotificationSettings from './settings/NotificationSettings';
import AppearanceSettings from './settings/AppearanceSettings';

// Simple toast function
const toast = {
  success: (message: string) => {
    if (window.showToast) {
      window.showToast(message, 'success');
    }
  },
  error: (message: string) => {
    if (window.showToast) {
      window.showToast(message, 'error');
    }
  }
};

export default function SettingsModule() {
  const [activeTab, setActiveTab] = useState('general');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [showAddStageModal, setShowAddStageModal] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);

  const [generalSettings, setGeneralSettings] = useState(GENERAL_SETTINGS_DEFAULT);
  const [whatsappSettings, setWhatsappSettings] = useState(WHATSAPP_SETTINGS_DEFAULT);
  const [databaseSettings, setDatabaseSettings] = useState(DATABASE_SETTINGS_DEFAULT);
  const [notificationSettings, setNotificationSettings] = useState(null);
  const [appearanceSettings, setAppearanceSettings] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // In development mode, always use mock data
      setCustomFields(MOCK_CUSTOM_FIELDS);
      setPipelineStages(MOCK_PIPELINE_STAGES);
      setUserRoles(MOCK_USER_ROLES);
    } catch (error) {
      console.error('Error loading settings:', error);
      setCustomFields(MOCK_CUSTOM_FIELDS);
      setPipelineStages(MOCK_PIPELINE_STAGES);
      setUserRoles(MOCK_USER_ROLES);
    }
  };

  const saveSettings = async (section: string, data: any) => {
    try {
      // In development mode, just show success message
      toast.success('Settings saved successfully (Development Mode)');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.success('Settings saved successfully (Development Mode)');
    }
  };

  // Custom Field Handlers
  const handleAddCustomField = (field: Omit<CustomField, 'id'>) => {
    const newField = { ...field, id: Date.now().toString() };
    setCustomFields([...customFields, newField]);
    setShowAddFieldModal(false);
    toast.success('Custom field added successfully');
  };

  const handleUpdateCustomField = (field: CustomField) => {
    setCustomFields(customFields.map(f => f.id === field.id ? field : f));
    setEditingField(null);
    toast.success('Custom field updated successfully');
  };

  const handleDeleteCustomField = (fieldId: string) => {
    setCustomFields(customFields.filter(f => f.id !== fieldId));
    toast.success('Custom field deleted successfully');
  };

  // Pipeline Stage Handlers
  const handleAddPipelineStage = (stage: Omit<PipelineStage, 'id'>) => {
    const newStage = { ...stage, id: Date.now().toString() };
    setPipelineStages([...pipelineStages, newStage]);
    setShowAddStageModal(false);
    toast.success('Pipeline stage added successfully');
  };

  const handleUpdatePipelineStage = (stage: PipelineStage) => {
    setPipelineStages(pipelineStages.map(s => s.id === stage.id ? stage : s));
    setEditingStage(null);
    toast.success('Pipeline stage updated successfully');
  };

  const handleDeletePipelineStage = (stageId: string) => {
    setPipelineStages(pipelineStages.filter(s => s.id !== stageId));
    toast.success('Pipeline stage deleted successfully');
  };

  // User Role Handlers
  const handleAddUserRole = (role: Omit<UserRole, 'id'>) => {
    const newRole = { ...role, id: Date.now().toString() };
    setUserRoles([...userRoles, newRole]);
    setShowAddRoleModal(false);
    toast.success('User role added successfully');
  };

  const handleUpdateUserRole = (role: UserRole) => {
    setUserRoles(userRoles.map(r => r.id === role.id ? role : r));
    setEditingRole(null);
    toast.success('User role updated successfully');
  };

  const handleDeleteUserRole = (roleId: string) => {
    setUserRoles(userRoles.filter(r => r.id !== roleId));
    toast.success('User role deleted successfully');
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">System Settings</h1>
          <p className="text-muted-foreground">Configure your CRM system settings and preferences</p>
        </div>
        <Button onClick={() => saveSettings('all', { generalSettings, whatsappSettings, databaseSettings, notificationSettings, appearanceSettings })}>
          Save All Settings
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden lg:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="fields" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            <span className="hidden lg:inline">Fields</span>
          </TabsTrigger>
          <TabsTrigger value="pipelines" className="flex items-center gap-2">
            <Sliders className="h-4 w-4" />
            <span className="hidden lg:inline">Pipelines</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden lg:inline">Users & Roles</span>
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden lg:inline">WhatsApp</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span className="hidden lg:inline">Projects</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden lg:inline">Database</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden lg:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden lg:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden lg:inline">Appearance</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <TabsContent value="general">
          <GeneralSettings 
            settings={generalSettings} 
            onSettingsChange={setGeneralSettings} 
          />
        </TabsContent>

        <TabsContent value="fields">
          <CustomFieldsSettings
            customFields={customFields}
            onAddField={() => setShowAddFieldModal(true)}
            onEditField={setEditingField}
            onDeleteField={handleDeleteCustomField}
          />
        </TabsContent>

        <TabsContent value="pipelines">
          <PipelineSettings
            pipelineStages={pipelineStages}
            onAddStage={() => setShowAddStageModal(true)}
            onEditStage={setEditingStage}
            onDeleteStage={handleDeletePipelineStage}
          />
        </TabsContent>

        <TabsContent value="users">
          <UserRolesSettings
            userRoles={userRoles}
            onAddRole={() => setShowAddRoleModal(true)}
            onEditRole={setEditingRole}
            onDeleteRole={handleDeleteUserRole}
          />
        </TabsContent>

        <TabsContent value="whatsapp">
          <WhatsAppSettings
            settings={whatsappSettings}
            onSettingsChange={setWhatsappSettings}
          />
        </TabsContent>

        <TabsContent value="database">
          <DatabaseSettings
            settings={databaseSettings}
            onSettingsChange={setDatabaseSettings}
          />
        </TabsContent>

        <TabsContent value="projects">
          <PlaceholderSettings
            title="Project Management Settings"
            description="Configure project-specific settings"
            icon={Building}
            message="Project management settings will be available in the next update. This includes project templates, default stages, and team assignments."
          />
        </TabsContent>

        <TabsContent value="security">
          <PlaceholderSettings
            title="Security Settings"
            description="Configure security and access control settings"
            icon={Shield}
            message="Security settings including password policies, session management, and access controls will be available in the next update."
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings
            settings={notificationSettings}
            onSettingsChange={setNotificationSettings}
          />
        </TabsContent>

        <TabsContent value="appearance">
          <AppearanceSettings
            settings={appearanceSettings}
            onSettingsChange={setAppearanceSettings}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showAddFieldModal && (
        <CustomFieldModal
          onClose={() => setShowAddFieldModal(false)}
          onSave={handleAddCustomField}
        />
      )}

      {editingField && (
        <CustomFieldModal
          field={editingField}
          onClose={() => setEditingField(null)}
          onSave={handleUpdateCustomField}
        />
      )}

      {showAddStageModal && (
        <PipelineStageModal
          onClose={() => setShowAddStageModal(false)}
          onSave={handleAddPipelineStage}
        />
      )}

      {editingStage && (
        <PipelineStageModal
          stage={editingStage}
          onClose={() => setEditingStage(null)}
          onSave={handleUpdatePipelineStage}
        />
      )}

      {showAddRoleModal && (
        <UserRoleModal
          onClose={() => setShowAddRoleModal(false)}
          onSave={handleAddUserRole}
        />
      )}

      {editingRole && (
        <UserRoleModal
          role={editingRole}
          onClose={() => setEditingRole(null)}
          onSave={handleUpdateUserRole}
        />
      )}
    </div>
  );
}