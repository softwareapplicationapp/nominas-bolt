import { Metadata } from 'next';
import EmployeeLeavesPage from '@/components/employee/employee-leaves-page';

export const metadata: Metadata = {
  title: 'My Leave Requests - ArcusHR',
  description: 'Manage your leave requests and view leave history',
};

export default function EmployeeLeaves() {
  return <EmployeeLeavesPage />;
}