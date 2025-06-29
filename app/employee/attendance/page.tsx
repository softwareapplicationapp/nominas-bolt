import { Metadata } from 'next';
import EmployeeAttendancePage from '@/components/employee/employee-attendance-page';

export const metadata: Metadata = {
  title: 'My Attendance - ArcusHR',
  description: 'View your attendance records and check in/out',
};

export default function EmployeeAttendance() {
  return <EmployeeAttendancePage />;
}