import { Metadata } from 'next';
import LeavesPage from '@/components/leaves/leaves-page';

export const metadata: Metadata = {
  title: 'Leave Management - ArcusHR',
  description: 'Manage employee leave requests and approvals',
};

export default function Leaves() {
  return <LeavesPage />;
}