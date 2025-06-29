import { Metadata } from 'next';
import DashboardPage from '@/components/dashboard/dashboard-page';

export const metadata: Metadata = {
  title: 'Dashboard - ArcusHR',
  description: 'ArcusHR Dashboard Overview',
};

export default function Dashboard() {
  return <DashboardPage />;
}