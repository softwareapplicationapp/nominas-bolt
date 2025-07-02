import { Metadata } from 'next';
import { EmployeeSettingsPage } from '@/components/employee/employee-settings-page';

export const metadata: Metadata = {
  title: 'Settings - ArcusHR Employee Portal',
  description: 'Manage your personal settings and preferences',
};

export default function EmployeeSettings() {
  return <EmployeeSettingsPage />;
}