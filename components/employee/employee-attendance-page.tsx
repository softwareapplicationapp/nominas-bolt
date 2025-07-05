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
  Loader2,
  Plus,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { useLanguage } from '@/contexts/language-context';
import EmployeePageContainer from '@/components/layout/employee-page-container';

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

export default function EmployeeAttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
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
      } else {
        console.log('No attendance data or invalid format');
        setAttendanceRecords([]);
      }
    } catch (error: any) {
      console.error('Error loading attendance data:', error);
      toast.error('Error al cargar datos de asistencia: ' + error.message);
      setAttendanceRecords([]);
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
      toast.success('¡Nueva entrada registrada con éxito!');
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

  // Get today's records and check for open check-ins
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter(record => record.date === today);
  
  // CRITICAL FIX: Check if there's any open check-in (check_in exists but check_out is null)
  const openCheckIn = todayRecords.find(record => record.check_in && !record.check_out);
  const hasOpenCheckIn = !!openCheckIn;
  
  // Calculate if we can show "Nueva Entrada" button
  const canCheckIn = !hasOpenCheckIn; // Only allow check-in if there's no open check-in

  console.log('=== Button Logic Debug ===');
  console.log('Today records:', todayRecords.length);
  console.log('Open check-in record:', openCheckIn);
  console.log('Has open check-in:', hasOpenCheckIn);
  console.log('Can check in:', canCheckIn);

  if (loading) {
    return (
      <EmployeePageContainer>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </EmployeePageContainer>
    );
  }

  return (
    <EmployeePageContainer>
      <div className="space-y-8">
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
            <div className="space-y-4">
              {/* Today's Records Summary */}
              {todayRecords.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Registros de Hoy ({todayRecords.length})</h4>
                  <div className="space-y-2">
                    {todayRecords.map((record, index) => (
                      <div key={record.id} className="flex items-center justify-between text-sm">
                        <span className="text-blue-800">Sesión {index + 1}:</span>
                        <div className="flex items-center space-x-2">
                          {record.check_in && (
                            <span className="text-emerald-600 font-medium">
                              Entrada: {record.check_in}
                            </span>
                          )}
                          {record.check_out ? (
                            <span className="text-red-600 font-medium">
                              Salida: {record.check_out}
                            </span>
                          ) : (
                            <span className="text-amber-600 font-medium">
                              (En curso)
                            </span>
                          )}
                          {record.total_hours > 0 && (
                            <span className="text-blue-600 font-medium">
                              {record.total_hours.toFixed(2)}h
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status and Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  {hasOpenCheckIn ? (
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm text-amber-800 font-semibold">
                        Tienes una entrada abierta desde las {openCheckIn?.check_in}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 font-medium">
                        {todayRecords.length > 0 
                          ? 'Todas las sesiones están cerradas. Puedes registrar una nueva entrada'
                          : 'Puedes registrar una nueva entrada'
                        }
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  {/* CRITICAL FIX: Only show "Nueva Entrada" if there's no open check-in */}
                  {canCheckIn && (
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
                          <Plus className="h-4 w-4 mr-2" />
                          Nueva Entrada
                        </>
                      )}
                    </Button>
                  )}

                  {/* Only show "Marcar Salida" if there's an open check-in */}
                  {hasOpenCheckIn && (
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
                  )}
                </div>
              </div>

              {/* Today's Total */}
              {todayRecords.length > 0 && (
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-800">Total de Horas Hoy:</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {todayRecords.reduce((sum, record) => sum + (record.total_hours || 0), 0).toFixed(2)}h
                    </span>
                  </div>
                  {hasOpenCheckIn && (
                    <div className="mt-2 text-xs text-emerald-700 font-medium">
                      * Sesión en curso no incluida en el total
                    </div>
                  )}
                </div>
              )}
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
                            <TableCell className="text-gray-800 font-medium">
                              {record.check_out || (
                                <span className="text-amber-600 font-medium">En curso</span>
                              )}
                            </TableCell>
                            <TableCell className="text-gray-800 font-medium">
                              {record.total_hours ? `${record.total_hours.toFixed(2)}h` : '-'}
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
                        const dayRecords = attendanceRecords.filter(r => r.date === dateStr);
                        
                        if (dayRecords.length > 0) {
                          return (
                            <div className="space-y-3">
                              {dayRecords.map((record, index) => (
                                <div key={record.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                  <h4 className="font-semibold text-blue-900 mb-2">Sesión {index + 1}</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between p-2 bg-emerald-50 rounded border border-emerald-200">
                                      <span className="font-semibold text-emerald-800">Entrada</span>
                                      <Badge variant="outline" className="border-emerald-300 text-emerald-800 font-semibold">
                                        {record.check_in || 'No registrada'}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                                      <span className="font-semibold text-red-800">Salida</span>
                                      <Badge variant="outline" className="border-red-300 text-red-800 font-semibold">
                                        {record.check_out || 'En curso'}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="mt-2 flex items-center justify-between p-2 bg-purple-50 rounded border border-purple-200">
                                    <span className="font-semibold text-purple-800">Horas</span>
                                    <Badge variant="default" className="bg-purple-600 text-white font-semibold">
                                      {record.total_hours ? `${record.total_hours.toFixed(2)}h` : '0h'}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                              
                              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-gray-800">Total del Día</span>
                                  <Badge variant="default" className="bg-blue-600 text-white font-semibold text-lg">
                                    {dayRecords.reduce((sum, r) => sum + (r.total_hours || 0), 0).toFixed(2)}h
                                  </Badge>
                                </div>
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
    </EmployeePageContainer>
  );
}