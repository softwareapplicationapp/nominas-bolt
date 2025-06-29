import { Metadata } from 'next';
import AttendancePage from '@/components/attendance/attendance-page';

export const metadata: Metadata = {
  title: 'Attendance - ArcusHR',
  description: 'Track employee attendance and time logs',
};

export default function Attendance() {
  return <AttendancePage />;
}