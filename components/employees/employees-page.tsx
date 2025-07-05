'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Mail, Phone, MapPin, Edit, Trash2, Loader2, Key, Info } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { useLanguage } from '@/contexts/language-context';

interface Employee {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  status: string;
  start_date: string;
  location?: string;
  salary?: number;
  weekly_hours?: number;
  working_days?: string[];
  role?: string;
  user_id?: number;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [newEmployeePassword, setNewEmployeePassword] = useState('');
  const { t } = useLanguage();

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    startDate: '',
    salary: '',
    location: '',
    weeklyHours: '',
    workingDays: ['Monday','Tuesday','Wednesday','Thursday','Friday'],
    password: ''
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      console.log('=== Loading employees from frontend ===');
      setLoading(true);
      const data = await apiClient.getEmployees();
      console.log('Received employees data:', data);
      console.log('Number of employees:', data.length);
      if (data.length > 0) {
        console.log('First employee:', data[0]);
      }
      setEmployees(data);
    } catch (error: any) {
      console.error('Failed to load employees:', error);
      toast.error('Failed to load employees: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      startDate: '',
      salary: '',
      location: '',
      weeklyHours: '',
      workingDays: ['Monday','Tuesday','Wednesday','Thursday','Friday'],
      password: ''
    });
    setEditingEmployee(null);
    setNewEmployeePassword('');
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const employeeData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        position: formData.position,
        startDate: formData.startDate,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        location: formData.location,
        weeklyHours: formData.weeklyHours ? parseFloat(formData.weeklyHours) : undefined,
        workingDays: formData.workingDays,
        password: formData.password || 'employee123' // Default password if not provided
      };

      if (editingEmployee) {
        // Update existing employee
        await apiClient.updateEmployee(editingEmployee.id, employeeData);
        toast.success(t('updateSuccess'));
      } else {
        // Create new employee
        const response = await apiClient.createEmployee(employeeData);
        setNewEmployeePassword(response.temporaryPassword);
        toast.success(t('createSuccess'));
      }

      setIsDialogOpen(false);
      resetForm();
      loadEmployees();
    } catch (error: any) {
      toast.error('Failed to save employee: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      firstName: employee.first_name,
      lastName: employee.last_name,
      email: employee.email,
      phone: employee.phone || '',
      department: employee.department,
      position: employee.position,
      startDate: employee.start_date,
      salary: employee.salary?.toString() || '',
      location: employee.location || '',
      weeklyHours: employee.weekly_hours?.toString() || '',
      workingDays: employee.working_days || ['Monday','Tuesday','Wednesday','Thursday','Friday'],
      password: ''
    });
    setIsDialogOpen(true);
  };

  const handleDeleteEmployee = async (employeeId: number) => {
    if (!confirm(t('deleteConfirm'))) {
      return;
    }

    try {
      await apiClient.deleteEmployee(employeeId);
      toast.success(t('deleteSuccess'));
      loadEmployees();
    } catch (error: any) {
      toast.error('Failed to delete employee: ' + error.message);
    }
  };

  const departments = [...new Set(employees.map(emp => emp.department))];
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t('loading')} {t('employees')}...</span>
      </div>
    );
  }

  console.log('Rendering employees page with:', employees.length, 'employees');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('employees')}</h1>
          <p className="text-gray-600 mt-2">Manage your company's workforce</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('addEmployee')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? t('editEmployee') : t('addEmployee')}
              </DialogTitle>
              <DialogDescription>
                {editingEmployee ? 'Update employee information' : 'Create a new employee profile with login credentials.'}
              </DialogDescription>
            </DialogHeader>

            {!editingEmployee && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Login Credentials</AlertTitle>
                <AlertDescription>
                  A user account will be created automatically for this employee. 
                  {!formData.password && ' Default password will be "employee123".'}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleAddEmployee} className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('firstName')}</Label>
                <Input 
                  id="firstName" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  placeholder="Sarah" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('lastName')}</Label>
                <Input 
                  id="lastName" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  placeholder="Wilson" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="sarah@company.com" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('phone')}</Label>
                <Input 
                  id="phone" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+1 (555) 123-4567" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">{t('department')}</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectOption')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">{t('position')}</Label>
                <Input 
                  id="position" 
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  placeholder="Senior Developer" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">{t('startDate')}</Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">{t('salary')}</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                  placeholder="75000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weeklyHours">{t('weeklyHours')}</Label>
                <Input
                  id="weeklyHours"
                  type="number"
                  value={formData.weeklyHours}
                  onChange={(e) => setFormData({...formData, weeklyHours: e.target.value})}
                  placeholder="40"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>{t('workingDays')}</Label>
                <div className="flex flex-wrap gap-2">
                  {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => (
                    <Badge
                      key={day}
                      variant={formData.workingDays.includes(day) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        const newDays = formData.workingDays.includes(day)
                          ? formData.workingDays.filter(d => d !== day)
                          : [...formData.workingDays, day];
                        setFormData({...formData, workingDays: newDays});
                      }}
                    >
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="location">{t('location')}</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="New York, NY" 
                />
              </div>
              {!editingEmployee && (
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="password">
                    <Key className="h-4 w-4 inline mr-2" />
                    Initial {t('password')} ({t('optional')})
                  </Label>
                  <Input 
                    id="password" 
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Leave empty for default password: employee123" 
                  />
                </div>
              )}
              <div className="col-span-2 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingEmployee ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingEmployee ? t('update') + ' ' + t('employees') : t('create') + ' ' + t('employees')
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Show password notification after creating employee */}
      {newEmployeePassword && (
        <Alert className="border-green-200 bg-green-50">
          <Key className="h-4 w-4" />
          <AlertTitle>{t('createSuccess')}!</AlertTitle>
          <AlertDescription>
            <strong>Login credentials:</strong><br />
            {t('email')}: {formData.email}<br />
            {t('password')}: <code className="bg-green-100 px-2 py-1 rounded">{newEmployeePassword}</code><br />
            <em>Please share these credentials with the employee securely.</em>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-sm text-gray-600">{t('totalEmployees')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-sm text-gray-600">Departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{employees.filter(emp => {
              const startDate = new Date(emp.start_date);
              const currentMonth = new Date();
              return startDate.getMonth() === currentMonth.getMonth() && 
                     startDate.getFullYear() === currentMonth.getFullYear();
            }).length}</div>
            <p className="text-sm text-gray-600">New {t('thisMonth')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {employees.length > 0 ? Math.round((activeEmployees / employees.length) * 100) : 0}%
            </div>
            <p className="text-sm text-gray-600">{t('active')} Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>{t('employeeDirectory')}</CardTitle>
          <CardDescription>
            {t('browseEmployees')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('search') + ' ' + t('employees') + '...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t('filter') + ' by ' + t('department')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {employees.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No {t('employees')} found</p>
              <p className="text-gray-400 text-sm mt-2">Add your first employee to get started</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>{t('department')}</TableHead>
                    <TableHead>{t('position')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>Login Access</TableHead>
                    <TableHead>{t('startDate')}</TableHead>
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {employee.first_name[0]}{employee.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                            <div className="flex items-center text-sm text-gray-500 space-x-4">
                              <span className="flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {employee.email}
                              </span>
                              {employee.phone && (
                                <span className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {employee.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={employee.status === 'active' ? 'default' : 'secondary'}
                        >
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={employee.user_id ? 'default' : 'destructive'}
                        >
                          {employee.user_id ? 'Enabled' : 'No Access'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(employee.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditEmployee(employee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteEmployee(employee.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}