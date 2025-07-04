'use client';

interface EmployeePageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function EmployeePageContainer({ children, className = '' }: EmployeePageContainerProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 ${className}`}>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {children}
      </div>
    </div>
  );
}
