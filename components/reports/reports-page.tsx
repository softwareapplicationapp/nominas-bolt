'use client';

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

const attendanceData = [
  { month: 'Jan', present: 85, absent: 15, late: 8 },
  { month: 'Feb', present: 88, absent: 12, late: 6 },
  { month: 'Mar', present: 92, absent: 8, late: 4 },
  { month: 'Apr', present: 87, absent: 13, late: 7 },
  { month: 'May', present: 90, absent: 10, late: 5 },
  { month: 'Jun', present: 89, absent: 11, late: 6 },
];

const payrollTrends = [
  { month: 'Jan', amount: 425680, employees: 124 },
  { month: 'Feb', amount: 432150, employees: 126 },
  { month: 'Mar', amount: 438920, employees: 128 },
  { month: 'Apr', amount: 445200, employees: 130 },
  { month: 'May', amount: 451800, employees: 132 },
  { month: 'Jun', amount: 459200, employees: 134 },
];

const departmentMetrics = [
  { name: 'Engineering', employees: 45, productivity: 92, satisfaction: 88 },
  { name: 'Marketing', employees: 20, productivity: 85, satisfaction: 90 },
  { name: 'Sales', employees: 30, productivity: 78, satisfaction: 82 },
  { name: 'Design', employees: 15, productivity: 95, satisfaction: 94 },
  { name: 'HR', employees: 8, productivity: 88, satisfaction: 86 },
];

const leaveAnalysis = [
  { type: 'Vacation', count: 45, color: '#3b82f6' },
  { type: 'Sick Leave', count: 28, color: '#ef4444' },
  { type: 'Personal', count: 15, color: '#10b981' },
  { type: 'Emergency', count: 8, color: '#f59e0b' },
];

const performanceData = [
  { quarter: 'Q1', goals: 85, achieved: 78 },
  { quarter: 'Q2', goals: 90, achieved: 86 },
  { quarter: 'Q3', goals: 88, achieved: 84 },
  { quarter: 'Q4', goals: 92, achieved: 89 },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive insights and data analysis</p>
        </div>
        
        <div className="flex space-x-2">
          <Select defaultValue="2024">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
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
                <div className="text-2xl font-bold text-blue-600">134</div>
                <p className="text-sm text-gray-600">Total Employees</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.1%
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">89%</div>
                <p className="text-sm text-gray-600">Avg Attendance</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.3%
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">$459K</div>
                <p className="text-sm text-gray-600">Monthly Payroll</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +6.2%
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">87%</div>
                <p className="text-sm text-gray-600">Goal Achievement</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +4.5%
              </Badge>
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
                      <p className="text-2xl font-bold text-green-600">89%</p>
                    </div>
                    <div className="text-green-600">
                      <Calendar className="h-8 w-8" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-orange-800">Late Arrivals</p>
                      <p className="text-2xl font-bold text-orange-600">6%</p>
                    </div>
                    <div className="text-orange-600">
                      <Clock className="h-8 w-8" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-red-800">Absent Days</p>
                      <p className="text-2xl font-bold text-red-600">5%</p>
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
                      <p className="text-xl font-bold text-blue-800">$380K</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600">Bonuses</p>
                      <p className="text-xl font-bold text-green-800">$45K</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm text-orange-600">Benefits</p>
                      <p className="text-xl font-bold text-orange-800">$28K</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-600">Deductions</p>
                      <p className="text-xl font-bold text-red-800">$34K</p>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-600">Net Payroll</p>
                    <p className="text-2xl font-bold text-purple-800">$459K</p>
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
                    <Badge variant="outline">96 days</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Average per Employee</span>
                    <Badge variant="outline">8.2 days</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Pending Requests</span>
                    <Badge variant="secondary">12</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Approval Rate</span>
                    <Badge variant="default">94%</Badge>
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