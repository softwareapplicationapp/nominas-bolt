import { Metadata } from 'next';
import PayrollPage from '@/components/payroll/payroll-page';

export const metadata: Metadata = {
  title: 'Payroll - ArcusHR',
  description: 'Manage employee payroll and compensation',
};

export default function Payroll() {
  return <PayrollPage />;
}