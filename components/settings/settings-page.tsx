'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Building2, 
  Users, 
  Bell, 
  Shield, 
  Database,
  Mail,
  Clock,
  Calendar,
  DollarSign,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { languages, Language } from '@/lib/i18n';

interface CompanySettings {
  name: string;
  industry: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  timezone: string;
  currency: string;
  workingHours: {
    start: string;
    end: string;
  };
  workingDays: string[];
}

interface NotificationSettings {
  emailNotifications: boolean;
  leaveRequests: boolean;
  attendanceAlerts: boolean;
  payrollReminders: boolean;
  systemUpdates: boolean;
}

interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
  };
  sessionTimeout: number;
  twoFactorAuth: boolean;
  loginAttempts: number;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('company');

  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: 'Acme Corporation',
    industry: 'Technology',
    address: '123 Business St, City, State 12345',
    phone: '+1 (555) 123-4567',
    email: 'contact@acme.com',
    website: 'https://acme.com',
    timezone: 'America/New_York',
    currency: 'USD',
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    leaveRequests: true,
    attendanceAlerts: true,
    payrollReminders: true,
    systemUpdates: false
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: false
    },
    sessionTimeout: 24,
    twoFactorAuth: false,
    loginAttempts: 5
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from API
      // For now, we'll use the default values
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    } catch (error) {
      toast.error(t('saveError'));
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // In a real app, this would save to API
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      toast.success(t('saveSuccess'));
    } catch (error) {
      toast.error(t('saveError'));
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (confirm(t('deleteConfirm'))) {
      setCompanySettings({
        name: 'Acme Corporation',
        industry: 'Technology',
        address: '123 Business St, City, State 12345',
        phone: '+1 (555) 123-4567',
        email: 'contact@acme.com',
        website: 'https://acme.com',
        timezone: 'America/New_York',
        currency: 'USD',
        workingHours: {
          start: '09:00',
          end: '17:00'
        },
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      });
      
      setNotificationSettings({
        emailNotifications: true,
        leaveRequests: true,
        attendanceAlerts: true,
        payrollReminders: true,
        systemUpdates: false
      });
      
      setSecuritySettings({
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireNumbers: true,
          requireSymbols: false
        },
        sessionTimeout: 24,
        twoFactorAuth: false,
        loginAttempts: 5
      });
      
      toast.success('Settings reset to defaults');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('settings')}</h1>
          <p className="text-gray-600 mt-2">{t('manageSystemSettings')}</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('resetToDefaults')}
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('loading')}...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t('save')} {t('settings')}
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company">{t('companySettings')}</TabsTrigger>
          <TabsTrigger value="language">{t('language')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('notificationSettings')}</TabsTrigger>
          <TabsTrigger value="security">{t('securitySettings')}</TabsTrigger>
          <TabsTrigger value="system">{t('systemInformation')}</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <span>{t('companySettings')}</span>
                </CardTitle>
                <CardDescription>
                  {t('basicCompanyDetails')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">{t('companyName')}</Label>
                  <Input
                    id="companyName"
                    value={companySettings.name}
                    onChange={(e) => setCompanySettings({...companySettings, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="industry">{t('industry')}</Label>
                  <Select value={companySettings.industry} onValueChange={(value) => setCompanySettings({...companySettings, industry: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">{t('address')}</Label>
                  <Textarea
                    id="address"
                    value={companySettings.address}
                    onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('phone')}</Label>
                    <Input
                      id="phone"
                      value={companySettings.phone}
                      onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={companySettings.email}
                      onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">{t('website')}</Label>
                  <Input
                    id="website"
                    value={companySettings.website}
                    onChange={(e) => setCompanySettings({...companySettings, website: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <span>{t('workingHours')} & Schedule</span>
                </CardTitle>
                <CardDescription>
                  {t('configureWorkingHours')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">{t('timezone')}</Label>
                    <Select value={companySettings.timezone} onValueChange={(value) => setCompanySettings({...companySettings, timezone: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">GMT</SelectItem>
                        <SelectItem value="Europe/Paris">CET</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">{t('currency')}</Label>
                    <Select value={companySettings.currency} onValueChange={(value) => setCompanySettings({...companySettings, currency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">{t('startTime')}</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={companySettings.workingHours.start}
                      onChange={(e) => setCompanySettings({
                        ...companySettings,
                        workingHours: {...companySettings.workingHours, start: e.target.value}
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">{t('endTime')}</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={companySettings.workingHours.end}
                      onChange={(e) => setCompanySettings({
                        ...companySettings,
                        workingHours: {...companySettings.workingHours, end: e.target.value}
                      })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>{t('workingDays')}</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <Badge
                        key={day}
                        variant={companySettings.workingDays.includes(day) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          const newDays = companySettings.workingDays.includes(day)
                            ? companySettings.workingDays.filter(d => d !== day)
                            : [...companySettings.workingDays, day];
                          setCompanySettings({...companySettings, workingDays: newDays});
                        }}
                      >
                        {t(day.toLowerCase() as any)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="language" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <span>{t('language')} & Localization</span>
              </CardTitle>
              <CardDescription>
                Choose your preferred language and regional settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">{t('language')}</Label>
                  <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(languages).map(([code, name]) => (
                        <SelectItem key={code} value={code}>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">
                              {code === 'en' ? '🇺🇸' : '🇪🇸'}
                            </span>
                            <span>{name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">{t('languageSelectDescription')}</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    {t('language')} {t('preview')}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>{t('dashboard')}:</strong> {t('dashboard')}</p>
                    <p><strong>{t('employees')}:</strong> {t('employees')}</p>
                    <p><strong>{t('attendance')}:</strong> {t('attendance')}</p>
                    <p><strong>{t('settings')}:</strong> {t('settings')}</p>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">
                      {t('languageAutoSave')}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-orange-600" />
                <span>{t('notificationPreferences')}</span>
              </CardTitle>
              <CardDescription>
                {t('configureNotifications')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">{t('emailNotifications')}</Label>
                  <p className="text-sm text-gray-500">{t('receiveNotificationsEmail')}</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">{t('leaveRequests')}</Label>
                  <p className="text-sm text-gray-500">{t('notifyLeaveRequestStatus')}</p>
                </div>
                <Switch
                  checked={notificationSettings.leaveRequests}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, leaveRequests: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">{t('attendanceAlerts')}</Label>
                  <p className="text-sm text-gray-500">{t('attendanceAlertsDescription')}</p>
                </div>
                <Switch
                  checked={notificationSettings.attendanceAlerts}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, attendanceAlerts: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">{t('payrollReminders')}</Label>
                  <p className="text-sm text-gray-500">{t('payrollRemindersDescription')}</p>
                </div>
                <Switch
                  checked={notificationSettings.payrollReminders}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, payrollReminders: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">{t('systemUpdates')}</Label>
                  <p className="text-sm text-gray-500">{t('systemUpdatesDescription')}</p>
                </div>
                <Switch
                  checked={notificationSettings.systemUpdates}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemUpdates: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  <span>{t('passwordPolicy')}</span>
                </CardTitle>
                <CardDescription>
                  {t('configurePasswordRequirements')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="minLength">{t('minimumLength')}</Label>
                  <Input
                    id="minLength"
                    type="number"
                    min="6"
                    max="20"
                    value={securitySettings.passwordPolicy.minLength}
                    onChange={(e) => setSecuritySettings({
                      ...securitySettings,
                      passwordPolicy: {...securitySettings.passwordPolicy, minLength: parseInt(e.target.value)}
                    })}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>{t('requireUppercase')}</Label>
                    <Switch
                      checked={securitySettings.passwordPolicy.requireUppercase}
                      onCheckedChange={(checked) => setSecuritySettings({
                        ...securitySettings,
                        passwordPolicy: {...securitySettings.passwordPolicy, requireUppercase: checked}
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>{t('requireNumbers')}</Label>
                    <Switch
                      checked={securitySettings.passwordPolicy.requireNumbers}
                      onCheckedChange={(checked) => setSecuritySettings({
                        ...securitySettings,
                        passwordPolicy: {...securitySettings.passwordPolicy, requireNumbers: checked}
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>{t('requireSymbols')}</Label>
                    <Switch
                      checked={securitySettings.passwordPolicy.requireSymbols}
                      onCheckedChange={(checked) => setSecuritySettings({
                        ...securitySettings,
                        passwordPolicy: {...securitySettings.passwordPolicy, requireSymbols: checked}
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  <span>{t('securitySettings')}</span>
                </CardTitle>
                <CardDescription>
                  {t('additionalSecurityConfigurations')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">{t('sessionTimeout')}</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="1"
                    max="168"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="loginAttempts">{t('maxLoginAttempts')}</Label>
                  <Input
                    id="loginAttempts"
                    type="number"
                    min="3"
                    max="10"
                    value={securitySettings.loginAttempts}
                    onChange={(e) => setSecuritySettings({...securitySettings, loginAttempts: parseInt(e.target.value)})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">{t('twoFactorAuth')}</Label>
                    <p className="text-sm text-gray-500">{t('require2FA')}</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorAuth: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  <span>{t('systemInformation')}</span>
                </CardTitle>
                <CardDescription>
                  {t('currentSystemStatus')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">{t('systemStatus')}</span>
                  </div>
                  <Badge variant="default">{t('online')}</Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{t('version')}</span>
                  <Badge variant="outline">v1.0.0</Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{t('database')}</span>
                  <Badge variant="outline">Supabase</Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{t('lastBackup')}</span>
                  <Badge variant="outline">{t('today')}, 3:00 AM</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <span>{t('maintenance')}</span>
                </CardTitle>
                <CardDescription>
                  {t('systemMaintenance')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  {t('backupDatabase')}
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('clearCache')}
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  {t('testEmailConfig')}
                </Button>
                
                <Button variant="destructive" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {t('resetAllData')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}