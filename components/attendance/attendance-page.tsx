'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Calendar as CalendarIcon, Users, AlertCircle, CheckCircle, Plus, Loader2, Edit, Save, X, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

interface AttendanceRecord {
  id: number;
  employee_id: number;
  first_name: string;
  last_name: string;
  department: string;
  date: string;
  check_in?: string;
  check_out?: string;
  total_hours: number;
  status: string;
  notes?: string;
  created_at: string;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  department: string;
}

export default function AttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Filter states
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));

  // Form state
  const [formData, setFormData] = useState({
    employeeId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    checkIn: '',
    checkOut: '',
    status: 'present',
    notes: ''
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    checkIn: '',
    checkOut: '',
    status: 'present',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [attendanceRecords, selectedEmployee, selectedMonth]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [attendanceData, employeesData] = await Promise.all([
        apiClient.getAttendance(),
        apiClient.getEmployees()
      ]);
      setAttendanceRecords(attendanceData);
      setEmployees(employeesData);
    } catch (error: any) {
      toast.error('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...attendanceRecords];

    // Filter by employee
    if (selectedEmployee !== 'all') {
      filtered = filtered.filter(record => record.employee_id.toString() === selectedEmployee);
    }

    // Filter by month
    if (selectedMonth) {
      filtered = filtered.filter(record => record.date.startsWith(selectedMonth));
    }

    // Sort by date and created_at (most recent first)
    filtered.sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setFilteredRecords(filtered);
  };

  const downloadCSV = async () => {
    setIsDownloading(true);
    try {
      // Prepare CSV data
      const headers = [
        'Empleado',
        'Departamento', 
        'Fecha',
        'Entrada',
        'Salida',
        'Horas Totales',
        'Estado',
        'Notas'
      ];

      const csvData = filteredRecords.map(record => [
        `${record.first_name} ${record.last_name}`,
        record.department,
        format(new Date(record.date), 'dd/MM/yyyy'),
        record.check_in || '',
        record.check_out || '',
        record.total_hours ? record.total_hours.toFixed(2) : '0',
        record.status === 'present' ? 'Presente' :
        record.status === 'absent' ? 'Ausente' :
        record.status === 'late' ? 'Tarde' :
        record.status === 'half_day' ? 'Medio Día' : record.status,
        record.notes || ''
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          row.map(cell => 
            // Escape commas and quotes in CSV
            typeof cell === 'string' && (cell.includes(',') || cell.includes('"')) 
              ? `"${cell.replace(/"/g, '""')}"` 
              : cell
          ).join(',')
        )
      ].join('\n');

      // Add BOM for proper UTF-8 encoding in Excel
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

      // Generate filename based on filters
      let filename = 'asistencia';
      
      if (selectedEmployee !== 'all') {
        const employee = employees.find(emp => emp.id.toString() === selectedEmployee);
        if (employee) {
          filename += `_${employee.first_name}_${employee.last_name}`;
        }
      }
      
      if (selectedMonth) {
        const monthYear = format(new Date(selectedMonth + '-01'), 'MM-yyyy');
        filename += `_${monthYear}`;
      }
      
      filename += `_${format(new Date(), 'dd-MM-yyyy')}.csv`;

      // Download the file
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      toast.success(`Archivo CSV descargado: ${filename}`);
    } catch (error: any) {
      console.error('Error downloading CSV:', error);
      toast.error('Error al descargar el archivo CSV');
    } finally {
      setIsDownloading(false);
    }
  };

  const loadAttendanceForDate = async (date: string) => {
    try {
      const data = await apiClient.getAttendance(date);
      setAttendanceRecords(data);
    } catch (error: any) {
      toast.error('Failed to load attendance: ' + error.message);
    }
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiClient.createAttendance({
        employeeId: parseInt(formData.employeeId),
        date: formData.date,
        checkIn: formData.checkIn || null,
        checkOut: formData.checkOut || null,
        status: formData.status,
        notes: formData.notes || null
      });
      
      toast.success('Attendance record created successfully!');
      setIsDialogOpen(false);
      setFormData({
        employeeId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        checkIn: '',
        checkOut: '',
        status: 'present',
        notes: ''
      });
      loadData();
    } catch (error: any) {
      toast.error('Failed to create attendance record: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRecord = (record: AttendanceRecord) => {
    setEditingRecord(record);
    
    // Validate and set the status - ensure it's always a valid value
    const validStatuses = ['present', 'absent', 'late', 'half_day'];
    const status = validStatuses.includes(record.status) ? record.status : 'present';
    
    console.log('=== EDITING RECORD ===');
    console.log('Original record:', record);
    console.log('Original status:', record.status);
    console.log('Validated status:', status);
    
    setEditFormData({
      checkIn: record.check_in || '',
      checkOut: record.check_out || '',
      status: status,
      notes: record.notes || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    setIsSubmitting(true);
    try {
      // Calculate total hours if both times are provided
      let totalHours = 0;
      if (editFormData.checkIn && editFormData.checkOut) {
        const checkInTime = new Date(`2000-01-01 ${editFormData.checkIn}`);
        const checkOutTime = new Date(`2000-01-01 ${editFormData.checkOut}`);
        totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
      }

      console.log('=== UPDATING RECORD ===');
      console.log('Record ID:', editingRecord.id);
      console.log('Form data:', editFormData);
      console.log('Calculated total hours:', totalHours);

      await apiClient.updateAttendance(editingRecord.id, {
        checkIn: editFormData.checkIn || null,
        checkOut: editFormData.checkOut || null,
        totalHours,
        status: editFormData.status,
        notes: editFormData.notes || null
      });

      toast.success('Attendance record updated successfully!');
      setIsEditDialogOpen(false);
      setEditingRecord(null);
      loadData();
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error('Failed to update attendance record: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate stats
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayRecords = filteredRecords.filter(record => record.date === today);
  const presentToday = todayRecords.filter(record => record.status === 'present').length;
  const absentToday = employees.length - todayRecords.length;
  const lateToday = todayRecords.filter(record => record.status === 'late').length;
  const attendanceRate = employees.length > 0 ? Math.round((presentToday / employees.length) * 100) : 0;

  // Generate month options for the last 12 months
  const monthOptions = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const value = format(date, 'yyyy-MM');
    const label = format(date, 'MMMM yyyy');
    monthOptions.push({ value, label });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600 mt-2">Track employee attendance and working hours</p>
        </div>

        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={downloadCSV}
            disabled={isDownloading || filteredRecords.length === 0}
            className="hover:bg-green-50 hover:border-green-300"
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Descargando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Descargar CSV ({filteredRecords.length})
              </>
            )}
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Attendance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Attendance Record</DialogTitle>
                <DialogDescription>
                  Record employee attendance for a specific date
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitAttendance} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Employee</Label>
                  <Select value={formData.employeeId} onValueChange={(value) => setFormData({...formData, employeeId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.first_name} {emp.last_name} - {emp.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                      <SelectItem value="half_day">Half Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.status !== 'absent' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="checkIn">Check In</Label>
                        <Input 
                          id="checkIn" 
                          type="time" 
                          value={formData.checkIn}
                          onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="checkOut">Check Out</Label>
                        <Input 
                          id="checkOut" 
                          type="time" 
                          value={formData.checkOut}
                          onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                        />
                      </div>
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Additional notes (optional)"
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Record'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{presentToday}</div>
                <p className="text-sm text-gray-600">Present Today</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{absentToday}</div>
                <p className="text-sm text-gray-600">Absent Today</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{lateToday}</div>
                <p className="text-sm text-gray-600">Late Arrivals</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{attendanceRate}%</div>
                <p className="text-sm text-gray-600">Attendance Rate</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="records" className="space-y-6">
        <TabsList>
          <TabsTrigger value="records">Attendance Records</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>
                Detailed attendance history for all employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Employee</Label>
                    <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="All employees" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Employees</SelectItem>
                        {employees.map(emp => (
                          <SelectItem key={emp.id} value={emp.id.toString()}>
                            {emp.first_name} {emp.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Month</Label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {monthOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSelectedEmployee('all');
                        setSelectedMonth(format(new Date(), 'yyyy-MM'));
                      }}
                      className="text-sm"
                    >
                      Clear Filters
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={downloadCSV}
                      disabled={isDownloading || filteredRecords.length === 0}
                      className="text-sm hover:bg-green-50 hover:border-green-300"
                    >
                      {isDownloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Results Summary */}
              {filteredRecords.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-800 font-medium">
                      Mostrando {filteredRecords.length} registros
                      {selectedEmployee !== 'all' && (
                        <span> para {employees.find(emp => emp.id.toString() === selectedEmployee)?.first_name} {employees.find(emp => emp.id.toString() === selectedEmployee)?.last_name}</span>
                      )}
                      {selectedMonth && (
                        <span> en {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}</span>
                      )}
                    </span>
                    <span className="text-blue-600 font-medium">
                      Total horas: {filteredRecords.reduce((sum, record) => sum + (record.total_hours || 0), 0).toFixed(2)}h
                    </span>
                  </div>
                </div>
              )}

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {record.first_name} {record.last_name}
                          </TableCell>
                          <TableCell>{record.department}</TableCell>
                          <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{record.check_in || '-'}</TableCell>
                          <TableCell>
                            {record.check_out || (
                              <span className="text-amber-600 font-medium">In Progress</span>
                            )}
                          </TableCell>
                          <TableCell>{record.total_hours ? `${record.total_hours.toFixed(2)}h` : '-'}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                record.status === 'present' ? 'default' :
                                record.status === 'late' ? 'destructive' : 'secondary'
                              }
                            >
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRecord(record)}
                              className="hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          No attendance records found for the selected filters
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
                <CardDescription>
                  Choose a date to view attendance details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  Attendance for {selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : 'Select a date'}
                </CardTitle>
                <CardDescription>
                  Detailed attendance breakdown for the selected date
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {attendanceRecords.filter(r => r.date === format(selectedDate, 'yyyy-MM-dd') && r.status === 'present').length}
                        </div>
                        <p className="text-sm text-green-700">Present</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {attendanceRecords.filter(r => r.date === format(selectedDate, 'yyyy-MM-dd') && r.status === 'absent').length}
                        </div>
                        <p className="text-sm text-red-700">Absent</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {attendanceRecords.filter(r => r.date === format(selectedDate, 'yyyy-MM-dd') && r.status === 'late').length}
                        </div>
                        <p className="text-sm text-orange-700">Late</p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">Department Breakdown</h4>
                      <div className="space-y-2">
                        {Array.from(new Set(attendanceRecords.filter(r => r.date === format(selectedDate, 'yyyy-MM-dd')).map(r => r.department))).map(dept => {
                          const deptRecords = attendanceRecords.filter(r => r.date === format(selectedDate, 'yyyy-MM-dd') && r.department === dept);
                          const presentCount = deptRecords.filter(r => r.status === 'present').length;
                          const totalInDept = employees.filter(e => e.department === dept).length;
                          
                          return (
                            <div key={dept} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span>{dept}</span>
                              <Badge>{presentCount}/{totalInDept} Present</Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Please select a date to view attendance details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Attendance Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Attendance Record</DialogTitle>
            <DialogDescription>
              Modify the attendance details for {editingRecord?.first_name} {editingRecord?.last_name} on {editingRecord?.date ? format(new Date(editingRecord.date), 'MMM dd, yyyy') : ''}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateRecord} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editStatus">Status</Label>
              <Select value={editFormData.status} onValueChange={(value) => setEditFormData({...editFormData, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="half_day">Half Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {editFormData.status !== 'absent' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editCheckIn">Check In</Label>
                  <Input 
                    id="editCheckIn" 
                    type="time" 
                    value={editFormData.checkIn}
                    onChange={(e) => setEditFormData({...editFormData, checkIn: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editCheckOut">Check Out</Label>
                  <Input 
                    id="editCheckOut" 
                    type="time" 
                    value={editFormData.checkOut}
                    onChange={(e) => setEditFormData({...editFormData, checkOut: e.target.value})}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="editNotes">Notes</Label>
              <Textarea 
                id="editNotes" 
                placeholder="Additional notes (optional)"
                rows={2}
                value={editFormData.notes}
                onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Record
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}