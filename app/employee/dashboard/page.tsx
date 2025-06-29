import { Metadata } from 'next';
import EmployeeDashboardPage from '@/components/employee/employee-dashboard-page';

export const metadata: Metadata = {
  title: 'Employee Dashboard - ArcusHR',
  description: 'Employee portal for attendance, leave requests, and personal information',
};

export default function EmployeeDashboard() {
  return <EmployeeDashboardPage />;
}