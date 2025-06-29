import { Metadata } from 'next';
import EmployeeProfilePage from '@/components/employee/employee-profile-page';

export const metadata: Metadata = {
  title: 'My Profile - ArcusHR',
  description: 'View and update your personal information',
};

export default function EmployeeProfile() {
  return <EmployeeProfilePage />;
}