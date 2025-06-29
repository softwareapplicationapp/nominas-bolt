import EmployeeLayout from '@/components/layout/employee-layout';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EmployeeLayout>{children}</EmployeeLayout>;
}