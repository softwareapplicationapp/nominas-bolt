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
  Loader2,
  Plus,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import { useLanguage } from '@/contexts/language-context';
import { useEmployeeSettings } from '@/lib/employee-settings';

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

interface AttendanceRecord {
  id: number;
  date: string;
  check_in?: string;
  check_out?: string;
  total_hours: number;
  status: string;
  notes?: string;
  created_at: string;
}

export default function EmployeeDashboardPage() {
  const { user } = useAuth();
  const { settings } = useEmployeeSettings();
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
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
      console.log('=== DASHBOARD: Loading employee data ===');
      setLoading(true);
      
      const [statsData, profileData, attendanceData] = await Promise.all([
        apiClient.getMyStats(),
        apiClient.getMyProfile(),
        apiClient.getMyAttendance() // Load attendance records to check for open check-ins
      ]);

      console.log('=== DASHBOARD: Stats data received ===');
      console.log('Stats data:', statsData);

      console.log('=== DASHBOARD: Profile data received ===');
      console.log('Profile data:', profileData);

      console.log('=== DASHBOARD: Attendance data received ===');
      console.log('Attendance records:', attendanceData?.length || 0);

      setStats(statsData);
      setProfile(profileData);
      setAttendanceRecords(attendanceData || []);
    } catch (error: any) {
      console.error('DASHBOARD: Error loading employee data:', error);
      toast.error('Error al cargar datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      console.log('=== DASHBOARD: Checking in ===');
      await apiClient.checkInOut('check_in');
      toast.success('¡Nueva entrada registrada con éxito!');
      loadEmployeeData();
    } catch (error: any) {
      console.error('DASHBOARD: Check-in error:', error);
      toast.error(error.message);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingIn(true);
    try {
      console.log('=== DASHBOARD: Checking out ===');
      await apiClient.checkInOut('check_out');
      toast.success('¡Salida registrada con éxito!');
      loadEmployeeData();
    } catch (error: any) {
      console.error('DASHBOARD: Check-out error:', error);
      toast.error(error.message);
    } finally {
      setCheckingIn(false);
    }
  };

  // CRITICAL FIX: Calculate button logic based on attendance records
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter(record => record.date === today);
  const openCheckIn = todayRecords.find(record => record.check_in && !record.check_out);
  const hasOpenCheckIn = !!openCheckIn;
  const canCheckIn = !hasOpenCheckIn; // Only allow check-in if there's no open check-in

  console.log('=== DASHBOARD: Button Logic Debug ===');
  console.log('Today records:', todayRecords.length);
  console.log('Open check-in record:', openCheckIn);
  console.log('Has open check-in:', hasOpenCheckIn);
  console.log('Can check in:', canCheckIn);

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
      <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
        {/* Welcome Header */}
        <div className="animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 hover-lift border border-emerald-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                <div className="relative mx-auto sm:mx-0">
                  {settings.personal.profilePhoto ? (
                    <img
                      src={settings.personal.profilePhoto}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-lg"
                      alt="Profile"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
                      {profile ? `${profile.first_name[0]}${profile.last_name[0]}` : user?.email?.[0]?.toUpperCase() || 'E'}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full border-2 border-white animate-bounce-in"></div>
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                    ¡Bienvenido de nuevo, {profile ? profile.first_name : 'Empleado'}!
                  </h1>
                  <p className="text-gray-800 mt-1 font-semibold text-sm sm:text-base">
                    {format(currentTime, 'EEEE, d MMMM yyyy', { locale: language === 'es' ? es : undefined })}
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-mono text-emerald-700 mt-2 font-bold">
                    {format(currentTime, 'HH:mm:ss')}
                  </p>
                </div>
              </div>
              
              <div className="text-center lg:text-right">
                {/* Status Message */}
                <div className="mb-4">
                  {hasOpenCheckIn ? (
                    <div className="flex items-center justify-center lg:justify-end space-x-2 text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-semibold">
                        Entrada abierta desde las {openCheckIn?.check_in}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center lg:justify-end space-x-2 text-gray-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {todayRecords.length > 0 
                          ? 'Todas las sesiones cerradas'
                          : 'Listo para nueva entrada'
                        }
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-0 lg:space-y-4">
                  {/* CRITICAL FIX: Only show "Nueva Entrada" if there's no open check-in */}
                  {canCheckIn && (
                    <Button 
                      onClick={handleCheckIn}
                      disabled={checkingIn}
                      className="btn-success text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 animate-bounce-in w-full sm:w-auto"
                    >
                      {checkingIn ? (
                        <>
                          <Timer className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                          Registrando...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          Nueva Entrada
                        </>
                      )}
                    </Button>
                  )}

                  {/* Only show "Marcar Salida" if there's an open check-in */}
                  {hasOpenCheckIn && (
                    <Button 
                      onClick={handleCheckOut}
                      disabled={checkingIn}
                      variant="outline"
                      className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 hover-glow border-emerald-300 text-emerald-700 hover:text-emerald-900 font-semibold w-full sm:w-auto"
                    >
                      {checkingIn ? (
                        <>
                          <Timer className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                          Registrando...
                        </>
                      ) : (
                        <>
                          <LogOutIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          Marcar Salida
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="card-interactive animate-scale-in stagger-1 hover-glow border-blue-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {stats?.totalHoursToday.toFixed(1) || '0.0'}h
                  </div>
                  <p className="text-xs sm:text-sm text-gray-800 font-semibold">Horas Hoy</p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 rounded-full animate-float">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={(stats?.totalHoursToday || 0) / 8 * 100} className="progress-animated" />
                <p className="text-xs text-gray-700 mt-1 font-semibold">Objetivo: 8 horas</p>
                {hasOpenCheckIn && (
                  <p className="text-xs text-emerald-600 mt-1 font-medium">* Sesión en curso</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="card-interactive animate-scale-in stagger-2 hover-glow border-emerald-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {stats?.weeklyHours.toFixed(1) || '0.0'}h
                  </div>
                  <p className="text-xs sm:text-sm text-gray-800 font-semibold">Esta Semana</p>
                </div>
                <div className="p-2 sm:p-3 bg-emerald-100 rounded-full animate-float">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={(stats?.weeklyHours || 0) / 40 * 100} className="progress-animated" />
                <p className="text-xs text-gray-700 mt-1 font-semibold">Objetivo: 40 horas</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-interactive animate-scale-in stagger-3 hover-glow border-purple-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {stats?.monthlyAttendance || 0}%
                  </div>
                  <p className="text-xs sm:text-sm text-gray-800 font-semibold">Asistencia</p>
                </div>
                <div className="p-2 sm:p-3 bg-purple-100 rounded-full animate-float">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={stats?.monthlyAttendance || 0} className="progress-animated" />
                <p className="text-xs text-gray-700 mt-1 font-semibold">Este mes</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-interactive animate-scale-in stagger-4 hover-glow border-amber-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {stats?.remainingLeaves || 0}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-800 font-semibold">Días de Permiso</p>
                </div>
                <div className="p-2 sm:p-3 bg-amber-100 rounded-full animate-float">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Quick Actions - Removed Coffee Break */}
          <Card className="lg:col-span-1 animate-slide-in-left card-glow border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900 text-lg sm:text-xl">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                <span>Acciones Rápidas</span>
              </CardTitle>
              <CardDescription className="text-gray-800 font-medium text-sm">
                Tareas comunes y accesos directos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <Button className="w-full btn-primary justify-start text-sm sm:text-base" size="lg" asChild>
                <a href="/employee/leaves">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                  Solicitar Permiso
                </a>
              </Button>
              
              <Button className="w-full btn-success justify-start text-sm sm:text-base" size="lg" asChild>
                <a href="/employee/attendance">
                  <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                  Ver Horario
                </a>
              </Button>
              
              <Button className="w-full btn-warning justify-start text-sm sm:text-base" size="lg" asChild>
                <a href="/employee/profile">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                  Actualizar Perfil
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2 animate-slide-in-right card-glow border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900 text-lg sm:text-xl">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                <span>Actividad Reciente</span>
              </CardTitle>
              <CardDescription className="text-gray-800 font-medium text-sm">
                Tus últimas acciones y actualizaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hasOpenCheckIn && (
                  <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-emerald-50 rounded-lg hover-scale border border-emerald-200">
                    <div className="p-2 bg-emerald-100 rounded-full">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-emerald-800 text-sm sm:text-base">Entrada registrada con éxito</p>
                      <p className="text-xs sm:text-sm text-emerald-700 font-medium">Hoy a las {openCheckIn?.check_in}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-blue-50 rounded-lg hover-scale border border-blue-200">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-blue-800 text-sm sm:text-base">Estado de solicitudes de permiso</p>
                    <p className="text-xs sm:text-sm text-blue-700 font-medium">
                      {stats?.pendingLeaves || 0} pendientes, {stats?.approvedLeaves || 0} aprobadas
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-purple-50 rounded-lg hover-scale border border-purple-200">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Award className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-purple-800 text-sm sm:text-base">Asistencia mensual</p>
                    <p className="text-xs sm:text-sm text-purple-700 font-medium">{stats?.monthlyAttendance || 0}% este mes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Personal Info */}
          <Card className="animate-slide-in-up card-glow border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900 text-lg sm:text-xl">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <span>Información Personal</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover-scale border border-blue-200">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-700 font-semibold">Correo</p>
                    <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg hover-scale border border-emerald-200">
                  <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-700 font-semibold">Departamento</p>
                    <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{profile?.department || 'No asignado'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg hover-scale border border-purple-200">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-700 font-semibold">Ubicación</p>
                    <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{profile?.location || 'No especificada'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg hover-scale border border-amber-200">
                  <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-700 font-semibold">Fecha de Inicio</p>
                    <p className="font-bold text-gray-900 text-sm sm:text-base">
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
              <CardTitle className="flex items-center space-x-2 text-gray-900 text-lg sm:text-xl">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                <span>Resumen de Permisos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 sm:p-4 bg-amber-50 rounded-lg hover-scale border border-amber-200">
                  <div>
                    <p className="font-semibold text-amber-800 text-sm sm:text-base">Solicitudes Pendientes</p>
                    <p className="text-xs sm:text-sm text-amber-700 font-medium">Esperando aprobación</p>
                  </div>
                  <Badge variant="secondary" className="text-base sm:text-lg px-2 sm:px-3 py-1 bg-amber-100 text-amber-800 font-bold">
                    {stats?.pendingLeaves || 0}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 sm:p-4 bg-emerald-50 rounded-lg hover-scale border border-emerald-200">
                  <div>
                    <p className="font-semibold text-emerald-800 text-sm sm:text-base">Permisos Aprobados</p>
                    <p className="text-xs sm:text-sm text-emerald-700 font-medium">Este año</p>
                  </div>
                  <Badge variant="default" className="text-base sm:text-lg px-2 sm:px-3 py-1 bg-emerald-600 text-white font-bold">
                    {stats?.approvedLeaves || 0}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 sm:p-4 bg-blue-50 rounded-lg hover-scale border border-blue-200">
                  <div>
                    <p className="font-semibold text-blue-800 text-sm sm:text-base">Días Restantes</p>
                    <p className="text-xs sm:text-sm text-blue-700 font-medium">Disponibles para usar</p>
                  </div>
                  <Badge variant="outline" className="text-base sm:text-lg px-2 sm:px-3 py-1 border-blue-300 text-blue-800 font-bold">
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