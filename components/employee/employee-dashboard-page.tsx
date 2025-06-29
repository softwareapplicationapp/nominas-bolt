'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Calendar, 
  User, 
  CheckCircle,
  Coffee,
  LogOut as LogOutIcon,
  TrendingUp,
  Award,
  Target,
  Timer,
  MapPin,
  Briefcase,
  Mail,
  CalendarDays,
  ClockIcon,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import { useLanguage } from '@/contexts/language-context';

interface EmployeeStats {
  attendanceToday: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  totalHoursToday: number;
  weeklyHours: number;
  monthlyAttendance: number;
  pendingLeaves: number;
  approvedLeaves: number;
  remainingLeaves: number;
}

interface EmployeeProfile {
  first_name: string;
  last_name: string;
  department: string;
  position: string;
  start_date: string;
  location?: string;
}

export default function EmployeeDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const { t, language } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadEmployeeData();
  }, []);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      const [statsData, profileData] = await Promise.all([
        apiClient.getMyStats(),
        apiClient.getMyProfile()
      ]);

      setStats(statsData);
      setProfile(profileData);
      setIsCheckedIn(statsData.attendanceToday && statsData.checkInTime && !statsData.checkOutTime);
    } catch (error: any) {
      toast.error('Error al cargar datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await apiClient.checkInOut('check_in');
      setIsCheckedIn(true);
      toast.success('¡Entrada registrada con éxito!');
      loadEmployeeData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingIn(true);
    try {
      await apiClient.checkInOut('check_out');
      setIsCheckedIn(false);
      toast.success('¡Salida registrada con éxito!');
      loadEmployeeData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="space-y-8 p-6">
        {/* Welcome Header */}
        <div className="animate-fade-in">
          <div className="dashboard-welcome-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 profile-avatar">
                    {profile ? `${profile.first_name[0]}${profile.last_name[0]}` : user?.email?.[0]?.toUpperCase() || 'E'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white animate-bounce-in"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    ¡Bienvenido de nuevo, {profile ? profile.first_name : 'Empleado'}!
                  </h1>
                  <p className="text-gray-800 mt-1 font-semibold">
                    {format(currentTime, 'EEEE, d MMMM yyyy', { locale: language === 'es' ? es : undefined })}
                  </p>
                  <p className="text-2xl font-mono text-emerald-700 mt-2 font-bold">
                    {format(currentTime, 'HH:mm:ss')}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-4">
                  {!isCheckedIn ? (
                    <Button 
                      onClick={handleCheckIn}
                      disabled={checkingIn}
                      className="btn-success text-lg px-8 py-4 animate-bounce-in"
                    >
                      {checkingIn ? (
                        <>
                          <Timer className="h-5 w-5 mr-2 animate-spin" />
                          Registrando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Marcar Entrada
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleCheckOut}
                      disabled={checkingIn}
                      variant="outline"
                      className="text-lg px-8 py-4 hover-glow border-emerald-300 text-emerald-700 hover:text-emerald-900 font-semibold"
                    >
                      {checkingIn ? (
                        <>
                          <Timer className="h-5 w-5 mr-2 animate-spin" />
                          Registrando...
                        </>
                      ) : (
                        <>
                          <LogOutIcon className="h-5 w-5 mr-2" />
                          Marcar Salida
                        </>
                      )}
                    </Button>
                  )}
                </div>
                {isCheckedIn && stats?.checkInTime && (
                  <p className="text-sm text-gray-700 mt-2 font-semibold">
                    Entrada registrada a las {stats.checkInTime}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats?.totalHoursToday.toFixed(1) || '0.0'}h
                  </div>
                  <p className="text-sm text-gray-800 font-semibold">Horas Hoy</p>
                </div>
                <div className="employee-stat-icon-blue">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={(stats?.totalHoursToday || 0) / 8 * 100} className="progress-animated" />
                <p className="text-xs text-gray-700 mt-1 font-semibold">Objetivo: 8 horas</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats?.weeklyHours.toFixed(1) || '0.0'}h
                  </div>
                  <p className="text-sm text-gray-800 font-semibold">Esta Semana</p>
                </div>
                <div className="employee-stat-icon-emerald">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={(stats?.weeklyHours || 0) / 40 * 100} className="progress-animated" />
                <p className="text-xs text-gray-700 mt-1 font-semibold">Objetivo: 40 horas</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats?.monthlyAttendance || 0}%
                  </div>
                  <p className="text-sm text-gray-800 font-semibold">Asistencia</p>
                </div>
                <div className="employee-stat-icon-purple">
                  <Award className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={stats?.monthlyAttendance || 0} className="progress-animated" />
                <p className="text-xs text-gray-700 mt-1 font-semibold">Este mes</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats?.remainingLeaves || 0}
                  </div>
                  <p className="text-sm text-gray-800 font-semibold">Días de Permiso</p>
                </div>
                <div className="employee-stat-icon-amber">
                  <Calendar className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={(stats?.remainingLeaves || 0) / 20 * 100} className="progress-animated" />
                <p className="text-xs text-gray-700 mt-1 font-semibold">Restantes este año</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <Card className="lg:col-span-1 animate-slide-in-left card-glow border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Target className="h-5 w-5 text-emerald-600" />
                <span>Acciones Rápidas</span>
              </CardTitle>
              <CardDescription className="text-gray-800 font-medium">
                Tareas comunes y accesos directos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="quick-action-button quick-action-blue" size="lg" asChild>
                <a href="/employee/leaves">
                  <Calendar className="h-5 w-5 mr-3" />
                  Solicitar Permiso
                </a>
              </Button>
              
              <Button className="quick-action-button quick-action-emerald" size="lg" asChild>
                <a href="/employee/attendance">
                  <ClockIcon className="h-5 w-5 mr-3" />
                  Ver Horario
                </a>
              </Button>
              
              <Button className="quick-action-button quick-action-amber" size="lg" asChild>
                <a href="/employee/profile">
                  <User className="h-5 w-5 mr-3" />
                  Actualizar Perfil
                </a>
              </Button>
              
              <Button className="quick-action-button quick-action-red" size="lg">
                <Coffee className="h-5 w-5 mr-3" />
                Tiempo de Descanso
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2 animate-slide-in-right card-glow border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span>Actividad Reciente</span>
              </CardTitle>
              <CardDescription className="text-gray-800 font-medium">
                Tus últimas acciones y actualizaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.checkInTime && (
                  <div className="activity-card activity-card-emerald">
                    <div className="p-2 bg-emerald-100 rounded-full">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-emerald-800">Entrada registrada con éxito</p>
                      <p className="text-sm text-emerald-700 font-medium">Hoy a las {stats.checkInTime}</p>
                    </div>
                  </div>
                )}
                
                <div className="activity-card activity-card-blue">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-blue-800">Estado de solicitudes de permiso</p>
                    <p className="text-sm text-blue-700 font-medium">
                      {stats?.pendingLeaves || 0} pendientes, {stats?.approvedLeaves || 0} aprobadas
                    </p>
                  </div>
                </div>
                
                <div className="activity-card activity-card-purple">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Award className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-purple-800">Asistencia mensual</p>
                    <p className="text-sm text-purple-700 font-medium">{stats?.monthlyAttendance || 0}% este mes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Info */}
          <Card className="animate-slide-in-up card-glow border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <User className="h-5 w-5 text-blue-600" />
                <span>Información Personal</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="profile-field">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="profile-field-label">Correo</p>
                    <p className="profile-field-value">{user?.email}</p>
                  </div>
                </div>
                
                <div className="profile-field">
                  <Briefcase className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="profile-field-label">Departamento</p>
                    <p className="profile-field-value">{profile?.department || 'No asignado'}</p>
                  </div>
                </div>
                
                <div className="profile-field">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="profile-field-label">Ubicación</p>
                    <p className="profile-field-value">{profile?.location || 'No especificada'}</p>
                  </div>
                </div>
                
                <div className="profile-field">
                  <CalendarDays className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="profile-field-label">Fecha de Inicio</p>
                    <p className="profile-field-value">
                      {profile?.start_date ? format(new Date(profile.start_date), 'dd MMM, yyyy', { locale: language === 'es' ? es : undefined }) : 'No disponible'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leave Summary */}
          <Card className="animate-slide-in-up card-glow border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Calendar className="h-5 w-5 text-amber-600" />
                <span>Resumen de Permisos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="activity-card activity-card-amber">
                  <div>
                    <p className="font-semibold text-amber-800">Solicitudes Pendientes</p>
                    <p className="text-sm text-amber-700 font-medium">Esperando aprobación</p>
                  </div>
                  <Badge variant="secondary" className="text-lg px-3 py-1 bg-amber-100 text-amber-800 font-bold">
                    {stats?.pendingLeaves || 0}
                  </Badge>
                </div>
                
                <div className="activity-card activity-card-emerald">
                  <div>
                    <p className="font-semibold text-emerald-800">Permisos Aprobados</p>
                    <p className="text-sm text-emerald-700 font-medium">Este año</p>
                  </div>
                  <Badge variant="default" className="text-lg px-3 py-1 bg-emerald-600 text-white font-bold">
                    {stats?.approvedLeaves || 0}
                  </Badge>
                </div>
                
                <div className="activity-card activity-card-blue">
                  <div>
                    <p className="font-semibold text-blue-800">Días Restantes</p>
                    <p className="text-sm text-blue-700 font-medium">Disponibles para usar</p>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1 border-blue-300 text-blue-800 font-bold">
                    {stats?.remainingLeaves || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}