import { Metadata } from 'next';
import SettingsPage from '@/components/settings/settings-page';

export const metadata: Metadata = {
  title: 'Settings - ArcusHR',
  description: 'Manage system settings and preferences',
};

export default function Settings() {
  return <SettingsPage />;
}