export interface PersonalSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'es';
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export interface NotificationSettings {
  emailNotifications: boolean;
  leaveUpdates: boolean;
  payrollNotifications: boolean;
  reminderAlerts: boolean;
  mobileNotifications: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'team' | 'managers' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  allowDirectMessages: boolean;
}

export interface EmployeeSettingsData {
  personal: PersonalSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  lastUpdated: string;
}

const DEFAULT_SETTINGS: EmployeeSettingsData = {
  personal: {
    theme: 'light',
    language: 'es',
    timezone: 'America/New_York',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  },
  notifications: {
    emailNotifications: true,
    leaveUpdates: true,
    payrollNotifications: true,
    reminderAlerts: false,
    mobileNotifications: true
  },
  privacy: {
    profileVisibility: 'team',
    showEmail: false,
    showPhone: false,
    allowDirectMessages: true
  },
  lastUpdated: new Date().toISOString()
};

const STORAGE_KEY = 'arcushr_employee_settings';

export class EmployeeSettingsManager {
  private static instance: EmployeeSettingsManager;
  private settings: EmployeeSettingsData;
  private listeners: Array<(settings: EmployeeSettingsData) => void> = [];

  private constructor() {
    this.settings = this.loadFromStorage();
  }

  static getInstance(): EmployeeSettingsManager {
    if (!EmployeeSettingsManager.instance) {
      EmployeeSettingsManager.instance = new EmployeeSettingsManager();
    }
    return EmployeeSettingsManager.instance;
  }

  private loadFromStorage(): EmployeeSettingsData {
    if (typeof window === 'undefined') {
      return DEFAULT_SETTINGS;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all properties exist
        return {
          personal: { ...DEFAULT_SETTINGS.personal, ...parsed.personal },
          notifications: { ...DEFAULT_SETTINGS.notifications, ...parsed.notifications },
          privacy: { ...DEFAULT_SETTINGS.privacy, ...parsed.privacy },
          lastUpdated: parsed.lastUpdated || new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
    }

    return DEFAULT_SETTINGS;
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      this.settings.lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      this.notifyListeners();
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.settings));
  }

  // Subscribe to settings changes
  subscribe(listener: (settings: EmployeeSettingsData) => void): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Get all settings
  getSettings(): EmployeeSettingsData {
    return { ...this.settings };
  }

  // Get specific setting category
  getPersonalSettings(): PersonalSettings {
    return { ...this.settings.personal };
  }

  getNotificationSettings(): NotificationSettings {
    return { ...this.settings.notifications };
  }

  getPrivacySettings(): PrivacySettings {
    return { ...this.settings.privacy };
  }

  // Update settings
  updatePersonalSettings(updates: Partial<PersonalSettings>): void {
    this.settings.personal = { ...this.settings.personal, ...updates };
    this.saveToStorage();
  }

  updateNotificationSettings(updates: Partial<NotificationSettings>): void {
    this.settings.notifications = { ...this.settings.notifications, ...updates };
    this.saveToStorage();
  }

  updatePrivacySettings(updates: Partial<PrivacySettings>): void {
    this.settings.privacy = { ...this.settings.privacy, ...updates };
    this.saveToStorage();
  }

  // Update all settings at once
  updateAllSettings(settings: Partial<EmployeeSettingsData>): void {
    if (settings.personal) {
      this.settings.personal = { ...this.settings.personal, ...settings.personal };
    }
    if (settings.notifications) {
      this.settings.notifications = { ...this.settings.notifications, ...settings.notifications };
    }
    if (settings.privacy) {
      this.settings.privacy = { ...this.settings.privacy, ...settings.privacy };
    }
    this.saveToStorage();
  }

  // Reset to defaults
  resetToDefaults(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveToStorage();
  }

  // Export settings (for backup or sync)
  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  // Import settings (from backup or sync)
  importSettings(settingsJson: string): boolean {
    try {
      const imported = JSON.parse(settingsJson);
      // Validate the structure
      if (imported.personal && imported.notifications && imported.privacy) {
        this.settings = {
          personal: { ...DEFAULT_SETTINGS.personal, ...imported.personal },
          notifications: { ...DEFAULT_SETTINGS.notifications, ...imported.notifications },
          privacy: { ...DEFAULT_SETTINGS.privacy, ...imported.privacy },
          lastUpdated: new Date().toISOString()
        };
        this.saveToStorage();
        return true;
      }
    } catch (error) {
      console.error('Error importing settings:', error);
    }
    return false;
  }

  // Check if settings have been modified from defaults
  hasChanges(): boolean {
    const current = this.settings;
    const defaults = DEFAULT_SETTINGS;
    
    return JSON.stringify(current.personal) !== JSON.stringify(defaults.personal) ||
           JSON.stringify(current.notifications) !== JSON.stringify(defaults.notifications) ||
           JSON.stringify(current.privacy) !== JSON.stringify(defaults.privacy);
  }

  // Get last updated timestamp
  getLastUpdated(): Date {
    return new Date(this.settings.lastUpdated);
  }
}

// Hook for React components
export function useEmployeeSettings() {
  const [settings, setSettings] = React.useState<EmployeeSettingsData>(() => 
    EmployeeSettingsManager.getInstance().getSettings()
  );

  React.useEffect(() => {
    const manager = EmployeeSettingsManager.getInstance();
    const unsubscribe = manager.subscribe(setSettings);
    return unsubscribe;
  }, []);

  const updatePersonal = React.useCallback((updates: Partial<PersonalSettings>) => {
    EmployeeSettingsManager.getInstance().updatePersonalSettings(updates);
  }, []);

  const updateNotifications = React.useCallback((updates: Partial<NotificationSettings>) => {
    EmployeeSettingsManager.getInstance().updateNotificationSettings(updates);
  }, []);

  const updatePrivacy = React.useCallback((updates: Partial<PrivacySettings>) => {
    EmployeeSettingsManager.getInstance().updatePrivacySettings(updates);
  }, []);

  const resetToDefaults = React.useCallback(() => {
    EmployeeSettingsManager.getInstance().resetToDefaults();
  }, []);

  const hasChanges = React.useCallback(() => {
    return EmployeeSettingsManager.getInstance().hasChanges();
  }, []);

  return {
    settings,
    updatePersonal,
    updateNotifications,
    updatePrivacy,
    resetToDefaults,
    hasChanges
  };
}

// Import React for the hook
import React from 'react';