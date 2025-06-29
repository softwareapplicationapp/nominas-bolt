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

const departmentColors = ['#1e40af', '#059669', '#d97706', '#dc2626', '#7c3aed'];

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
        <p className="text-gray-700 font-medium">Failed to load dashboard data</p>
        <button onClick={loadDashboardStats} className="mt-2 text-blue-700 hover:underline font-semibold">
          Try again
        </button>
      </div>
    );
  }

  const attendanceRate = stats.totalEmployees > 0 ? Math.round((stats.presentToday / stats.totalEmployees) * 100) : 0;

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {t('welcomeBack')}, Admin!
        </h1>
        <p className="text-gray-800 font-medium text-sm sm:text-base">
          Here's what's happening at your company today.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-blue-200 hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-900">{t('totalEmployees')}</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalEmployees}</div>
            <p className="text-xs text-gray-800 font-medium">
              <span className="text-emerald-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {t('active')} workforce
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-900">{t('presentToday')}</CardTitle>
            <Clock className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.presentToday}</div>
            <p className="text-xs text-gray-800 font-medium">
              <span className="text-emerald-600">{attendanceRate}%</span> {t('attendanceRate')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-900">{t('pendingLeaves')}</CardTitle>
            <Calendar className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.pendingLeaves}</div>
            <p className="text-xs text-gray-800 font-medium">
              {stats.pendingLeaves > 5 ? (
                <span className="text-amber-600">Needs attention</span>
              ) : (
                <span className="text-emerald-600">Under control</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-900">{t('monthlyPayroll')}</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">${stats.monthlyPayroll.toLocaleString()}</div>
            <p className="text-xs text-gray-800 font-medium">
              <span className="text-gray-700">Current month</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Attendance Chart */}
        <Card className="border-gray-200 hover-glow">
          <CardHeader>
            <CardTitle className="text-gray-900 text-lg sm:text-xl">Weekly {t('attendance')}</CardTitle>
            <CardDescription className="text-gray-800 font-medium text-sm">
              Employee attendance overview for this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.attendanceTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                <BarChart data={stats.attendanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="present" fill="#1e40af" name={t('present')} />
                  <Bar dataKey="absent" fill="#dc2626" name={t('absent')} />
                  <Bar dataKey="late" fill="#d97706" name={t('late')} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-700 font-medium">
                No attendance data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card className="border-gray-200 hover-glow">
          <CardHeader>
            <CardTitle className="text-gray-900 text-lg sm:text-xl">{t('department')} Distribution</CardTitle>
            <CardDescription className="text-gray-800 font-medium text-sm">
              Employee distribution across departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.departmentStats.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                  <PieChart>
                    <Pie
                      data={stats.departmentStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                  {stats.departmentStats.map((dept, index) => (
                    <div key={dept.department} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: departmentColors[index % departmentColors.length] }} 
                      />
                      <span className="text-sm text-gray-800 font-medium truncate">{dept.department}</span>
                      <span className="text-sm font-bold text-gray-900">{dept.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-700 font-medium">
                No department data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2 border-gray-200 hover-glow">
          <CardHeader>
            <CardTitle className="text-gray-900 text-lg sm:text-xl">{t('recentActivities')}</CardTitle>
            <CardDescription className="text-gray-800 font-medium text-sm">
              Latest updates and activities in your company
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-emerald-100 p-2 rounded-full">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">System updated</p>
                  <p className="text-sm text-gray-800 font-medium">Dashboard data refreshed successfully</p>
                  <p className="text-xs text-gray-700 font-medium">Just now</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{t('attendance')} tracked</p>
                  <p className="text-sm text-gray-800 font-medium">{stats.presentToday} employees checked in today</p>
                  <p className="text-xs text-gray-700 font-medium">{t('today')}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-amber-100 p-2 rounded-full">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Leave requests {t('pending')}</p>
                  <p className="text-sm text-gray-800 font-medium">{stats.pendingLeaves} requests awaiting approval</p>
                  <p className="text-xs text-gray-700 font-medium">Ongoing</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-gray-200 hover-glow">
          <CardHeader>
            <CardTitle className="text-gray-900 text-lg sm:text-xl">{t('quickActions')}</CardTitle>
            <CardDescription className="text-gray-800 font-medium text-sm">
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                <span className="text-sm font-semibold text-gray-900">Pending Approvals</span>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 font-semibold">{stats.pendingLeaves}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-sm font-semibold text-gray-900">{t('presentToday')}</span>
                <Badge variant="default" className="bg-emerald-600 text-white font-semibold">{stats.presentToday}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm font-semibold text-gray-900">{t('totalEmployees')}</span>
                <Badge variant="outline" className="border-blue-300 text-blue-800 font-semibold">{stats.totalEmployees}</Badge>
              </div>
            </div>
            
            <div className="pt-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">{t('systemHealth')}</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-800 font-medium">Server {t('status')}</span>
                    <span className="text-emerald-600 font-semibold">{t('online')}</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-800 font-medium">Data Sync</span>
                    <span className="text-emerald-600 font-semibold">99%</span>
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