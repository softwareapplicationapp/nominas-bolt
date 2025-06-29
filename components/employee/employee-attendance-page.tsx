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
  Target,
  Award,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

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
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getMyAttendance();
      setAttendanceRecords(data);
      
      // Check if already checked in today
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = data.find((record: AttendanceRecord) => record.date === today);
      setTodayRecord(todayAttendance || null);
      setIsCheckedIn(!!todayAttendance?.check_in && !todayAttendance?.check_out);
    } catch (error: any) {
      toast.error('Failed to load attendance data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const data = await apiClient.checkInOut('check_in');
      setTodayRecord(data);
      setIsCheckedIn(true);
      toast.success('Checked in successfully!');
      loadAttendanceData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const data = await apiClient.checkInOut('check_out');
      setTodayRecord(data);
      setIsCheckedIn(false);
      toast.success('Checked out successfully!');
      loadAttendanceData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Calculate stats
  const totalHours = attendanceRecords.reduce((sum, record) => sum + (record.total_hours || 0), 0);
  const averageHours = attendanceRecords.length > 0 ? totalHours / attendanceRecords.length : 0;
  const presentDays = attendanceRecords.filter(record => record.status === 'present').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 text-gradient">My Attendance</h1>
          <p className="text-gray-800 mt-2 font-semibold">Track your working hours and attendance records</p>
        </div>

        {/* Check In/Out Card */}
        <Card className="animate-scale-in hover-glow border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Today's Attendance</span>
            </CardTitle>
            <CardDescription className="text-gray-800 font-medium">
              {format(new Date(), 'EEEE, MMMM do, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                {todayRecord?.check_in && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm text-gray-900 font-semibold">Checked in at {todayRecord.check_in}</span>
                  </div>
                )}
                {todayRecord?.check_out && (
                  <div className="flex items-center space-x-2">
                    <LogOutIcon className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-gray-900 font-semibold">Checked out at {todayRecord.check_out}</span>
                  </div>
                )}
                {todayRecord?.total_hours && (
                  <div className="flex items-center space-x-2">
                    <Timer className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-900 font-semibold">Total hours: {todayRecord.total_hours.toFixed(1)}h</span>
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
                        Checking In...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Check In
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
                        Checking Out...
                      </>
                    ) : (
                      <>
                        <LogOutIcon className="h-4 w-4 mr-2" />
                        Check Out
                      </>
                    )}
                  </Button>
                ) : (
                  <Badge variant="default" className="text-lg px-4 py-2 bg-emerald-600 text-white font-semibold">
                    Day Complete
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
                  <p className="text-sm text-gray-800 font-semibold">Total Hours</p>
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
                  <p className="text-sm text-gray-800 font-semibold">Average Daily</p>
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
                  <p className="text-sm text-gray-800 font-semibold">Days Present</p>
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
            <TabsTrigger value="records" className="text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm font-semibold">Attendance Records</TabsTrigger>
            <TabsTrigger value="calendar" className="text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm font-semibold">Calendar View</TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="space-y-6">
            <Card className="animate-slide-in-up card-glow border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">My Attendance History</CardTitle>
                <CardDescription className="text-gray-800 font-medium">
                  Your complete attendance records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-900 font-semibold">Date</TableHead>
                        <TableHead className="text-gray-900 font-semibold">Check In</TableHead>
                        <TableHead className="text-gray-900 font-semibold">Check Out</TableHead>
                        <TableHead className="text-gray-900 font-semibold">Total Hours</TableHead>
                        <TableHead className="text-gray-900 font-semibold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium text-gray-900">
                            {format(new Date(record.date), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell className="text-gray-800 font-medium">{record.check_in || '-'}</TableCell>
                          <TableCell className="text-gray-800 font-medium">{record.check_out || '-'}</TableCell>
                          <TableCell className="text-gray-800 font-medium">
                            {record.total_hours ? `${record.total_hours.toFixed(1)}h` : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                record.status === 'present' ? 'default' :
                                record.status === 'late' ? 'destructive' : 'secondary'
                              }
                              className={
                                record.status === 'present' ? 'bg-emerald-600 text-white' :
                                record.status === 'late' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'
                              }
                            >
                              {record.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="animate-slide-in-left card-glow border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Select Date</CardTitle>
                  <CardDescription className="text-gray-800 font-medium">
                    Choose a date to view attendance details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border border-gray-200"
                  />
                </CardContent>
              </Card>

              <Card className="animate-slide-in-right card-glow border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">
                    Attendance for {selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : 'Select a date'}
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
                                <span className="font-semibold text-emerald-800">Check In</span>
                                <Badge variant="outline" className="border-emerald-300 text-emerald-800 font-semibold">{dayRecord.check_in || 'Not recorded'}</Badge>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                                <span className="font-semibold text-red-800">Check Out</span>
                                <Badge variant="outline" className="border-red-300 text-red-800 font-semibold">{dayRecord.check_out || 'Not recorded'}</Badge>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="font-semibold text-blue-800">Total Hours</span>
                                <Badge variant="default" className="bg-blue-600 text-white font-semibold">
                                  {dayRecord.total_hours ? `${dayRecord.total_hours.toFixed(1)}h` : '0h'}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <span className="font-semibold text-purple-800">Status</span>
                                <Badge 
                                  variant={
                                    dayRecord.status === 'present' ? 'default' :
                                    dayRecord.status === 'late' ? 'destructive' : 'secondary'
                                  }
                                  className={
                                    dayRecord.status === 'present' ? 'bg-emerald-600 text-white' :
                                    dayRecord.status === 'late' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'
                                  }
                                >
                                  {dayRecord.status}
                                </Badge>
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div className="text-center py-8 text-gray-700">
                              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                              <p className="font-semibold">No attendance record for this date</p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-700">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="font-semibold">Please select a date to view details</p>
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