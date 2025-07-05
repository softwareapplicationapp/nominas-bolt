'use client';

import { Menu, Bell, Search, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import { useAppSettings } from '@/contexts/app-settings-context';

interface EmployeeHeaderProps {
  onMenuClick: () => void;
}

export default function EmployeeHeader({ onMenuClick }: EmployeeHeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const { settings } = useAppSettings();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden hover-scale text-gray-700 p-2"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar..."
              className="pl-10 w-60 lg:w-80 bg-white/50 border-gray-300 hover-glow focus:bg-white transition-all duration-200 text-gray-900"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {settings.logo && (
            <img src={settings.logo} alt="Logo" className="h-6 w-6 rounded" />
          )}
          <span className="hidden sm:block font-semibold text-gray-700">
            {settings.companyName}
          </span>
          {/* Mobile Search */}
          <Button variant="ghost" size="sm" className="md:hidden p-2">
            <Search className="h-5 w-5" />
          </Button>

          {/* Quick Actions - Removed Coffee Break */}
          <Button variant="ghost" size="sm" className="hover-scale text-primary p-2 hidden sm:flex">
            <Clock className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative hover-scale text-gray-700 p-2">
                <Bell className="h-5 w-5" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs animate-bounce-in"
                >
                  2
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 sm:w-80 glass">
              <DropdownMenuLabel className="text-gray-900 font-semibold">Notificaciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start p-4 hover-scale cursor-pointer">
                <p className="font-semibold text-gray-900 text-sm">Solicitud de permiso aprobada</p>
                <p className="text-xs text-gray-800">Tu solicitud de vacaciones para la próxima semana ha sido aprobada</p>
                <p className="text-xs text-gray-600 mt-1">Hace 2 horas</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start p-4 hover-scale cursor-pointer">
                <p className="font-semibold text-gray-900 text-sm">Recordatorio: Reunión de equipo</p>
                <p className="text-xs text-gray-800">No olvides la reunión de equipo a las 3 PM</p>
                <p className="text-xs text-gray-600 mt-1">Hace 1 hora</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full hover-scale p-0">
                <Avatar className="animate-pulse-glow h-8 w-8 sm:h-10 sm:w-10">
                  <AvatarImage src="/employee-avatar.jpg" alt="Empleado" />
                  <AvatarFallback className="bg-gradient-to-r from-primary to-primary text-white text-xs sm:text-sm">
                    {user?.email?.[0]?.toUpperCase() || 'E'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 glass" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-gray-900 leading-none">Empleado</p>
                  <p className="text-xs leading-none text-gray-700">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover-scale cursor-pointer text-gray-800">
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="hover-scale cursor-pointer text-gray-800">
                <Clock className="mr-2 h-4 w-4" />
                Control de Tiempo
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 hover-scale cursor-pointer"
                onClick={handleLogout}
              >
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}