import { Metadata } from 'next';
import ReportsPage from '@/components/reports/reports-page';

export const metadata: Metadata = {
  title: 'Reports - ArcusHR',
  description: 'View analytics and generate reports',
};

export default function Reports() {
  return <ReportsPage />;
}