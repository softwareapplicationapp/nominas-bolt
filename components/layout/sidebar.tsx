'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Building2,
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  CreditCard,
  FolderKanban,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const navigation = [
    { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('employees'), href: '/dashboard/employees', icon: Users },
    { name: t('attendance'), href: '/dashboard/attendance', icon: Clock },
    { name: t('leaves'), href: '/dashboard/leaves', icon: Calendar },
    { name: t('payroll'), href: '/dashboard/payroll', icon: CreditCard },
    { name: t('projects'), href: '/dashboard/projects', icon: FolderKanban },
    { name: t('reports'), href: '/dashboard/reports', icon: BarChart3 },
    { name: t('settings'), href: '/dashboard/settings', icon: Settings },
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
          'fixed inset-y-0 left-0 z-30 flex flex-col bg-slate-900 text-white transition-all duration-300 ease-in-out lg:relative lg:z-0',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className={cn('flex items-center', collapsed && 'justify-center')}>
            <div className="bg-blue-600 p-2 rounded-lg">
              <Building2 className="h-6 w-6" />
            </div>
            {!collapsed && (
              <span className="ml-3 text-xl font-semibold">ArcusHR</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex text-slate-400 hover:text-white hover:bg-slate-700"
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
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white',
                  collapsed && 'justify-center px-2'
                )}
                onClick={() => setOpen(false)}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white',
                    !collapsed && 'mr-3'
                  )}
                />
                {!collapsed && item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          {!collapsed && (
            <div className="mb-4">
              <p className="text-xs text-slate-400 mb-1">{t('signIn')}</p>
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-slate-400">{user?.email || 'admin@company.com'}</p>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              'w-full text-slate-300 hover:bg-slate-700 hover:text-white',
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