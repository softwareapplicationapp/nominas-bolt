import { Metadata } from 'next';
import EmployeesPage from '@/components/employees/employees-page';

export const metadata: Metadata = {
  title: 'Employees - ArcusHR',
  description: 'Manage your company employees',
};

export default function Employees() {
  return <EmployeesPage />;
}