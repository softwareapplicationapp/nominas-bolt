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
  Target,
  Award
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
    { name: 'Performance', href: '/employee/performance', icon: Award },
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
          'fixed inset-y-0 left-0 z-30 flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 ease-in-out lg:relative lg:z-0 shadow-2xl',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <div className={cn('flex items-center', collapsed && 'justify-center')}>
            <div className="bg-gradient-primary p-2 rounded-lg animate-pulse-glow">
              <Target className="h-6 w-6" />
            </div>
            {!collapsed && (
              <span className="ml-3 text-xl font-semibold text-gradient">
                {t('employeePortal')}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex text-slate-400 hover:text-white hover:bg-slate-700/50 hover-scale"
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
        <nav className="flex-1 px-4 py-6 space-y-2 custom-scrollbar overflow-y-auto">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover-lift',
                  isActive
                    ? 'bg-gradient-primary text-white shadow-lg animate-pulse-glow'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover-scale',
                  collapsed && 'justify-center px-2',
                  `animate-slide-in-left stagger-${index + 1}`
                )}
                onClick={() => setOpen(false)}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0 transition-colors duration-200',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white',
                    !collapsed && 'mr-3'
                  )}
                />
                {!collapsed && (
                  <span className="transition-all duration-200">{item.name}</span>
                )}
                {!collapsed && isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions */}
        {!collapsed && (
          <div className="px-4 py-4 border-t border-slate-700/50 animate-slide-in-up">
            <p className="text-xs text-slate-400 mb-3 font-medium">{t('quickActions')}</p>
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-slate-300 hover:bg-slate-700/50 hover:text-white hover-scale"
              >
                <Coffee className="h-4 w-4 mr-2" />
                Take Break
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-slate-300 hover:bg-slate-700/50 hover:text-white hover-scale"
              >
                <Clock className="h-4 w-4 mr-2" />
                Check Status
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50">
          {!collapsed && (
            <div className="mb-4 animate-fade-in">
              <p className="text-xs text-slate-400 mb-1">{t('signIn')}</p>
              <p className="text-sm font-medium">{t('employees')}</p>
              <p className="text-xs text-slate-400">{user?.email || 'employee@company.com'}</p>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              'w-full text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition-all duration-200 hover-scale',
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