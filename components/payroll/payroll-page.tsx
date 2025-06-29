'use client';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Users, 
  Calculator, 
  FileText, 
  Download,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const payrollData = [
  {
    id: 1,
    employee: 'Sarah Wilson',
    department: 'Engineering',
    baseSalary: 95000,
    bonus: 5000,
    deductions: 12000,
    netPay: 88000,
    status: 'Processed',
    payDate: '2024-01-31'
  },
  {
    id: 2,
    employee: 'John Doe',
    department: 'Marketing',
    baseSalary: 75000,
    bonus: 2500,
    deductions: 9500,
    netPay: 68000,
    status: 'Processed',
    payDate: '2024-01-31'
  },
  {
    id: 3,
    employee: 'Emily Chen',
    department: 'Design',
    baseSalary: 80000,
    bonus: 3000,
    deductions: 10500,
    netPay: 72500,
    status: 'Pending',
    payDate: '2024-01-31'
  },
];

const monthlyPayrollData = [
  { month: 'Jan', amount: 425680 },
  { month: 'Feb', amount: 432150 },
  { month: 'Mar', amount: 438920 },
  { month: 'Apr', amount: 445200 },
  { month: 'May', amount: 451800 },
  { month: 'Jun', amount: 459200 },
];

const departmentCosts = [
  { department: 'Engineering', cost: 180000 },
  { department: 'Marketing', cost: 95000 },
  { department: 'Sales', cost: 87000 },
  { department: 'Design', cost: 72000 },
  { department: 'HR', cost: 45000 },
];

export default function PayrollPage() {
  const totalPayroll = payrollData.reduce((sum, employee) => sum + employee.netPay, 0);
  const processedCount = payrollData.filter(emp => emp.status === 'Processed').length;
  const pendingCount = payrollData.filter(emp => emp.status === 'Pending').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600 mt-2">Manage employee compensation and payroll processing</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generate Reports
          </Button>
          <Button>
            <Calculator className="h-4 w-4 mr-2" />
            Process Payroll
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  ${totalPayroll.toLocaleString()}
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
                  ${(totalPayroll * 12).toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Annual Projection</p>
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
              <CardTitle>January 2024 Payroll</CardTitle>
              <CardDescription>
                Current month payroll processing status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Processing Progress</span>
                  <span className="text-sm text-gray-500">{processedCount}/{payrollData.length} Complete</span>
                </div>
                <Progress value={(processedCount / payrollData.length) * 100} className="h-2" />
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Base Salary</TableHead>
                      <TableHead>Bonus</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Pay</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollData.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.employee}</TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>${employee.baseSalary.toLocaleString()}</TableCell>
                        <TableCell>${employee.bonus.toLocaleString()}</TableCell>
                        <TableCell>${employee.deductions.toLocaleString()}</TableCell>
                        <TableCell className="font-medium">
                          ${employee.netPay.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={employee.status === 'Processed' ? 'default' : 'secondary'}
                          >
                            {employee.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
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
                  <BarChart data={departmentCosts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Cost']} />
                    <Bar dataKey="cost" fill="#10b981" />
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
                    ${payrollData.reduce((sum, emp) => sum + emp.baseSalary, 0).toLocaleString()}
                  </div>
                  <p className="text-green-700 font-medium">Base Salaries</p>
                  <p className="text-sm text-green-600 mt-1">Monthly total</p>
                </div>
                
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    ${payrollData.reduce((sum, emp) => sum + emp.bonus, 0).toLocaleString()}
                  </div>
                  <p className="text-blue-700 font-medium">Bonuses</p>
                  <p className="text-sm text-blue-600 mt-1">Performance & incentives</p>
                </div>
                
                <div className="text-center p-6 bg-red-50 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">
                    ${payrollData.reduce((sum, emp) => sum + emp.deductions, 0).toLocaleString()}
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
                {payrollData.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{employee.employee}</p>
                      <p className="text-sm text-gray-500">{employee.department}</p>
                      <p className="text-sm text-gray-500">Pay Date: {new Date(employee.payDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">${employee.netPay.toLocaleString()}</p>
                        <Badge variant={employee.status === 'Processed' ? 'default' : 'secondary'}>
                          {employee.status}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}