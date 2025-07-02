import { Metadata } from 'next';
// Forzar reevaluación de importaciones
import EmployeeSettingsPage from '@/components/employee/employee-settings-page';

export const metadata: Metadata = {
  title: 'Settings - ArcusHR Employee Portal',
  description: 'Manage your personal settings and preferences',
};

export default function EmployeeSettings() {
  return <EmployeeSettingsPage />;
}