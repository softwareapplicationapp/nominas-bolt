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
  User, 
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
  Globe,
  Download,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { languages, Language } from '@/lib/i18n';
import { useEmployeeSettings, EmployeeSettingsManager } from '@/lib/employee-settings';

export default function EmployeeSettingsPage() {
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { 
    settings, 
    updatePersonal, 
    updateNotifications, 
    updatePrivacy, 
    resetToDefaults,
    hasChanges 
  } = useEmployeeSettings();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Track unsaved changes
  useEffect(() => {
    setUnsavedChanges(hasChanges());
  }, [settings, hasChanges]);

  // Auto-save when language changes
  useEffect(() => {
    if (settings.personal.language !== language) {
      updatePersonal({ language });
    }
  }, [language, settings.personal.language, updatePersonal]);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    updatePersonal({ language: newLanguage });
    toast.success(newLanguage === 'es' ? '¡Idioma actualizado!' : 'Language updated!');
  };

  const handlePersonalSettingChange = (key: string, value: any) => {
    updatePersonal({ [key]: value });
    toast.success(t('saveSuccess'));
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    updateNotifications({ [key]: value });
    toast.success(language === 'es' ? '¡Configuración de notificaciones actualizada!' : 'Notification settings updated!');
  };

  const handlePrivacyChange = (key: string, value: any) => {
    updatePrivacy({ [key]: value });
    toast.success(language === 'es' ? '¡Configuración de privacidad actualizada!' : 'Privacy settings updated!');
  };

  const handleResetToDefaults = () => {
    if (confirm(language === 'es' ? '¿Estás seguro de que quieres restablecer todas las configuraciones?' : 'Are you sure you want to reset all settings to defaults?')) {
      resetToDefaults();
      toast.success(language === 'es' ? '¡Configuraciones restablecidas!' : 'Settings reset to defaults!');
    }
  };

  const handleExportSettings = () => {
    try {
      const manager = EmployeeSettingsManager.getInstance();
      const settingsJson = manager.exportSettings();
      const blob = new Blob([settingsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arcushr-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(language === 'es' ? '¡Configuraciones exportadas!' : 'Settings exported successfully!');
    } catch (error) {
      toast.error(language === 'es' ? 'Error al exportar configuraciones' : 'Error exporting settings');
    }
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const manager = EmployeeSettingsManager.getInstance();
        const success = manager.importSettings(content);
        
        if (success) {
          toast.success(language === 'es' ? '¡Configuraciones importadas!' : 'Settings imported successfully!');
          // Refresh the page to apply all changes
          window.location.reload();
        } else {
          toast.error(language === 'es' ? 'Archivo de configuraciones inválido' : 'Invalid settings file');
        }
      } catch (error) {
        toast.error(language === 'es' ? 'Error al importar configuraciones' : 'Error importing settings');
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(language === 'es' ? 'Las contraseñas nuevas no coinciden' : 'New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error(language === 'es' ? 'La contraseña debe tener al menos 8 caracteres' : 'Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    try {
      // In a real app, this would call the change password API
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      toast.success(language === 'es' ? '¡Contraseña cambiada con éxito!' : 'Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(language === 'es' ? 'Error al cambiar la contraseña' : 'Error changing password');
    } finally {
      setSaving(false);
    }
  };

  const lastUpdated = EmployeeSettingsManager.getInstance().getLastUpdated();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="space-y-8 p-6">
        <div className="flex justify-between items-center animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 text-gradient">
              {language === 'es' ? 'Configuración' : 'Settings'}
            </h1>
            <p className="text-gray-800 mt-2 font-semibold">
              {language === 'es' 
                ? 'Gestiona tus preferencias personales y configuración de cuenta'
                : 'Manage your personal preferences and account settings'}
            </p>
            {unsavedChanges && (
              <div className="mt-2 flex items-center space-x-2 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {language === 'es' ? 'Configuraciones guardadas automáticamente' : 'Settings saved automatically'}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <input
              type="file"
              accept=".json"
              onChange={handleImportSettings}
              className="hidden"
              id="import-settings"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('import-settings')?.click()}
              className="hover:bg-blue-50 hover:border-blue-300"
            >
              <Upload className="h-4 w-4 mr-2" />
              {language === 'es' ? 'Importar' : 'Import'}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleExportSettings}
              className="hover:bg-green-50 hover:border-green-300"
            >
              <Download className="h-4 w-4 mr-2" />
              {language === 'es' ? 'Exportar' : 'Export'}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleResetToDefaults}
              className="hover:bg-red-50 hover:border-red-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {language === 'es' ? 'Restablecer' : 'Reset'}
            </Button>
          </div>
        </div>

        {/* Settings Status */}
        <Card className="animate-scale-in border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {language === 'es' ? 'Configuraciones Sincronizadas' : 'Settings Synchronized'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {language === 'es' 
                      ? `Última actualización: ${lastUpdated.toLocaleString('es-ES')}`
                      : `Last updated: ${lastUpdated.toLocaleString('en-US')}`
                    }
                  </p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-600 text-white">
                {language === 'es' ? 'Guardado' : 'Saved'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100">
            <TabsTrigger value="personal" className="text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm font-semibold">
              {language === 'es' ? 'Personal' : 'Personal'}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm font-semibold">
              {language === 'es' ? 'Notificaciones' : 'Notifications'}
            </TabsTrigger>
            <TabsTrigger value="privacy" className="text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm font-semibold">
              {language === 'es' ? 'Privacidad' : 'Privacy'}
            </TabsTrigger>
            <TabsTrigger value="security" className="text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm font-semibold">
              {language === 'es' ? 'Seguridad' : 'Security'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="animate-scale-in card-glow border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-900">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <span>{language === 'es' ? 'Idioma y Localización' : 'Language & Localization'}</span>
                  </CardTitle>
                  <CardDescription className="text-gray-800 font-medium">
                    {language === 'es' 
                      ? 'Elige tu idioma preferido y configuración regional'
                      : 'Choose your preferred language and regional settings'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-gray-900 font-semibold">
                      {language === 'es' ? 'Idioma' : 'Language'}
                    </Label>
                    <Select value={language} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="border-gray-300 text-gray-900">
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
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      {language === 'es' ? 'Vista Previa de Idioma' : 'Language Preview'}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>{language === 'es' ? 'Panel de Control' : 'Dashboard'}:</strong> {t('dashboard')}</p>
                      <p><strong>{language === 'es' ? 'Mi Asistencia' : 'My Attendance'}:</strong> {t('myAttendance')}</p>
                      <p><strong>{language === 'es' ? 'Mi Perfil' : 'My Profile'}:</strong> {t('myProfile')}</p>
                      <p><strong>{language === 'es' ? 'Configuración' : 'Settings'}:</strong> {t('settings')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-scale-in card-glow border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-900">
                    <Settings className="h-5 w-5 text-purple-600" />
                    <span>{language === 'es' ? 'Apariencia y Formato' : 'Appearance & Format'}</span>
                  </CardTitle>
                  <CardDescription className="text-gray-800 font-medium">
                    {language === 'es' 
                      ? 'Personaliza cómo se ve y funciona ArcusHR para ti'
                      : 'Customize how ArcusHR looks and works for you'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme" className="text-gray-900 font-semibold">
                      {language === 'es' ? 'Tema' : 'Theme'}
                    </Label>
                    <Select 
                      value={settings.personal.theme} 
                      onValueChange={(value) => handlePersonalSettingChange('theme', value)}
                    >
                      <SelectTrigger className="border-gray-300 text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">{language === 'es' ? 'Claro' : 'Light'}</SelectItem>
                        <SelectItem value="dark">{language === 'es' ? 'Oscuro' : 'Dark'}</SelectItem>
                        <SelectItem value="auto">{language === 'es' ? 'Auto (Sistema)' : 'Auto (System)'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-gray-900 font-semibold">
                      {language === 'es' ? 'Zona Horaria' : 'Timezone'}
                    </Label>
                    <Select 
                      value={settings.personal.timezone} 
                      onValueChange={(value) => handlePersonalSettingChange('timezone', value)}
                    >
                      <SelectTrigger className="border-gray-300 text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">{language === 'es' ? 'Hora del Este' : 'Eastern Time'}</SelectItem>
                        <SelectItem value="America/Chicago">{language === 'es' ? 'Hora Central' : 'Central Time'}</SelectItem>
                        <SelectItem value="America/Denver">{language === 'es' ? 'Hora de Montaña' : 'Mountain Time'}</SelectItem>
                        <SelectItem value="America/Los_Angeles">{language === 'es' ? 'Hora del Pacífico' : 'Pacific Time'}</SelectItem>
                        <SelectItem value="Europe/Madrid">España (CET)</SelectItem>
                        <SelectItem value="Europe/London">GMT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat" className="text-gray-900 font-semibold">
                      {language === 'es' ? 'Formato de Fecha' : 'Date Format'}
                    </Label>
                    <Select 
                      value={settings.personal.dateFormat} 
                      onValueChange={(value) => handlePersonalSettingChange('dateFormat', value)}
                    >
                      <SelectTrigger className="border-gray-300 text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/AAAA</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/AAAA</SelectItem>
                        <SelectItem value="YYYY-MM-DD">AAAA-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timeFormat" className="text-gray-900 font-semibold">
                      {language === 'es' ? 'Formato de Hora' : 'Time Format'}
                    </Label>
                    <Select 
                      value={settings.personal.timeFormat} 
                      onValueChange={(value) => handlePersonalSettingChange('timeFormat', value)}
                    >
                      <SelectTrigger className="border-gray-300 text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12 {language === 'es' ? 'Horas (AM/PM)' : 'Hours (AM/PM)'}</SelectItem>
                        <SelectItem value="24h">24 {language === 'es' ? 'Horas' : 'Hours'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="animate-scale-in card-glow border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900">
                  <Bell className="h-5 w-5 text-amber-600" />
                  <span>{language === 'es' ? 'Preferencias de Notificación' : 'Notification Preferences'}</span>
                </CardTitle>
                <CardDescription className="text-gray-800 font-medium">
                  {language === 'es' 
                    ? 'Elige cómo y cuándo quieres ser notificado'
                    : 'Choose how and when you want to be notified'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-gray-900 font-semibold">
                      {language === 'es' ? 'Notificaciones por Correo' : 'Email Notifications'}
                    </Label>
                    <p className="text-sm text-gray-700 font-medium">
                      {language === 'es' 
                        ? 'Recibir notificaciones por correo electrónico'
                        : 'Receive notifications via email'}
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-gray-900 font-semibold">
                      {language === 'es' ? 'Actualizaciones de Permisos' : 'Leave Updates'}
                    </Label>
                    <p className="text-sm text-gray-700 font-medium">
                      {language === 'es' 
                        ? 'Notificar sobre cambios de estado en solicitudes de permisos'
                        : 'Notify about leave request status changes'}
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.leaveUpdates}
                    onCheckedChange={(checked) => handleNotificationChange('leaveUpdates', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-gray-900 font-semibold">
                      {language === 'es' ? 'Notificaciones de Nómina' : 'Payroll Notifications'}
                    </Label>
                    <p className="text-sm text-gray-700 font-medium">
                      {language === 'es' 
                        ? 'Notificar sobre recibos de pago y actualizaciones salariales'
                        : 'Notify about payslips and salary updates'}
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.payrollNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('payrollNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-gray-900 font-semibold">
                      {language === 'es' ? 'Alertas de Recordatorio' : 'Reminder Alerts'}
                    </Label>
                    <p className="text-sm text-gray-700 font-medium">
                      {language === 'es' 
                        ? 'Recordar fechas importantes y tareas'
                        : 'Remind about important dates and tasks'}
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.reminderAlerts}
                    onCheckedChange={(checked) => handleNotificationChange('reminderAlerts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-gray-900 font-semibold">
                      {language === 'es' ? 'Notificaciones Móviles' : 'Mobile Notifications'}
                    </Label>
                    <p className="text-sm text-gray-700 font-medium">
                      {language === 'es' 
                        ? 'Notificaciones push en dispositivos móviles'
                        : 'Push notifications on mobile devices'}
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.mobileNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('mobileNotifications', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card className="animate-scale-in card-glow border-emerald-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900">
                  <User className="h-5 w-5 text-emerald-600" />
                  <span>{language === 'es' ? 'Configuración de Privacidad' : 'Privacy Settings'}</span>
                </CardTitle>
                <CardDescription className="text-gray-800 font-medium">
                  {language === 'es' 
                    ? 'Controla quién puede ver tu información y contactarte'
                    : 'Control who can see your information and contact you'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="profileVisibility" className="text-gray-900 font-semibold">
                    {language === 'es' ? 'Visibilidad del Perfil' : 'Profile Visibility'}
                  </Label>
                  <Select 
                    value={settings.privacy.profileVisibility} 
                    onValueChange={(value) => handlePrivacyChange('profileVisibility', value)}
                  >
                    <SelectTrigger className="border-gray-300 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">{language === 'es' ? 'Todos en la Empresa' : 'Everyone in Company'}</SelectItem>
                      <SelectItem value="team">{language === 'es' ? 'Solo Mi Equipo' : 'My Team Only'}</SelectItem>
                      <SelectItem value="managers">{language === 'es' ? 'Solo Gerentes' : 'Managers Only'}</SelectItem>
                      <SelectItem value="private">{language === 'es' ? 'Privado' : 'Private'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-gray-900 font-semibold">
                      {language === 'es' ? 'Mostrar Correo Electrónico' : 'Show Email Address'}
                    </Label>
                    <p className="text-sm text-gray-700 font-medium">
                      {language === 'es' 
                        ? 'Permitir que otros vean tu correo electrónico'
                        : 'Allow others to see your email address'}
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.showEmail}
                    onCheckedChange={(checked) => handlePrivacyChange('showEmail', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-gray-900 font-semibold">
                      {language === 'es' ? 'Mostrar Número de Teléfono' : 'Show Phone Number'}
                    </Label>
                    <p className="text-sm text-gray-700 font-medium">
                      {language === 'es' 
                        ? 'Permitir que otros vean tu número de teléfono'
                        : 'Allow others to see your phone number'}
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.showPhone}
                    onCheckedChange={(checked) => handlePrivacyChange('showPhone', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-gray-900 font-semibold">
                      {language === 'es' ? 'Permitir Mensajes Directos' : 'Allow Direct Messages'}
                    </Label>
                    <p className="text-sm text-gray-700 font-medium">
                      {language === 'es' 
                        ? 'Permitir que compañeros te envíen mensajes directos'
                        : 'Allow colleagues to send you direct messages'}
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.allowDirectMessages}
                    onCheckedChange={(checked) => handlePrivacyChange('allowDirectMessages', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="animate-scale-in card-glow border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900">
                  <Shield className="h-5 w-5 text-red-600" />
                  <span>{language === 'es' ? 'Configuración de Seguridad' : 'Security Settings'}</span>
                </CardTitle>
                <CardDescription className="text-gray-800 font-medium">
                  {language === 'es' 
                    ? 'Gestiona la seguridad de tu cuenta y contraseña'
                    : 'Manage your account security and password'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-gray-900 font-semibold">
                      {language === 'es' ? 'Contraseña Actual' : 'Current Password'}
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        placeholder={language === 'es' ? 'Ingresa tu contraseña actual' : 'Enter your current password'}
                        className="border-gray-300 text-gray-900 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-600" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-gray-900 font-semibold">
                      {language === 'es' ? 'Nueva Contraseña' : 'New Password'}
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        placeholder={language === 'es' ? 'Ingresa nueva contraseña' : 'Enter new password'}
                        className="border-gray-300 text-gray-900 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-600" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-900 font-semibold">
                      {language === 'es' ? 'Confirmar Nueva Contraseña' : 'Confirm New Password'}
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      placeholder={language === 'es' ? 'Confirma nueva contraseña' : 'Confirm new password'}
                      className="border-gray-300 text-gray-900"
                    />
                  </div>
                  
                  <Button 
                    onClick={changePassword} 
                    disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className="btn-primary"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {language === 'es' ? 'Cambiando Contraseña...' : 'Changing Password...'}
                      </>
                    ) : (
                      language === 'es' ? 'Cambiar Contraseña' : 'Change Password'
                    )}
                  </Button>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">
                      {language === 'es' ? 'Información de Cuenta' : 'Account Information'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700 font-semibold">
                          {language === 'es' ? 'Correo' : 'Email'}
                        </p>
                        <p className="font-medium text-gray-900">{user?.email}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700 font-semibold">
                          {language === 'es' ? 'Rol' : 'Role'}
                        </p>
                        <p className="font-medium text-gray-900 capitalize">
                          {user?.role === 'employee' ? (language === 'es' ? 'Empleado' : 'Employee') : user?.role}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700 font-semibold">
                          {language === 'es' ? 'Último Acceso' : 'Last Access'}
                        </p>
                        <p className="font-medium text-gray-900">
                          {language === 'es' ? 'Hoy, 9:30 AM' : 'Today, 9:30 AM'}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700 font-semibold">
                          {language === 'es' ? 'Estado de Cuenta' : 'Account Status'}
                        </p>
                        <p className="font-medium text-emerald-600">
                          {language === 'es' ? 'Activo' : 'Active'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}