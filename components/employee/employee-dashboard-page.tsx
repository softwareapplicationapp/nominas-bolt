'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Calendar, 
  User, 
  CheckCircle,
  Coffee,
  LogOut as LogOutIcon,
  TrendingUp,
  Award,
  Target,
  Timer,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  CalendarDays,
  ClockIcon,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';

interface EmployeeStats {
  attendanceToday: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  totalHoursToday: number;
  weeklyHours: number;
  monthlyAttendance: number;
  pendingLeaves: number;
  approvedLeaves: number;
  remainingLeaves: number;
}

interface EmployeeProfile {
  first_name: string;
  last_name: string;
  department: string;
  position: string;
  start_date: string;
  location?: string;
}

export default function EmployeeDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadEmployeeData();
  }, []);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      const [statsData, profileData] = await Promise.all([
        apiClient.getMyStats(),
        apiClient.getMyProfile()
      ]);

      setStats(statsData);
      setProfile(profileData);
      setIsCheckedIn(statsData.attendanceToday && statsData.checkInTime && !statsData.checkOutTime);
    } catch (error: any) {
      toast.error('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await apiClient.checkInOut('check_in');
      setIsCheckedIn(true);
      toast.success('Checked in successfully!');
      loadEmployeeData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingIn(true);
    try {
      await apiClient.checkInOut('check_out');
      setIsCheckedIn(false);
      toast.success('Checked out successfully!');
      loadEmployeeData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-slate-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <div className="space-y-8 p-6">
        {/* Welcome Header */}
        <div className="animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl p-8 hover-lift border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {profile ? `${profile.first_name[0]}${profile.last_name[0]}` : user?.email?.[0]?.toUpperCase() || 'E'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-bounce-in"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-1">
                    Welcome back, {profile ? profile.first_name : 'Employee'}!
                  </h1>
                  <p className="text-slate-700 mt-1 font-medium">
                    {format(currentTime, 'EEEE, MMMM do, yyyy')}
                  </p>
                  <p className="text-2xl font-mono text-slate-800 mt-2 font-bold">
                    {format(currentTime, 'HH:mm:ss')}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-4">
                  {!isCheckedIn ? (
                    <Button 
                      onClick={handleCheckIn}
                      disabled={checkingIn}
                      className="btn-success text-lg px-8 py-4 animate-bounce-in"
                    >
                      {checkingIn ? (
                        <>
                          <Timer className="h-5 w-5 mr-2 animate-spin" />
                          Checking In...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Check In
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleCheckOut}
                      disabled={checkingIn}
                      variant="outline"
                      className="text-lg px-8 py-4 hover-glow border-slate-300 text-slate-700 hover:text-slate-900"
                    >
                      {checkingIn ? (
                        <>
                          <Timer className="h-5 w-5 mr-2 animate-spin" />
                          Checking Out...
                        </>
                      ) : (
                        <>
                          <LogOutIcon className="h-5 w-5 mr-2" />
                          Check Out
                        </>
                      )}
                    </Button>
                  )}
                </div>
                {isCheckedIn && stats?.checkInTime && (
                  <p className="text-sm text-slate-600 mt-2 font-medium">
                    Checked in at {stats.checkInTime}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-interactive animate-scale-in stagger-1 hover-glow border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {stats?.totalHoursToday.toFixed(1) || '0.0'}h
                  </div>
                  <p className="text-sm text-slate-700 font-medium">Hours Today</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full animate-float">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={(stats?.totalHoursToday || 0) / 8 * 100} className="progress-animated" />
                <p className="text-xs text-slate-600 mt-1 font-medium">Target: 8 hours</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-interactive animate-scale-in stagger-2 hover-glow border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {stats?.weeklyHours.toFixed(1) || '0.0'}h
                  </div>
                  <p className="text-sm text-slate-700 font-medium">This Week</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full animate-float">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={(stats?.weeklyHours || 0) / 40 * 100} className="progress-animated" />
                <p className="text-xs text-slate-600 mt-1 font-medium">Target: 40 hours</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-interactive animate-scale-in stagger-3 hover-glow border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {stats?.monthlyAttendance || 0}%
                  </div>
                  <p className="text-sm text-slate-700 font-medium">Attendance</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full animate-float">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={stats?.monthlyAttendance || 0} className="progress-animated" />
                <p className="text-xs text-slate-600 mt-1 font-medium">This month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-interactive animate-scale-in stagger-4 hover-glow border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {stats?.remainingLeaves || 0}
                  </div>
                  <p className="text-sm text-slate-700 font-medium">Leave Days</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full animate-float">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={(stats?.remainingLeaves || 0) / 20 * 100} className="progress-animated" />
                <p className="text-xs text-slate-600 mt-1 font-medium">Remaining this year</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <Card className="lg:col-span-1 animate-slide-in-left card-glow border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-slate-900">
                <Target className="h-5 w-5 text-slate-600" />
                <span>Quick Actions</span>
              </CardTitle>
              <CardDescription className="text-slate-700">
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full btn-primary justify-start" size="lg" asChild>
                <a href="/employee/leaves">
                  <Calendar className="h-5 w-5 mr-3" />
                  Request Leave
                </a>
              </Button>
              
              <Button className="w-full btn-success justify-start" size="lg" asChild>
                <a href="/employee/attendance">
                  <ClockIcon className="h-5 w-5 mr-3" />
                  View Timesheet
                </a>
              </Button>
              
              <Button className="w-full btn-warning justify-start" size="lg" asChild>
                <a href="/employee/profile">
                  <User className="h-5 w-5 mr-3" />
                  Update Profile
                </a>
              </Button>
              
              <Button className="w-full btn-danger justify-start" size="lg">
                <Coffee className="h-5 w-5 mr-3" />
                Break Time
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2 animate-slide-in-right card-glow border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-slate-900">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription className="text-slate-700">
                Your latest actions and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.checkInTime && (
                  <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg hover-scale border border-green-200">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-green-800">Checked in successfully</p>
                      <p className="text-sm text-green-700">Today at {stats.checkInTime}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg hover-scale border border-blue-200">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-blue-800">Leave requests status</p>
                    <p className="text-sm text-blue-700">
                      {stats?.pendingLeaves || 0} pending, {stats?.approvedLeaves || 0} approved
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg hover-scale border border-purple-200">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Award className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-purple-800">Monthly attendance</p>
                    <p className="text-sm text-purple-700">{stats?.monthlyAttendance || 0}% this month</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Info */}
          <Card className="animate-slide-in-up card-glow border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-slate-900">
                <User className="h-5 w-5 text-slate-600" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover-scale border border-gray-200">
                  <Mail className="h-5 w-5 text-slate-600" />
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Email</p>
                    <p className="font-medium text-slate-900">{user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover-scale border border-gray-200">
                  <Briefcase className="h-5 w-5 text-slate-600" />
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Department</p>
                    <p className="font-medium text-slate-900">{profile?.department || 'Not assigned'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover-scale border border-gray-200">
                  <MapPin className="h-5 w-5 text-slate-600" />
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Location</p>
                    <p className="font-medium text-slate-900">{profile?.location || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover-scale border border-gray-200">
                  <CalendarDays className="h-5 w-5 text-slate-600" />
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Start Date</p>
                    <p className="font-medium text-slate-900">
                      {profile?.start_date ? format(new Date(profile.start_date), 'MMM dd, yyyy') : 'Not available'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leave Summary */}
          <Card className="animate-slide-in-up card-glow border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-slate-900">
                <Calendar className="h-5 w-5 text-orange-600" />
                <span>Leave Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg hover-scale border border-orange-200">
                  <div>
                    <p className="font-medium text-orange-800">Pending Requests</p>
                    <p className="text-sm text-orange-700">Awaiting approval</p>
                  </div>
                  <Badge variant="secondary" className="text-lg px-3 py-1 bg-orange-100 text-orange-800">
                    {stats?.pendingLeaves || 0}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg hover-scale border border-green-200">
                  <div>
                    <p className="font-medium text-green-800">Approved Leaves</p>
                    <p className="text-sm text-green-700">This year</p>
                  </div>
                  <Badge variant="default" className="text-lg px-3 py-1 bg-green-600 text-white">
                    {stats?.approvedLeaves || 0}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg hover-scale border border-blue-200">
                  <div>
                    <p className="font-medium text-blue-800">Remaining Days</p>
                    <p className="text-sm text-blue-700">Available to use</p>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1 border-blue-300 text-blue-800">
                    {stats?.remainingLeaves || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}