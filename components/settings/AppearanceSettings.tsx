import React, { useState, useEffect } from 'react';
import { Palette, Monitor, Sun, Moon, Layout, Eye, Zap, Image, Type, Smartphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Slider } from '../ui/slider';

interface AppearanceSettings {
  theme: {
    mode: 'light' | 'dark' | 'system';
    primaryColor: string;
    accentColor: string;
    borderRadius: number;
    fontFamily: string;
    fontSize: number;
  };
  layout: {
    sidebar: 'expanded' | 'collapsed' | 'auto';
    density: 'comfortable' | 'compact';
    animations: boolean;
    navigationStyle: 'horizontal' | 'vertical' | 'mixed';
    cardStyle: 'elevated' | 'outlined' | 'filled';
  };
  branding: {
    companyName: string;
    logo: string;
    favicon: string;
    primaryBrandColor: string;
    secondaryBrandColor: string;
    showBranding: boolean;
    customCSS: string;
  };
  dashboard: {
    showWelcomeMessage: boolean;
    defaultView: 'grid' | 'list';
    itemsPerPage: number;
    showQuickActions: boolean;
    showRecentActivity: boolean;
    chartTheme: 'default' | 'colorful' | 'minimal';
  };
  mobile: {
    bottomNavigation: boolean;
    swipeGestures: boolean;
    hapticFeedback: boolean;
    mobileOptimizedForms: boolean;
  };
}

const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  theme: {
    mode: 'system',
    primaryColor: '#2563eb',
    accentColor: '#7c3aed',
    borderRadius: 8,
    fontFamily: 'Inter',
    fontSize: 14
  },
  layout: {
    sidebar: 'auto',
    density: 'comfortable',
    animations: true,
    navigationStyle: 'horizontal',
    cardStyle: 'elevated'
  },
  branding: {
    companyName: 'Signature Properties',
    logo: '',
    favicon: '',
    primaryBrandColor: '#2563eb',
    secondaryBrandColor: '#7c3aed',
    showBranding: true,
    customCSS: ''
  },
  dashboard: {
    showWelcomeMessage: true,
    defaultView: 'grid',
    itemsPerPage: 20,
    showQuickActions: true,
    showRecentActivity: true,
    chartTheme: 'default'
  },
  mobile: {
    bottomNavigation: true,
    swipeGestures: true,
    hapticFeedback: false,
    mobileOptimizedForms: true
  }
};

const THEME_PRESETS = [
  { name: 'Default Blue', primary: '#2563eb', accent: '#7c3aed' },
  { name: 'Green Nature', primary: '#059669', accent: '#10b981' },
  { name: 'Purple Luxury', primary: '#7c3aed', accent: '#a855f7' },
  { name: 'Orange Energy', primary: '#ea580c', accent: '#f97316' },
  { name: 'Red Corporate', primary: '#dc2626', accent: '#ef4444' },
  { name: 'Teal Modern', primary: '#0891b2', accent: '#06b6d4' }
];

const FONT_FAMILIES = [
  { name: 'Inter', value: 'Inter' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Open Sans', value: 'Open Sans' },
  { name: 'Poppins', value: 'Poppins' },
  { name: 'Lato', value: 'Lato' },
  { name: 'Montserrat', value: 'Montserrat' }
];

interface AppearanceSettingsProps {
  settings?: AppearanceSettings;
  onSettingsChange?: (settings: AppearanceSettings) => void;
}

export default function AppearanceSettings({ settings, onSettingsChange }: AppearanceSettingsProps) {
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>(
    settings || DEFAULT_APPEARANCE_SETTINGS
  );
  const [activeTab, setActiveTab] = useState('theme');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (settings) {
      setAppearanceSettings(settings);
    }
  }, [settings]);

  const handleSettingsChange = (newSettings: AppearanceSettings) => {
    setAppearanceSettings(newSettings);
    onSettingsChange?.(newSettings);
    
    // Apply theme changes immediately for preview
    if (previewMode) {
      applyThemePreview(newSettings);
    }
  };

  const updateSettings = (path: string[], value: any) => {
    const newSettings = { ...appearanceSettings };
    let current: any = newSettings;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    
    handleSettingsChange(newSettings);
  };

  const applyThemePreset = (preset: typeof THEME_PRESETS[0]) => {
    updateSettings(['theme', 'primaryColor'], preset.primary);
    updateSettings(['theme', 'accentColor'], preset.accent);
    updateSettings(['branding', 'primaryBrandColor'], preset.primary);
    updateSettings(['branding', 'secondaryBrandColor'], preset.accent);
  };

  const applyThemePreview = (settings: AppearanceSettings) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties for immediate preview
    root.style.setProperty('--primary', settings.theme.primaryColor);
    root.style.setProperty('--accent', settings.theme.accentColor);
    root.style.setProperty('--radius', `${settings.theme.borderRadius}px`);
    root.style.setProperty('--font-size', `${settings.theme.fontSize}px`);
    
    // Apply theme mode
    if (settings.theme.mode === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme.mode === 'light') {
      root.classList.remove('dark');
    }
  };

  const resetToDefaults = () => {
    setAppearanceSettings(DEFAULT_APPEARANCE_SETTINGS);
    onSettingsChange?.(DEFAULT_APPEARANCE_SETTINGS);
  };

  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
    if (!previewMode) {
      applyThemePreview(appearanceSettings);
      if (window.showToast) {
        window.showToast('Preview mode enabled - changes will be applied immediately', 'info');
      }
    } else {
      // Reset to current saved theme
      if (window.showToast) {
        window.showToast('Preview mode disabled', 'info');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Appearance Settings</h2>
          <p className="text-muted-foreground">Customize the look and feel of your CRM</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={previewMode ? 'default' : 'outline'}
            size="sm"
            onClick={togglePreviewMode}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? 'Preview On' : 'Preview Off'}
          </Button>
          <Button variant="outline" size="sm" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Mobile
          </TabsTrigger>
        </TabsList>

        {/* Theme Settings */}
        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme & Colors
              </CardTitle>
              <CardDescription>Customize colors, fonts, and visual style</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Mode */}
              <div className="space-y-4">
                <h4>Theme Mode</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: 'Light', icon: Sun },
                    { value: 'dark', label: 'Dark', icon: Moon },
                    { value: 'system', label: 'System', icon: Monitor }
                  ].map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <Button
                        key={mode.value}
                        variant={appearanceSettings.theme.mode === mode.value ? 'default' : 'outline'}
                        className="flex items-center gap-2 h-auto py-3"
                        onClick={() => updateSettings(['theme', 'mode'], mode.value)}
                      >
                        <Icon className="h-4 w-4" />
                        {mode.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Color Presets */}
              <div className="space-y-4">
                <h4>Color Presets</h4>
                <div className="grid grid-cols-2 gap-3">
                  {THEME_PRESETS.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      className="flex items-center gap-3 h-auto py-3 justify-start"
                      onClick={() => applyThemePreset(preset)}
                    >
                      <div className="flex gap-1">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: preset.accent }}
                        />
                      </div>
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Custom Colors */}
              <div className="space-y-4">
                <h4>Custom Colors</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary-color"
                        type="color"
                        value={appearanceSettings.theme.primaryColor}
                        onChange={(e) => updateSettings(['theme', 'primaryColor'], e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={appearanceSettings.theme.primaryColor}
                        onChange={(e) => updateSettings(['theme', 'primaryColor'], e.target.value)}
                        placeholder="#2563eb"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accent-color">Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accent-color"
                        type="color"
                        value={appearanceSettings.theme.accentColor}
                        onChange={(e) => updateSettings(['theme', 'accentColor'], e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={appearanceSettings.theme.accentColor}
                        onChange={(e) => updateSettings(['theme', 'accentColor'], e.target.value)}
                        placeholder="#7c3aed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Typography */}
              <div className="space-y-4">
                <h4>Typography</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="font-family">Font Family</Label>
                    <Select
                      value={appearanceSettings.theme.fontFamily}
                      onValueChange={(value) => updateSettings(['theme', 'fontFamily'], value)}
                    >
                      <SelectTrigger id="font-family">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_FAMILIES.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="font-size">Base Font Size: {appearanceSettings.theme.fontSize}px</Label>
                    <Slider
                      id="font-size"
                      min={12}
                      max={18}
                      step={1}
                      value={[appearanceSettings.theme.fontSize]}
                      onValueChange={(value) => updateSettings(['theme', 'fontSize'], value[0])}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Border Radius */}
              <div className="space-y-4">
                <h4>Border Radius</h4>
                <div className="space-y-2">
                  <Label htmlFor="border-radius">Roundness: {appearanceSettings.theme.borderRadius}px</Label>
                  <Slider
                    id="border-radius"
                    min={0}
                    max={16}
                    step={1}
                    value={[appearanceSettings.theme.borderRadius]}
                    onValueChange={(value) => updateSettings(['theme', 'borderRadius'], value[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Sharp (0px)</span>
                    <span>Rounded (16px)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout Settings */}
        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Layout & Navigation
              </CardTitle>
              <CardDescription>Configure layout density, navigation style, and interface behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Navigation Style */}
              <div className="space-y-4">
                <h4>Navigation Style</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'horizontal', label: 'Horizontal' },
                    { value: 'vertical', label: 'Vertical' },
                    { value: 'mixed', label: 'Mixed' }
                  ].map((style) => (
                    <Button
                      key={style.value}
                      variant={appearanceSettings.layout.navigationStyle === style.value ? 'default' : 'outline'}
                      onClick={() => updateSettings(['layout', 'navigationStyle'], style.value)}
                    >
                      {style.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Sidebar Behavior */}
              <div className="space-y-4">
                <h4>Sidebar Behavior</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'expanded', label: 'Always Expanded' },
                    { value: 'collapsed', label: 'Always Collapsed' },
                    { value: 'auto', label: 'Auto (Responsive)' }
                  ].map((behavior) => (
                    <Button
                      key={behavior.value}
                      variant={appearanceSettings.layout.sidebar === behavior.value ? 'default' : 'outline'}
                      onClick={() => updateSettings(['layout', 'sidebar'], behavior.value)}
                    >
                      {behavior.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Interface Density */}
              <div className="space-y-4">
                <h4>Interface Density</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'comfortable', label: 'Comfortable', description: 'More spacing, easier to read' },
                    { value: 'compact', label: 'Compact', description: 'Less spacing, more content visible' }
                  ].map((density) => (
                    <Card
                      key={density.value}
                      className={`cursor-pointer transition-colors ${
                        appearanceSettings.layout.density === density.value
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-muted-foreground/25'
                      }`}
                      onClick={() => updateSettings(['layout', 'density'], density.value)}
                    >
                      <CardContent className="p-4">
                        <h5 className="font-medium">{density.label}</h5>
                        <p className="text-sm text-muted-foreground">{density.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Card Style */}
              <div className="space-y-4">
                <h4>Card Style</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'elevated', label: 'Elevated' },
                    { value: 'outlined', label: 'Outlined' },
                    { value: 'filled', label: 'Filled' }
                  ].map((style) => (
                    <Button
                      key={style.value}
                      variant={appearanceSettings.layout.cardStyle === style.value ? 'default' : 'outline'}
                      onClick={() => updateSettings(['layout', 'cardStyle'], style.value)}
                    >
                      {style.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Animations */}
              <div className="flex items-center justify-between">
                <div>
                  <h4>Animations</h4>
                  <p className="text-sm text-muted-foreground">Enable smooth transitions and animations</p>
                </div>
                <Switch
                  checked={appearanceSettings.layout.animations}
                  onCheckedChange={(checked) => updateSettings(['layout', 'animations'], checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Settings */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Branding & Customization
              </CardTitle>
              <CardDescription>Customize your company branding and add custom styles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h4>Company Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      value={appearanceSettings.branding.companyName}
                      onChange={(e) => updateSettings(['branding', 'companyName'], e.target.value)}
                      placeholder="Your Company Name"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Logo & Assets */}
              <div className="space-y-4">
                <h4>Logo & Assets</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="logo-url">Logo URL</Label>
                    <Input
                      id="logo-url"
                      value={appearanceSettings.branding.logo}
                      onChange={(e) => updateSettings(['branding', 'logo'], e.target.value)}
                      placeholder="https://your-domain.com/logo.png"
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended size: 120x40px for header logo
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="favicon-url">Favicon URL</Label>
                    <Input
                      id="favicon-url"
                      value={appearanceSettings.branding.favicon}
                      onChange={(e) => updateSettings(['branding', 'favicon'], e.target.value)}
                      placeholder="https://your-domain.com/favicon.ico"
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended size: 32x32px or 16x16px
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Brand Colors */}
              <div className="space-y-4">
                <h4>Brand Colors</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary-brand-color">Primary Brand Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary-brand-color"
                        type="color"
                        value={appearanceSettings.branding.primaryBrandColor}
                        onChange={(e) => updateSettings(['branding', 'primaryBrandColor'], e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={appearanceSettings.branding.primaryBrandColor}
                        onChange={(e) => updateSettings(['branding', 'primaryBrandColor'], e.target.value)}
                        placeholder="#2563eb"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary-brand-color">Secondary Brand Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary-brand-color"
                        type="color"
                        value={appearanceSettings.branding.secondaryBrandColor}
                        onChange={(e) => updateSettings(['branding', 'secondaryBrandColor'], e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={appearanceSettings.branding.secondaryBrandColor}
                        onChange={(e) => updateSettings(['branding', 'secondaryBrandColor'], e.target.value)}
                        placeholder="#7c3aed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Branding Display */}
              <div className="flex items-center justify-between">
                <div>
                  <h4>Show Branding</h4>
                  <p className="text-sm text-muted-foreground">Display your company branding in the interface</p>
                </div>
                <Switch
                  checked={appearanceSettings.branding.showBranding}
                  onCheckedChange={(checked) => updateSettings(['branding', 'showBranding'], checked)}
                />
              </div>

              <Separator />

              {/* Custom CSS */}
              <div className="space-y-4">
                <h4>Custom CSS</h4>
                <div className="space-y-2">
                  <Label htmlFor="custom-css">Additional CSS Styles</Label>
                  <textarea
                    id="custom-css"
                    className="w-full h-32 p-3 border border-border rounded-md font-mono text-sm"
                    value={appearanceSettings.branding.customCSS}
                    onChange={(e) => updateSettings(['branding', 'customCSS'], e.target.value)}
                    placeholder="/* Add your custom CSS here */
.custom-header {
  background: linear-gradient(45deg, #2563eb, #7c3aed);
}"
                  />
                  <p className="text-xs text-muted-foreground">
                    Advanced users can add custom CSS to further customize the appearance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard Settings */}
        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Dashboard Preferences
              </CardTitle>
              <CardDescription>Customize your dashboard layout and default views</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Welcome Message */}
              <div className="flex items-center justify-between">
                <div>
                  <h4>Welcome Message</h4>
                  <p className="text-sm text-muted-foreground">Show welcome message on dashboard</p>
                </div>
                <Switch
                  checked={appearanceSettings.dashboard.showWelcomeMessage}
                  onCheckedChange={(checked) => updateSettings(['dashboard', 'showWelcomeMessage'], checked)}
                />
              </div>

              <Separator />

              {/* Default View */}
              <div className="space-y-4">
                <h4>Default List View</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'grid', label: 'Grid View' },
                    { value: 'list', label: 'List View' }
                  ].map((view) => (
                    <Button
                      key={view.value}
                      variant={appearanceSettings.dashboard.defaultView === view.value ? 'default' : 'outline'}
                      onClick={() => updateSettings(['dashboard', 'defaultView'], view.value)}
                    >
                      {view.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Items Per Page */}
              <div className="space-y-4">
                <h4>Items Per Page</h4>
                <div className="space-y-2">
                  <Label htmlFor="items-per-page">Default number of items: {appearanceSettings.dashboard.itemsPerPage}</Label>
                  <Slider
                    id="items-per-page"
                    min={10}
                    max={100}
                    step={10}
                    value={[appearanceSettings.dashboard.itemsPerPage]}
                    onValueChange={(value) => updateSettings(['dashboard', 'itemsPerPage'], value[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10 items</span>
                    <span>100 items</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Dashboard Components */}
              <div className="space-y-4">
                <h4>Dashboard Components</h4>
                <div className="space-y-3">
                  {[
                    { key: 'showQuickActions', label: 'Quick Actions Panel' },
                    { key: 'showRecentActivity', label: 'Recent Activity Feed' }
                  ].map((component) => (
                    <div key={component.key} className="flex items-center justify-between">
                      <Label htmlFor={`dashboard-${component.key}`}>{component.label}</Label>
                      <Switch
                        id={`dashboard-${component.key}`}
                        checked={appearanceSettings.dashboard[component.key as keyof typeof appearanceSettings.dashboard] as boolean}
                        onCheckedChange={(checked) => updateSettings(['dashboard', component.key], checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Chart Theme */}
              <div className="space-y-4">
                <h4>Chart Theme</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'default', label: 'Default' },
                    { value: 'colorful', label: 'Colorful' },
                    { value: 'minimal', label: 'Minimal' }
                  ].map((theme) => (
                    <Button
                      key={theme.value}
                      variant={appearanceSettings.dashboard.chartTheme === theme.value ? 'default' : 'outline'}
                      onClick={() => updateSettings(['dashboard', 'chartTheme'], theme.value)}
                    >
                      {theme.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mobile Settings */}
        <TabsContent value="mobile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Mobile Experience
              </CardTitle>
              <CardDescription>Optimize the mobile and tablet experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Navigation */}
              <div className="flex items-center justify-between">
                <div>
                  <h4>Bottom Navigation</h4>
                  <p className="text-sm text-muted-foreground">Use bottom navigation bar on mobile devices</p>
                </div>
                <Switch
                  checked={appearanceSettings.mobile.bottomNavigation}
                  onCheckedChange={(checked) => updateSettings(['mobile', 'bottomNavigation'], checked)}
                />
              </div>

              <Separator />

              {/* Gestures */}
              <div className="flex items-center justify-between">
                <div>
                  <h4>Swipe Gestures</h4>
                  <p className="text-sm text-muted-foreground">Enable swipe gestures for navigation</p>
                </div>
                <Switch
                  checked={appearanceSettings.mobile.swipeGestures}
                  onCheckedChange={(checked) => updateSettings(['mobile', 'swipeGestures'], checked)}
                />
              </div>

              <Separator />

              {/* Haptic Feedback */}
              <div className="flex items-center justify-between">
                <div>
                  <h4>Haptic Feedback</h4>
                  <p className="text-sm text-muted-foreground">Enable vibration feedback for interactions</p>
                </div>
                <Switch
                  checked={appearanceSettings.mobile.hapticFeedback}
                  onCheckedChange={(checked) => updateSettings(['mobile', 'hapticFeedback'], checked)}
                />
              </div>

              <Separator />

              {/* Form Optimization */}
              <div className="flex items-center justify-between">
                <div>
                  <h4>Mobile-Optimized Forms</h4>
                  <p className="text-sm text-muted-foreground">Use mobile-friendly form layouts and inputs</p>
                </div>
                <Switch
                  checked={appearanceSettings.mobile.mobileOptimizedForms}
                  onCheckedChange={(checked) => updateSettings(['mobile', 'mobileOptimizedForms'], checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}