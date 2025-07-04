'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  Download, 
  FileText, 
  Calendar, 
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  Target
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ReportData {
  keyMetrics: {
    totalEmployees: number;
    avgAttendance: number;
    monthlyPayroll: number;
    goalAchievement: number;
  };
  attendanceData: Array<{ month: string; present: number; absent: number; late: number }>;
  monthBreakdown: { present: number; late: number; absent: number };
  payrollTrends: Array<{ month: string; amount: number; employees: number }>;
  payrollBreakdown: { base: number; bonus: number; deductions: number; net: number };
  departmentMetrics: Array<{ name: string; employees: number; productivity: number; satisfaction: number }>;
  leaveAnalysis: Array<{ type: string; count: number; color: string }>;
  leaveStats: { totalLeaveDays: number; averagePerEmployee: number; pending: number; approvalRate: number };
  performanceData: Array<{ quarter: string; goals: number; achieved: number }>;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [employees, setEmployees] = useState<Array<{ id: number; name: string; department: string }>>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const result = await apiClient.getEmployees();
        setEmployees(
          (result || []).map((e: any) => ({
            id: e.id,
            name: `${e.first_name} ${e.last_name}`,
            department: e.department,
          }))
        );
      } catch (e) {
        console.error('Failed to load employees', e);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams();
        if (year) params.append('year', year);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (employeeId) params.append('employeeId', employeeId);
        if (department) params.append('department', department);
        const result = await apiClient.getReports(params.toString());
        setData(result);
      } catch (e: any) {
        console.error('Failed to load reports:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [year, startDate, endDate, employeeId, department]);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">Failed to load reports.</div>
    );
  }

  const { keyMetrics, attendanceData, monthBreakdown, payrollTrends, payrollBreakdown, departmentMetrics, leaveAnalysis, leaveStats, performanceData } = data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive insights and data analysis</p>
        </div>
        
        <div className="flex space-x-2 flex-wrap justify-end">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {[2022, 2023, 2024, 2025, 2026].map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-36" />
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-36" />
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {Array.from(new Set(employees.map(e => e.department))).map(dep => (
                <SelectItem key={dep} value={dep}>{dep}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={employeeId} onValueChange={setEmployeeId}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Employee" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {employees.map(emp => (
                <SelectItem key={emp.id} value={String(emp.id)}>{emp.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{keyMetrics.totalEmployees}</div>
                <p className="text-sm text-gray-600">Total Employees</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{keyMetrics.avgAttendance}%</div>
                <p className="text-sm text-gray-600">Avg Attendance</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">${keyMetrics.monthlyPayroll.toLocaleString()}</div>
                <p className="text-sm text-gray-600">Monthly Payroll</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{keyMetrics.goalAchievement}%</div>
                <p className="text-sm text-gray-600">Goal Achievement</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="attendance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="leaves">Leaves</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Attendance Trends</CardTitle>
                <CardDescription>
                  Employee attendance patterns over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="present" stackId="1" stroke="#10b981" fill="#10b981" />
                    <Area type="monotone" dataKey="late" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                    <Area type="monotone" dataKey="absent" stackId="1" stroke="#ef4444" fill="#ef4444" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attendance Summary</CardTitle>
                <CardDescription>
                  Current month attendance breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">Present Days</p>
                      <p className="text-2xl font-bold text-green-600">{monthBreakdown.present}</p>
                    </div>
                    <div className="text-green-600">
                      <Calendar className="h-8 w-8" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-orange-800">Late Arrivals</p>
                      <p className="text-2xl font-bold text-orange-600">{monthBreakdown.late}</p>
                    </div>
                    <div className="text-orange-600">
                      <Clock className="h-8 w-8" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-red-800">Absent Days</p>
                      <p className="text-2xl font-bold text-red-600">{monthBreakdown.absent}</p>
                    </div>
                    <div className="text-red-600">
                      <Users className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Growth Trend</CardTitle>
                <CardDescription>
                  Monthly payroll expenses and employee count
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={payrollTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(value, name) => [
                      name === 'amount' ? `$${value.toLocaleString()}` : value,
                      name === 'amount' ? 'Payroll' : 'Employees'
                    ]} />
                    <Bar yAxisId="left" dataKey="amount" fill="#3b82f6" />
                    <Line yAxisId="right" type="monotone" dataKey="employees" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payroll Breakdown</CardTitle>
                <CardDescription>
                  Current month payroll analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600">Base Salaries</p>
                      <p className="text-xl font-bold text-blue-800">${payrollBreakdown.base.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600">Bonuses</p>
                      <p className="text-xl font-bold text-green-800">${payrollBreakdown.bonus.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm text-orange-600">Deductions</p>
                      <p className="text-xl font-bold text-orange-800">${payrollBreakdown.deductions.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-600">Net</p>
                      <p className="text-xl font-bold text-red-800">${payrollBreakdown.net.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-600">Net Payroll</p>
                    <p className="text-2xl font-bold text-purple-800">${payrollBreakdown.net.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance Metrics</CardTitle>
              <CardDescription>
                Productivity and satisfaction scores by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={departmentMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="productivity" fill="#3b82f6" name="Productivity %" />
                  <Bar dataKey="satisfaction" fill="#10b981" name="Satisfaction %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Leave Distribution</CardTitle>
                <CardDescription>
                  Breakdown of leave types taken this year
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={leaveAnalysis}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {leaveAnalysis.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {leaveAnalysis.map((leave) => (
                    <div key={leave.type} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: leave.color }} 
                      />
                      <span className="text-sm text-gray-600">{leave.type}</span>
                      <span className="text-sm font-medium">{leave.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leave Statistics</CardTitle>
                <CardDescription>
                  Key leave management metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Total Leave Days</span>
                    <Badge variant="outline">{leaveStats.totalLeaveDays} days</Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Average per Employee</span>
                    <Badge variant="outline">{leaveStats.averagePerEmployee} days</Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Pending Requests</span>
                    <Badge variant="secondary">{leaveStats.pending}</Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Approval Rate</span>
                    <Badge variant="default">{leaveStats.approvalRate}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance vs Goals</CardTitle>
              <CardDescription>
                Quarterly performance tracking and goal achievement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="goals" fill="#e5e7eb" name="Goals Set" />
                  <Bar dataKey="achieved" fill="#3b82f6" name="Goals Achieved" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
