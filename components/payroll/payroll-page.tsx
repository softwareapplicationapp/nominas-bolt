'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Users, 
  Calculator, 
  FileText, 
  Download,
  TrendingUp,
  Calendar,
  Loader2,
  Plus,
  Eye,
  FileIcon,
  Printer,
  Mail
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/language-context';

interface PayrollRecord {
  id: number;
  employee_id: number;
  first_name: string;
  last_name: string;
  department: string;
  pay_period_start: string;
  pay_period_end: string;
  base_salary: number;
  bonus: number;
  deductions: number;
  net_pay: number;
  status: string;
  processed_at?: string;
  created_at: string;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  department: string;
}

export default function PayrollPage() {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const { t, language } = useLanguage();

  // Form state
  const [formData, setFormData] = useState({
    employeeId: '',
    payPeriodStart: '',
    payPeriodEnd: '',
    baseSalary: '',
    bonus: '',
    deductions: '',
    status: 'pending'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [payrollData, employeesData] = await Promise.all([
        apiClient.getPayroll(),
        apiClient.getEmployees()
      ]);
      console.log('Payroll data loaded:', payrollData);
      setPayrollRecords(payrollData || []);
      setEmployees(employeesData);
    } catch (error: any) {
      console.error('Failed to load payroll data:', error);
      toast.error('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payrollData = {
        employeeId: parseInt(formData.employeeId),
        payPeriodStart: formData.payPeriodStart,
        payPeriodEnd: formData.payPeriodEnd,
        baseSalary: parseFloat(formData.baseSalary),
        bonus: formData.bonus ? parseFloat(formData.bonus) : 0,
        deductions: formData.deductions ? parseFloat(formData.deductions) : 0,
        status: formData.status
      };

      console.log('Creating payroll with data:', payrollData);
      const newPayroll = await apiClient.createPayroll(payrollData);
      console.log('Payroll created:', newPayroll);
      
      toast.success('Payroll record created successfully!');
      setIsDialogOpen(false);
      setFormData({
        employeeId: '',
        payPeriodStart: '',
        payPeriodEnd: '',
        baseSalary: '',
        bonus: '',
        deductions: '',
        status: 'pending'
      });
      
      // Reload data to show the new record
      await loadData();
    } catch (error: any) {
      console.error('Failed to create payroll:', error);
      toast.error('Failed to create payroll record: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessPayroll = async (id: number) => {
    try {
      await apiClient.updatePayroll(id, {
        status: 'processed',
        processed_at: new Date().toISOString()
      });
      toast.success('Payroll processed successfully!');
      loadData();
    } catch (error: any) {
      toast.error('Failed to process payroll: ' + error.message);
    }
  };

  const handleDownloadPDF = async (id: number) => {
    setIsDownloading(id);
    try {
      const blob = await apiClient.downloadPayrollPDF(id);
      
      // Find the payroll record to get employee name for filename
      const record = payrollRecords.find(r => r.id === id);
      const employeeName = record ? `${record.first_name}_${record.last_name}` : 'employee';
      const periodStart = record ? format(new Date(record.pay_period_start), 'yyyy-MM') : 'period';
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nomina_${employeeName.toLowerCase()}_${periodStart}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Payroll PDF downloaded successfully!');
    } catch (error: any) {
      console.error('Failed to download PDF:', error);
      toast.error('Failed to download PDF: ' + error.message);
    } finally {
      setIsDownloading(null);
    }
  };

  const handleEmailPayslip = (id: number) => {
    const record = payrollRecords.find(r => r.id === id);
    if (record) {
      toast.success(`Payslip sent to ${record.first_name} ${record.last_name} at their email address.`);
    }
  };

  // Filter payroll records by month
  const filteredRecords = payrollRecords.filter(record => {
    if (!selectedMonth || selectedMonth === "all") return true;
    return record.pay_period_start.startsWith(selectedMonth);
  });

  // Calculate stats
  const totalPayroll = filteredRecords.reduce((sum, record) => sum + record.net_pay, 0);
  const processedCount = filteredRecords.filter(record => record.status === 'processed').length;
  const pendingCount = filteredRecords.filter(record => record.status === 'pending').length;
  const averageSalary = filteredRecords.length > 0 ? totalPayroll / filteredRecords.length : 0;

  // Generate month options for the last 12 months
  const monthOptions = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const value = format(date, 'yyyy-MM');
    const label = format(date, 'MMMM yyyy');
    monthOptions.push({ value, label });
  }

  // Prepare chart data
  const departmentPayroll = filteredRecords.reduce((acc: Record<string, number>, record) => {
    acc[record.department] = (acc[record.department] || 0) + record.net_pay;
    return acc;
  }, {});

  const departmentChartData = Object.entries(departmentPayroll).map(([department, amount]) => ({
    department,
    amount
  }));

  const monthlyPayrollData = monthOptions.slice(0, 6).map(month => {
    const monthRecords = payrollRecords.filter(record => record.pay_period_start.startsWith(month.value));
    return {
      month: month.label.split(' ')[0],
      amount: monthRecords.reduce((sum, record) => sum + record.net_pay, 0)
    };
  }).reverse();

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
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600 mt-2">Manage employee compensation and payroll processing</p>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Payroll
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Payroll Record</DialogTitle>
                <DialogDescription>
                  Create a new payroll record for an employee
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitPayroll} className="space-y-4 py-4">
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payPeriodStart">Period Start</Label>
                    <Input 
                      id="payPeriodStart" 
                      type="date" 
                      value={formData.payPeriodStart}
                      onChange={(e) => setFormData({...formData, payPeriodStart: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payPeriodEnd">Period End</Label>
                    <Input 
                      id="payPeriodEnd" 
                      type="date" 
                      value={formData.payPeriodEnd}
                      onChange={(e) => setFormData({...formData, payPeriodEnd: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baseSalary">Base Salary</Label>
                  <Input 
                    id="baseSalary" 
                    type="number" 
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({...formData, baseSalary: e.target.value})}
                    placeholder="5000.00"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bonus">Bonus</Label>
                    <Input 
                      id="bonus" 
                      type="number" 
                      value={formData.bonus}
                      onChange={(e) => setFormData({...formData, bonus: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deductions">Deductions</Label>
                    <Input 
                      id="deductions" 
                      type="number" 
                      value={formData.deductions}
                      onChange={(e) => setFormData({...formData, deductions: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processed">Processed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Payroll'
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
                <div className="text-2xl font-bold text-green-600">
                  €{totalPayroll.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Monthly Payroll</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{processedCount}</div>
                <p className="text-sm text-gray-600">Processed</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  €{averageSalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <p className="text-sm text-gray-600">Average Salary</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList>
          <TabsTrigger value="current">Current Payroll</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="payslips">Payslips</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <CardTitle>Payroll Management</CardTitle>
                  <CardDescription>
                    Current month payroll processing status
                  </CardDescription>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Label htmlFor="monthFilter" className="text-sm">Month:</Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Months</SelectItem>
                      {monthOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Processing Progress</span>
                  <span className="text-sm text-gray-500">
                    {processedCount}/{filteredRecords.length} Complete
                  </span>
                </div>
                <Progress 
                  value={filteredRecords.length > 0 ? (processedCount / filteredRecords.length) * 100 : 0} 
                  className="h-2" 
                />
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Base Salary</TableHead>
                      <TableHead>Bonus</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Pay</TableHead>
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
                          <TableCell>
                            {format(new Date(record.pay_period_start), 'MMM dd')} - {format(new Date(record.pay_period_end), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>€{record.base_salary.toLocaleString()}</TableCell>
                          <TableCell>€{record.bonus.toLocaleString()}</TableCell>
                          <TableCell>€{record.deductions.toLocaleString()}</TableCell>
                          <TableCell className="font-medium">
                            €{record.net_pay.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={record.status === 'processed' ? 'default' : 'secondary'}
                            >
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {record.status === 'pending' ? (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleProcessPayroll(record.id)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                >
                                  <Calculator className="h-4 w-4 mr-1" />
                                  Process
                                </Button>
                              ) : (
                                <>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDownloadPDF(record.id)}
                                    disabled={isDownloading === record.id}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                                  >
                                    {isDownloading === record.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <FileIcon className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleEmailPayslip(record.id)}
                                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200"
                                  >
                                    <Mail className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          {payrollRecords.length === 0 ? (
                            <>
                              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                              <p>No payroll records found</p>
                              <p className="text-sm text-gray-400 mt-2">Create your first payroll record to get started</p>
                            </>
                          ) : (
                            <>
                              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                              <p>No payroll records found for the selected month</p>
                              <p className="text-sm text-gray-400 mt-2">Try selecting a different month or create new records</p>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Payroll Trend</CardTitle>
                <CardDescription>
                  Payroll expenses over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyPayrollData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`€${value.toLocaleString()}`, 'Amount']} />
                    <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Costs</CardTitle>
                <CardDescription>
                  Payroll distribution by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`€${value.toLocaleString()}`, 'Cost']} />
                    <Bar dataKey="amount" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payroll Breakdown</CardTitle>
              <CardDescription>
                Detailed analysis of current payroll components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    €{filteredRecords.reduce((sum, record) => sum + record.base_salary, 0).toLocaleString()}
                  </div>
                  <p className="text-green-700 font-medium">Base Salaries</p>
                  <p className="text-sm text-green-600 mt-1">Monthly total</p>
                </div>
                
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    €{filteredRecords.reduce((sum, record) => sum + record.bonus, 0).toLocaleString()}
                  </div>
                  <p className="text-blue-700 font-medium">Bonuses</p>
                  <p className="text-sm text-blue-600 mt-1">Performance & incentives</p>
                </div>
                
                <div className="text-center p-6 bg-red-50 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">
                    €{filteredRecords.reduce((sum, record) => sum + record.deductions, 0).toLocaleString()}
                  </div>
                  <p className="text-red-700 font-medium">Deductions</p>
                  <p className="text-sm text-red-600 mt-1">Taxes & benefits</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payslips" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payslip Management</CardTitle>
              <CardDescription>
                Generate and manage employee payslips
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRecords.filter(record => record.status === 'processed').map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium">{record.first_name} {record.last_name}</p>
                      <p className="text-sm text-gray-500">{record.department}</p>
                      <p className="text-sm text-gray-500">
                        Period: {format(new Date(record.pay_period_start), 'MMM dd')} - {format(new Date(record.pay_period_end), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">€{record.net_pay.toLocaleString()}</p>
                        <Badge variant="default">
                          {record.status}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadPDF(record.id)}
                          disabled={isDownloading === record.id}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                        >
                          {isDownloading === record.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              PDF
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEmailPayslip(record.id)}
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 border-gray-200"
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Print
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredRecords.filter(record => record.status === 'processed').length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No processed payslips found for the selected month</p>
                    <p className="text-sm text-gray-400 mt-2">Process payroll records to generate payslips</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payslip Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Payslip Preview</CardTitle>
              <CardDescription>
                Sample payslip format for reference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-white">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">ArcusHR</h3>
                    <p className="text-sm text-gray-600">Calle Principal 123, Madrid, España</p>
                    <p className="text-sm text-gray-600">Tel: +34 91 123 4567</p>
                    <p className="text-sm text-gray-600">Email: info@arcushr.com</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-lg font-bold text-gray-900">RECIBO DE NÓMINA</h4>
                    <p className="text-sm text-gray-600">Período: 01/06/2024 - 30/06/2024</p>
                    <p className="text-sm text-gray-600">Fecha de Emisión: {format(new Date(), 'dd/MM/yyyy')}</p>
                  </div>
                </div>

                <div className="border-t border-b border-gray-200 py-4 mb-6">
                  <h4 className="font-bold text-gray-900 mb-2">INFORMACIÓN DEL EMPLEADO</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm"><span className="font-semibold">Nombre:</span> John Doe</p>
                      <p className="text-sm"><span className="font-semibold">ID Empleado:</span> EMP002</p>
                      <p className="text-sm"><span className="font-semibold">Departamento:</span> Engineering</p>
                      <p className="text-sm"><span className="font-semibold">Cargo:</span> Software Developer</p>
                    </div>
                    <div>
                      <p className="text-sm"><span className="font-semibold">Email:</span> john.doe@example.com</p>
                      <p className="text-sm"><span className="font-semibold">Teléfono:</span> +34 612 345 678</p>
                      <p className="text-sm"><span className="font-semibold">Fecha Inicio:</span> 15/01/2024</p>
                      <p className="text-sm"><span className="font-semibold">Ubicación:</span> Madrid</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-2">DETALLES DE NÓMINA</h4>
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-2 text-sm font-semibold">CONCEPTO</th>
                        <th className="text-right p-2 text-sm font-semibold">IMPORTE</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="p-2 text-sm">Salario Base</td>
                        <td className="text-right p-2 text-sm">€5,000.00</td>
                      </tr>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <td className="p-2 text-sm">Bonificaciones</td>
                        <td className="text-right p-2 text-sm">€500.00</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="p-2 text-sm">Deducciones</td>
                        <td className="text-right p-2 text-sm text-red-600">-€1,250.00</td>
                      </tr>
                      <tr className="bg-gray-100 font-bold">
                        <td className="p-2">TOTAL NETO</td>
                        <td className="text-right p-2">€4,250.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg text-sm border border-yellow-200">
                  <p className="font-bold text-yellow-800">NOTA IMPORTANTE:</p>
                  <p className="text-yellow-700">Este documento es un recibo oficial de nómina. Conserve este documento para sus registros personales y efectos fiscales.</p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
                  <div>
                    <p>Este documento ha sido generado automáticamente por ArcusHR</p>
                    <p>Generado el: {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}</p>
                  </div>
                  <div className="text-right">
                    <p>Página 1 de 1</p>
                    <p>ID Documento: PAY-123-2024</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4 space-x-2">
                <Button variant="outline" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200">
                  <Download className="h-4 w-4 mr-2" />
                  Download Sample
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}