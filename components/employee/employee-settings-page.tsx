'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Clock,
  Save,
  Eye,
  EyeOff,
  Loader2,
  Globe,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { languages, Language } from '@/lib/i18n';

interface PersonalSettings {
  theme: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  leaveUpdates: boolean;
  payrollNotifications: boolean;
  reminderAlerts: boolean;
  mobileNotifications: boolean;
}

interface PrivacySettings {
  profileVisibility: string;
  showEmail: boolean;
  showPhone: boolean;
  allowDirectMessages: boolean;
}

// Helper functions for localStorage persistence
const STORAGE_KEYS = {
  PERSONAL_SETTINGS: 'arcushr_personal_settings',
  NOTIFICATION_SETTINGS: 'arcushr_notification_settings',
  PRIVACY_SETTINGS: 'arcushr_privacy_settings'
};

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export default function EmployeeSettingsPage() {
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [personalSettings, setPersonalSettings] = useState<PersonalSettings>({
    theme: 'light',
    language: language,
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    leaveUpdates: true,
    payrollNotifications: true,
    reminderAlerts: false,
    mobileNotifications: true
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'team',
    showEmail: false,
    showPhone: false,
    allowDirectMessages: true
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    // Update personal settings when language changes from context
    setPersonalSettings(prev => ({ ...prev, language }));
  }, [language]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Load settings from localStorage
      const loadedPersonalSettings = loadFromStorage(STORAGE_KEYS.PERSONAL_SETTINGS, {
        theme: 'light',
        language: language,
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h'
      });

      const loadedNotificationSettings = loadFromStorage(STORAGE_KEYS.NOTIFICATION_SETTINGS, {
        emailNotifications: true,
        leaveUpdates: true,
        payrollNotifications: true,
        reminderAlerts: false,
        mobileNotifications: true
      });

      const loadedPrivacySettings = loadFromStorage(STORAGE_KEYS.PRIVACY_SETTINGS, {
        profileVisibility: 'team',
        showEmail: false,
        showPhone: false,
        allowDirectMessages: true
      });

      setPersonalSettings(loadedPersonalSettings);
      setNotificationSettings(loadedNotificationSettings);
      setPrivacySettings(loadedPrivacySettings);

      // Apply theme if it's saved
      if (loadedPersonalSettings.theme && typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', loadedPersonalSettings.theme === 'dark');
      }

      console.log('Settings loaded from localStorage:', {
        personal: loadedPersonalSettings,
        notifications: loadedNotificationSettings,
        privacy: loadedPrivacySettings
      });

    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Error al cargar configuraciones');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save to localStorage
      saveToStorage(STORAGE_KEYS.PERSONAL_SETTINGS, personalSettings);
      saveToStorage(STORAGE_KEYS.NOTIFICATION_SETTINGS, notificationSettings);
      saveToStorage(STORAGE_KEYS.PRIVACY_SETTINGS, privacySettings);

      // Apply theme immediately
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', personalSettings.theme === 'dark');
      }

      // Update language in context if it changed
      if (personalSettings.language !== language) {
        setLanguage(personalSettings.language as Language);
      }

      console.log('Settings saved to localStorage:', {
        personal: personalSettings,
        notifications: notificationSettings,
        privacy: privacySettings
      });

      setHasUnsavedChanges(false);
      toast.success('¡Configuraciones guardadas exitosamente!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error al guardar configuraciones');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setSaving(true);
    try {
      // In a real app, this would call the change password API
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      toast.success('¡Contraseña cambiada con éxito!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error('Error al cambiar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  // Helper function to mark changes
  const markAsChanged = () => {
    setHasUnsavedChanges(true);
  };

  // Helper function to get formatted date/time examples
  const getDateTimeExamples = () => {
    const now = new Date();
    const examples = {
      date: {
        'MM/DD/YYYY': now.toLocaleDateString('en-US'),
        'DD/MM/YYYY': now.toLocaleDateString('en-GB'),
        'YYYY-MM-DD': now.toISOString().split('T')[0]
      },
      time: {
        '12h': now.toLocaleTimeString('en-US', { hour12: true }),
        '24h': now.toLocaleTimeString('en-US', { hour12: false })
      }
    };
    return examples;
  };

  const examples = getDateTimeExamples();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="space-y-8 p-6">
        <div className="flex justify-between items-center animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 text-gradient">Configuración</h1>
            <p className="text-gray-800 mt-2 font-semibold">Gestiona tus preferencias personales y configuración de cuenta</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {hasUnsavedChanges && (
              <div className="flex items-center space-x-2 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Cambios sin guardar</span>
              </div>
            )}
            <Button onClick={saveSettings} disabled={saving} className="btn-primary">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100">
            <TabsTrigger value="personal" className="text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm font-semibold">Personal</TabsTrigger>
            <TabsTrigger value="notifications" className="text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm font-semibold">Notificaciones</TabsTrigger>
            <TabsTrigger value="privacy" className="text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm font-semibold">Privacidad</TabsTrigger>
            <TabsTrigger value="security" className="text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm font-semibold">Seguridad</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="animate-scale-in card-glow border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-900">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <span>Idioma y Localización</span>
                  </CardTitle>
                  <CardDescription className="text-gray-800 font-medium">
                    Elige tu idioma preferido y configuración regional
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-gray-900 font-semibold">Idioma</Label>
                    <Select 
                      value={personalSettings.language} 
                      onValueChange={(value: Language) => {
                        setPersonalSettings({...personalSettings, language: value});
                        setLanguage(value);
                        markAsChanged();
                      }}
                    >
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

                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-gray-900 font-semibold">Zona Horaria</Label>
                    <Select 
                      value={personalSettings.timezone} 
                      onValueChange={(value) => {
                        setPersonalSettings({...personalSettings, timezone: value});
                        markAsChanged();
                      }}
                    >
                      <SelectTrigger className="border-gray-300 text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Hora del Este (EST)</SelectItem>
                        <SelectItem value="America/Chicago">Hora Central (CST)</SelectItem>
                        <SelectItem value="America/Denver">Hora de Montaña (MST)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Hora del Pacífico (PST)</SelectItem>
                        <SelectItem value="Europe/Madrid">España (CET)</SelectItem>
                        <SelectItem value="Europe/London">GMT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Vista Previa de Idioma
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Panel de Control:</strong> {t('dashboard')}</p>
                      <p><strong>Mi Asistencia:</strong> {t('myAttendance')}</p>
                      <p><strong>Mi Perfil:</strong> {t('myProfile')}</p>
                      <p><strong>Configuración:</strong> {t('settings')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-scale-in card-glow border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-900">
                    <Palette className="h-5 w-5 text-purple-600" />
                    <span>Apariencia y Formato</span>
                  </CardTitle>
                  <CardDescription className="text-gray-800 font-medium">
                    Personaliza cómo se ve y funciona ArcusHR para ti
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme" className="text-gray-900 font-semibold">Tema</Label>
                    <Select 
                      value={personalSettings.theme} 
                      onValueChange={(value) => {
                        setPersonalSettings({...personalSettings, theme: value});
                        markAsChanged();
                      }}
                    >
                      <SelectTrigger className="border-gray-300 text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="dark">Oscuro</SelectItem>
                        <SelectItem value="auto">Auto (Sistema)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat" className="text-gray-900 font-semibold">Formato de Fecha</Label>
                    <Select 
                      value={personalSettings.dateFormat} 
                      onValueChange={(value) => {
                        setPersonalSettings({...personalSettings, dateFormat: value});
                        markAsChanged();
                      }}
                    >
                      <SelectTrigger className="border-gray-300 text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">
                          <div className="flex justify-between w-full">
                            <span>MM/DD/AAAA</span>
                            <span className="text-gray-500 ml-4">{examples.date['MM/DD/YYYY']}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="DD/MM/YYYY">
                          <div className="flex justify-between w-full">
                            <span>DD/MM/AAAA</span>
                            <span className="text-gray-500 ml-4">{examples.date['DD/MM/YYYY']}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="YYYY-MM-DD">
                          <div className="flex justify-between w-full">
                            <span>AAAA-MM-DD</span>
                            <span className="text-gray-500 ml-4">{examples.date['YYYY-MM-DD']}</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timeFormat" className="text-gray-900 font-semibold">Formato de Hora</Label>
                    <Select 
                      value={personalSettings.timeFormat} 
                      onValueChange={(value) => {
                        setPersonalSettings({...personalSettings, timeFormat: value});
                        markAsChanged();
                      }}
                    >
                      <SelectTrigger className="border-gray-300 text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">
                          <div className="flex justify-between w-full">
                            <span>12 Horas (AM/PM)</span>
                            <span className="text-gray-500 ml-4">{examples.time['12h']}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="24h">
                          <div className="flex justify-between w-full">
                            <span>24 Horas</span>
                            <span className="text-gray-500 ml-4">{examples.time['24h']}</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-2">
                      Vista Previa de Configuración
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Tema:</strong> {personalSettings.theme === 'light' ? 'Claro' : personalSettings.theme === 'dark' ? 'Oscuro' : 'Auto'}</p>
                      <p><strong>Zona Horaria:</strong> {personalSettings.timezone}</p>
                      <p><strong>Fecha:</strong> {examples.date[personalSettings.dateFormat as keyof typeof examples.date]}</p>
                      <p><strong>Hora:</strong> {examples.time[personalSettings.timeFormat as keyof typeof examples.time]}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">
                  Las configuraciones se guardan automáticamente en tu navegador y se aplicarán inmediatamente
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="animate-scale-in card-glow border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900">
                  <Bell className="h-5 w-5 text-amber-600" />
                  <span>Preferencias de Notificación</span>
                </CardTitle>
                <CardDescription className="text-gray-800 font-medium">
                  Elige cómo y cuándo quieres ser notificado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-gray-900 font-semibold">Notificaciones por Correo</Label>
                    <p className="text-sm text-gray-700 font-medium">Recibir notificaciones por correo electrónico</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({...notificationSettings, emailNotifications: checked});
                      markAsChanged();
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-gray-900 font-semibold">Actualizaciones de Permisos</Label>
                    <p className="text-sm text-gray-700 font-medium">Notificar sobre cambios de estado en solicitudes de permisos</p>
                  </div>
                  <Switch
                    checked={notificationSettings.leaveUpdates}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({...notificationSettings, leaveUpdates: checked});
                      markAsChanged();
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-gray-900 font-semibold">Notificaciones de Nómina</Label>
                    <p className="text-sm text-gray-700 font-medium">Notificar sobre recibos de pago y actualizaciones salariales</p>
                  </div>
                  <Switch
                    checked={notificationSettings.payrollNotifications}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({...notificationSettings, payrollNotifications: checked});
                      markAsChanged();
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-gray-900 font-semibold">Alertas de Recordatorio</Label>
                    <p className="text-sm text-gray-700 font-medium">Recordar fechas importantes y tareas</p>
                  </div>
                  <Switch
                    checked={notificationSettings.reminderAlerts}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({...notificationSettings, reminderAlerts: checked});
                      markAsChanged();
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-gray-900 font-semibold">Notificaciones Móviles</Label>
                    <p className="text-sm text-gray-700 font-medium">Notificaciones push en dispositivos móviles</p>
                  </div>
                  <Switch
                    checked={notificationSettings.mobileNotifications}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({...notificationSettings, mobileNotifications: checked});
                      markAsChanged();
                    }} 
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
                  <span>Configuración de Privacidad</span>
                </CardTitle>
                <CardDescription className="text-gray-800 font-medium">
                  Controla quién puede ver tu información y contactarte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="profileVisibility" className="text-gray-900 font-semibold">Visibilidad del Perfil</Label>
                  <Select 
                    value={privacySettings.profileVisibility} 
                    onValueChange={(value) => {
                      setPrivacySettings({...privacySettings, profileVisibility: value});
                      markAsChanged();
                    }}
                  >
                    <SelectTrigger className="border-gray-300 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Todos en la Empresa</SelectItem>
                      <SelectItem value="team">Solo Mi Equipo</SelectItem>
                      <SelectItem value="managers">Solo Gerentes</SelectItem>
                      <SelectItem value="private">Privado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-gray-900 font-semibold">Mostrar Correo Electrónico</Label>
                    <p className="text-sm text-gray-700 font-medium">Permitir que otros vean tu correo electrónico</p>
                  </div>
                  <Switch
                    checked={privacySettings.showEmail}
                    onCheckedChange={(checked) => {
                      setPrivacySettings({...privacySettings, showEmail: checked});
                      markAsChanged();
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-gray-900 font-semibold">Mostrar Número de Teléfono</Label>
                    <p className="text-sm text-gray-700 font-medium">Permitir que otros vean tu número de teléfono</p>
                  </div>
                  <Switch
                    checked={privacySettings.showPhone}
                    onCheckedChange={(checked) => {
                      setPrivacySettings({...privacySettings, showPhone: checked});
                      markAsChanged();
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-gray-900 font-semibold">Permitir Mensajes Directos</Label>
                    <p className="text-sm text-gray-700 font-medium">Permitir que compañeros te envíen mensajes directos</p>
                  </div>
                  <Switch
                    checked={privacySettings.allowDirectMessages}
                    onCheckedChange={(checked) => {
                      setPrivacySettings({...privacySettings, allowDirectMessages: checked});
                      markAsChanged();
                    }}
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
                  <span>Configuración de Seguridad</span>
                </CardTitle>
                <CardDescription className="text-gray-800 font-medium">
                  Gestiona la seguridad de tu cuenta y contraseña
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-gray-900 font-semibold">Contraseña Actual</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        placeholder="Ingresa tu contraseña actual"
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
                    <Label htmlFor="newPassword" className="text-gray-900 font-semibold">Nueva Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        placeholder="Ingresa nueva contraseña"
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
                    <Label htmlFor="confirmPassword" className="text-gray-900 font-semibold">Confirmar Nueva Contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      placeholder="Confirma nueva contraseña"
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
                        Cambiando Contraseña...
                      </>
                    ) : (
                      'Cambiar Contraseña'
                    )}
                  </Button>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Información de Cuenta</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700 font-semibold">Correo</p>
                        <p className="font-medium text-gray-900">{user?.email}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700 font-semibold">Rol</p>
                        <p className="font-medium text-gray-900 capitalize">{user?.role === 'employee' ? 'Empleado' : user?.role}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700 font-semibold">Último Acceso</p>
                        <p className="font-medium text-gray-900">Hoy, 9:30 AM</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700 font-semibold">Estado de Cuenta</p>
                        <p className="font-medium text-emerald-600">Activo</p>
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
