'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  User,
  LayoutDashboard,
  Clock,
  Calendar,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Coffee,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';

interface EmployeeSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function EmployeeSidebar({ open, setOpen }: EmployeeSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const navigation = [
    { name: t('dashboard'), href: '/employee/dashboard', icon: LayoutDashboard },
    { name: t('myAttendance'), href: '/employee/attendance', icon: Clock },
    { name: t('myLeaves'), href: '/employee/leaves', icon: Calendar },
    { name: t('myProfile'), href: '/employee/profile', icon: User },
    { name: t('myPayslips'), href: '/employee/payslips', icon: FileText },
    { name: t('settings'), href: '/employee/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex flex-col bg-gradient-to-b from-emerald-800 via-emerald-700 to-emerald-800 text-white transition-all duration-300 ease-in-out lg:relative lg:z-0 shadow-2xl',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          collapsed ? 'w-16' : 'w-64 sm:w-72'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-emerald-600/50">
          <div className={cn('flex items-center', collapsed && 'justify-center')}>
            <div className="bg-emerald-600 p-2 rounded-lg shadow-lg">
              <Target className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            {!collapsed && (
              <span className="ml-2 sm:ml-3 text-lg sm:text-xl font-bold">
                {t('employeePortal')}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex text-emerald-300 hover:text-white hover:bg-emerald-600/50 p-1"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2 custom-scrollbar overflow-y-auto">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-2 sm:px-3 py-2 sm:py-3 text-sm font-semibold rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-emerald-200 hover:bg-emerald-600/50 hover:text-white',
                  collapsed && 'justify-center px-2'
                )}
                onClick={() => setOpen(false)}
              >
                <item.icon
                  className={cn(
                    'h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 transition-colors duration-200',
                    isActive ? 'text-white' : 'text-emerald-300 group-hover:text-white',
                    !collapsed && 'mr-2 sm:mr-3'
                  )}
                />
                {!collapsed && (
                  <span className="transition-all duration-200 text-sm sm:text-base">{item.name}</span>
                )}
                {!collapsed && isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions */}
        {!collapsed && (
          <div className="px-3 sm:px-4 py-3 sm:py-4 border-t border-emerald-600/50">
            <p className="text-xs text-emerald-300 mb-2 sm:mb-3 font-semibold">{t('quickActions')}</p>
            <div className="space-y-1 sm:space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-emerald-200 hover:bg-emerald-600/50 hover:text-white font-medium text-xs sm:text-sm"
              >
                <Coffee className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Tiempo de Descanso
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-emerald-200 hover:bg-emerald-600/50 hover:text-white font-medium text-xs sm:text-sm"
              >
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Verificar Estado
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-emerald-600/50">
          {!collapsed && (
            <div className="mb-3 sm:mb-4">
              <p className="text-xs text-emerald-300 mb-1 font-medium">Conectado como</p>
              <p className="text-sm font-semibold text-white">Empleado</p>
              <p className="text-xs text-emerald-300 font-medium truncate">{user?.email || 'employee@company.com'}</p>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              'w-full text-emerald-200 hover:bg-red-600/20 hover:text-red-300 transition-all duration-200 font-semibold text-sm',
              collapsed ? 'px-2' : 'justify-start'
            )}
          >
            <LogOut className={cn('h-4 w-4', !collapsed && 'mr-2')} />
            {!collapsed && t('signOut')}
          </Button>
        </div>
      </div>
    </>
  );
}