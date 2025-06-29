import { Metadata } from 'next';
import EmployeePayslipsPage from '@/components/employee/employee-payslips-page';

export const metadata: Metadata = {
  title: 'My Payslips - ArcusHR',
  description: 'View and download your payslips and salary information',
};

export default function EmployeePayslips() {
  return <EmployeePayslipsPage />;
}