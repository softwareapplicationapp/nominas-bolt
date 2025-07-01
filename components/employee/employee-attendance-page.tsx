'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  Calendar as CalendarIcon, 
  CheckCircle, 
  LogOut as LogOutIcon,
  Timer,
  TrendingUp,
  Award,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { useLanguage } from '@/contexts/language-context';

interface AttendanceRecord {
  id: number;
  date: string;
  check_in?: string;
  check_out?: string;
  total_hours: number;
  status: string;
  notes?: string;
}

export default function EmployeeAttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { t, language } = useLanguage();

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      console.log('=== Loading employee attendance data ===');
      setLoading(true);
      
      // Load all attendance records for the employee
      const data = await apiClient.getMyAttendance();
      console.log('Attendance data received:', data);
      console.log('Number of records:', data?.length || 0);
      
      if (data && Array.isArray(data)) {
        setAttendanceRecords(data);
        
        // Find today's record
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = data.find((record: AttendanceRecord) => record.date === today);
        console.log('Today record found:', todayAttendance);
        setTodayRecord(todayAttendance || null);
      } else {
        console.log('No attendance data or invalid format');
        setAttendanceRecords([]);
        setTodayRecord(null);
      }
    } catch (error: any) {
      console.error('Error loading attendance data:', error);
      toast.error('Error al cargar datos de asistencia: ' + error.message);
      setAttendanceRecords([]);
      setTodayRecord(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      console.log('=== Checking in ===');
      const data = await apiClient.checkInOut('check_in');
      console.log('Check-in response:', data);
      setTodayRecord(data);
      toast.success('¡Entrada registrada con éxito!');
      // Reload all data to refresh the table
      await loadAttendanceData();
    } catch (error: any) {
      console.error('Check-in error:', error);
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      console.log('=== Checking out ===');
      const data = await apiClient.checkInOut('check_out');
      console.log('Check-out response:', data);
      setTodayRecord(data);
      toast.success('¡Salida registrada con éxito!');
      // Reload all data to refresh the table
      await loadAttendanceData();
    } catch (error: any) {
      console.error('Check-out error:', error);
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Calculate stats from the loaded data
  const totalHours = attendanceRecords.reduce((sum, record) => sum + (record.total_hours || 0), 0);
  const averageHours = attendanceRecords.length > 0 ? totalHours / attendanceRecords.length : 0;
  const presentDays = attendanceRecords.filter(record => record.status === 'present').length;

  console.log('=== Stats calculation ===');
  console.log('Total records:', attendanceRecords.length);
  console.log('Total hours:', totalHours);
  console.log('Average hours:', averageHours);
  console.log('Present days:', presentDays);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 text-gradient">Mi Asistencia</h1>
          <p className="text-gray-800 mt-2 font-semibold">Controla tus horas de trabajo y registros de asistencia</p>
        </div>

        {/* Check In/Out Card */}
        <Card className="animate-scale-in hover-glow border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Asistencia de Hoy</span>
            </CardTitle>
            <CardDescription className="text-gray-800 font-medium">
              {format(new Date(), 'EEEE, d MMMM yyyy', { locale: language === 'es' ? es : undefined })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                {todayRecord?.check_in && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm text-gray-900 font-semibold">Entrada a las {todayRecord.check_in}</span>
                  </div>
                )}
                {todayRecord?.check_out && (
                  <div className="flex items-center space-x-2">
                    <LogOutIcon className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-gray-900 font-semibold">Salida a las {todayRecord.check_out}</span>
                  </div>
                )}
                {todayRecord?.total_hours && todayRecord.total_hours > 0 && (
                  <div className="flex items-center space-x-2">
                    <Timer className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-900 font-semibold">Horas totales: {todayRecord.total_hours.toFixed(1)}h</span>
                  </div>
                )}
                {!todayRecord && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 font-medium">No has fichado hoy</span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                {!todayRecord?.check_in ? (
                  <Button 
                    onClick={handleCheckIn}
                    disabled={actionLoading}
                    className="btn-success"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Marcar Entrada
                      </>
                    )}
                  </Button>
                ) : !todayRecord?.check_out ? (
                  <Button 
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                    variant="outline"
                    className="hover-glow border-gray-300 text-gray-800 hover:text-gray-900 font-semibold"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      <>
                        <LogOutIcon className="h-4 w-4 mr-2" />
                        Marcar Salida
                      </>
                    )}
                  </Button>
                ) : (
                  <Badge variant="default" className="text-lg px-4 py-2 bg-emerald-600 text-white font-semibold">
                    Día Completado
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-interactive animate-scale-in stagger-1 hover-glow border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {totalHours.toFixed(1)}h
                  </div>
                  <p className="text-sm text-gray-800 font-semibold">Horas Totales</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full animate-float">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-interactive animate-scale-in stagger-2 hover-glow border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {averageHours.toFixed(1)}h
                  </div>
                  <p className="text-sm text-gray-800 font-semibold">Promedio Diario</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-full animate-float">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-interactive animate-scale-in stagger-3 hover-glow border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {presentDays}
                  </div>
                  <p className="text-sm text-gray-800 font-semibold">Días Presentes</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full animate-float">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="records" className="space-y-6">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="records" className="text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm font-semibold">Registros de Asistencia</TabsTrigger>
            <TabsTrigger value="calendar" className="text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm font-semibold">Vista de Calendario</TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="space-y-6">
            <Card className="animate-slide-in-up card-glow border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Mi Historial de Asistencia</CardTitle>
                <CardDescription className="text-gray-800 font-medium">
                  Tus registros completos de asistencia
                </CardDescription>
              </CardHeader>
              <CardContent>
                {attendanceRecords.length > 0 ? (
                  <div className="rounded-md border border-gray-200">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-gray-900 font-semibold">Fecha</TableHead>
                          <TableHead className="text-gray-900 font-semibold">Entrada</TableHead>
                          <TableHead className="text-gray-900 font-semibold">Salida</TableHead>
                          <TableHead className="text-gray-900 font-semibold">Horas Totales</TableHead>
                          <TableHead className="text-gray-900 font-semibold">Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendanceRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium text-gray-900">
                              {format(new Date(record.date), 'dd MMM, yyyy', { locale: language === 'es' ? es : undefined })}
                            </TableCell>
                            <TableCell className="text-gray-800 font-medium">{record.check_in || '-'}</TableCell>
                            <TableCell className="text-gray-800 font-medium">{record.check_out || '-'}</TableCell>
                            <TableCell className="text-gray-800 font-medium">
                              {record.total_hours ? `${record.total_hours.toFixed(1)}h` : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={
                                  record.status === 'present' ? 'badge-approved' :
                                  record.status === 'late' ? 'badge-rejected' : 'badge-inactive'
                                }
                              >
                                {record.status === 'present' ? 'Presente' :
                                 record.status === 'absent' ? 'Ausente' :
                                 record.status === 'late' ? 'Tarde' : record.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 font-semibold">No hay registros de asistencia</p>
                    <p className="text-gray-500 text-sm mt-2">Comienza marcando tu entrada para ver tu historial</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="animate-slide-in-left card-glow border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Seleccionar Fecha</CardTitle>
                  <CardDescription className="text-gray-800 font-medium">
                    Elige una fecha para ver detalles de asistencia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border border-gray-200"
                    locale={language === 'es' ? es : undefined}
                  />
                </CardContent>
              </Card>

              <Card className="animate-slide-in-right card-glow border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">
                    Asistencia para {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: language === 'es' ? es : undefined }) : 'Selecciona una fecha'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDate ? (
                    <div className="space-y-4">
                      {(() => {
                        const dateStr = format(selectedDate, 'yyyy-MM-dd');
                        const dayRecord = attendanceRecords.find(r => r.date === dateStr);
                        
                        if (dayRecord) {
                          return (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                <span className="font-semibold text-emerald-800">Entrada</span>
                                <Badge variant="outline" className="border-emerald-300 text-emerald-800 font-semibold">{dayRecord.check_in || 'No registrada'}</Badge>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                                <span className="font-semibold text-red-800">Salida</span>
                                <Badge variant="outline" className="border-red-300 text-red-800 font-semibold">{dayRecord.check_out || 'No registrada'}</Badge>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="font-semibold text-blue-800">Horas Totales</span>
                                <Badge variant="default" className="bg-blue-600 text-white font-semibold">
                                  {dayRecord.total_hours ? `${dayRecord.total_hours.toFixed(1)}h` : '0h'}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <span className="font-semibold text-purple-800">Estado</span>
                                <Badge 
                                  className={
                                    dayRecord.status === 'present' ? 'badge-approved' :
                                    dayRecord.status === 'late' ? 'badge-rejected' : 'badge-inactive'
                                  }
                                >
                                  {dayRecord.status === 'present' ? 'Presente' :
                                   dayRecord.status === 'absent' ? 'Ausente' :
                                   dayRecord.status === 'late' ? 'Tarde' : dayRecord.status}
                                </Badge>
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div className="text-center py-8 text-gray-700">
                              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                              <p className="font-semibold">No hay registro de asistencia para esta fecha</p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-700">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="font-semibold">Por favor selecciona una fecha para ver detalles</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}