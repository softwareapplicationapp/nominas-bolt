'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Clock, 
  Calendar, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/language-context';

interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  pendingLeaves: number;
  monthlyPayroll: number;
  attendanceTrends: Array<{
    date: string;
    present: number;
    absent: number;
    late: number;
  }>;
  departmentStats: Array<{
    department: string;
    count: number;
  }>;
}

const departmentColors = ['#475569', '#22c55e', '#f59e0b', '#dc2626', '#8b5cf6'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getDashboardStats();
      setStats(data);
    } catch (error: any) {
      toast.error('Failed to load dashboard stats: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load dashboard data</p>
        <button onClick={loadDashboardStats} className="mt-2 text-slate-600 hover:underline">
          Try again
        </button>
      </div>
    );
  }

  const attendanceRate = stats.totalEmployees > 0 ? Math.round((stats.presentToday / stats.totalEmployees) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('welcomeBack')}, Admin!
        </h1>
        <p className="text-gray-600">
          Here's what's happening at your company today.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalEmployees')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {t('active')} workforce
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('presentToday')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.presentToday}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{attendanceRate}%</span> {t('attendanceRate')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pendingLeaves')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingLeaves}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingLeaves > 5 ? (
                <span className="text-orange-600">Needs attention</span>
              ) : (
                <span className="text-green-600">Under control</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('monthlyPayroll')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlyPayroll.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-slate-600">Current month</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly {t('attendance')}</CardTitle>
            <CardDescription>
              Employee attendance overview for this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.attendanceTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.attendanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="present" fill="#475569" name={t('present')} />
                  <Bar dataKey="absent" fill="#dc2626" name={t('absent')} />
                  <Bar dataKey="late" fill="#f59e0b" name={t('late')} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No attendance data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t('department')} Distribution</CardTitle>
            <CardDescription>
              Employee distribution across departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.departmentStats.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.departmentStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {stats.departmentStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={departmentColors[index % departmentColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {stats.departmentStats.map((dept, index) => (
                    <div key={dept.department} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: departmentColors[index % departmentColors.length] }} 
                      />
                      <span className="text-sm text-gray-600">{dept.department}</span>
                      <span className="text-sm font-medium">{dept.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No department data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('recentActivities')}</CardTitle>
            <CardDescription>
              Latest updates and activities in your company
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">System updated</p>
                  <p className="text-sm text-gray-500">Dashboard data refreshed successfully</p>
                  <p className="text-xs text-gray-400">Just now</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-slate-100 p-2 rounded-full">
                  <Activity className="h-4 w-4 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t('attendance')} tracked</p>
                  <p className="text-sm text-gray-500">{stats.presentToday} employees checked in today</p>
                  <p className="text-xs text-gray-400">{t('today')}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-orange-100 p-2 rounded-full">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Leave requests {t('pending')}</p>
                  <p className="text-sm text-gray-500">{stats.pendingLeaves} requests awaiting approval</p>
                  <p className="text-xs text-gray-400">Ongoing</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('quickActions')}</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Pending Approvals</span>
                <Badge variant="secondary">{stats.pendingLeaves}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">{t('presentToday')}</span>
                <Badge variant="default">{stats.presentToday}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">{t('totalEmployees')}</span>
                <Badge variant="outline">{stats.totalEmployees}</Badge>
              </div>
            </div>
            
            <div className="pt-4">
              <h4 className="text-sm font-medium mb-2">{t('systemHealth')}</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Server {t('status')}</span>
                    <span className="text-green-600">{t('online')}</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Data Sync</span>
                    <span className="text-green-600">99%</span>
                  </div>
                  <Progress value={99} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}