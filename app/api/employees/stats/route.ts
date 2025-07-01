import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { dbGet, dbAll } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET /api/employees/stats called ===');
    
    const user = await getUserFromRequest(request);
    console.log('User from request:', user ? {
      id: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id
    } : 'null');
    
    if (!user) {
      console.log('No user found - unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get employee record
    console.log('Getting employee record for user_id:', user.id);
    const employee = await dbGet(`
      SELECT id FROM employees WHERE user_id = ?
    `, [user.id]) as any;

    console.log('Employee record found:', employee);

    if (!employee) {
      console.log('Employee profile not found for user_id:', user.id);
      return NextResponse.json({ error: 'Employee profile not found' }, { status: 404 });
    }

    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7);

    console.log('=== STATS: Getting today\'s attendance ===');
    console.log('Today:', today);
    console.log('Employee ID:', employee.id);

    // Get today's attendance
    const todayAttendance = await dbGet(`
      SELECT * FROM attendance WHERE employee_id = ? AND date = ?
    `, [employee.id, today]) as any;

    console.log('Today\'s attendance result:', todayAttendance);

    console.log('=== STATS: Getting weekly hours ===');
    // Get weekly hours (last 7 days)
    const weeklyHours = await dbGet(`
      SELECT COALESCE(SUM(total_hours), 0) as total
      FROM attendance 
      WHERE employee_id = ? AND date >= date('now', '-7 days')
    `, [employee.id]) as any;

    console.log('Weekly hours result:', weeklyHours);

    console.log('=== STATS: Getting monthly attendance ===');
    // Get monthly attendance rate
    const monthlyAttendance = await dbAll(`
      SELECT COUNT(*) as total_days,
             COUNT(CASE WHEN status = 'present' THEN 1 END) as present_days
      FROM attendance 
      WHERE employee_id = ? AND strftime('%Y-%m', date) = ?
    `, [employee.id, currentMonth]) as any;

    console.log('Monthly attendance result:', monthlyAttendance);

    const attendanceRate = monthlyAttendance[0]?.total_days > 0 
      ? Math.round((monthlyAttendance[0].present_days / monthlyAttendance[0].total_days) * 100)
      : 100;

    console.log('Calculated attendance rate:', attendanceRate);

    console.log('=== STATS: Getting leave statistics ===');
    // Get leave statistics
    const leaveStats = await dbGet(`
      SELECT 
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_leaves,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_leaves,
        COALESCE(SUM(CASE WHEN status = 'approved' THEN days ELSE 0 END), 0) as used_leave_days
      FROM leave_requests 
      WHERE employee_id = ? AND strftime('%Y', created_at) = strftime('%Y', 'now')
    `, [employee.id]) as any;

    console.log('Leave stats result:', leaveStats);

    // Calculate remaining leave days (assuming 20 days per year)
    const totalLeaveAllowance = 20;
    const remainingLeaves = totalLeaveAllowance - (leaveStats?.used_leave_days || 0);

    console.log('=== STATS: Final calculations ===');
    console.log('Total hours today:', todayAttendance?.total_hours || 0);
    console.log('Weekly hours total:', weeklyHours?.total || 0);
    console.log('Remaining leaves:', Math.max(0, remainingLeaves));

    const result = {
      attendanceToday: !!todayAttendance,
      checkInTime: todayAttendance?.check_in,
      checkOutTime: todayAttendance?.check_out,
      totalHoursToday: todayAttendance?.total_hours || 0,
      weeklyHours: weeklyHours?.total || 0,
      monthlyAttendance: attendanceRate,
      pendingLeaves: leaveStats?.pending_leaves || 0,
      approvedLeaves: leaveStats?.approved_leaves || 0,
      remainingLeaves: Math.max(0, remainingLeaves)
    };

    console.log('=== STATS: Final result ===');
    console.log('Result:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Get employee stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}