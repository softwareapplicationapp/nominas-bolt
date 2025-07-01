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

    // Calculate the Monday of the current week
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // If Sunday, go back 6 days, otherwise go back (currentDay - 1) days
    
    const monday = new Date(now);
    monday.setDate(now.getDate() - daysFromMonday);
    monday.setHours(0, 0, 0, 0);
    
    const mondayStr = monday.toISOString().split('T')[0];

    console.log('=== STATS: Date calculations ===');
    console.log('Today:', today);
    console.log('Current month:', currentMonth);
    console.log('Monday of current week:', mondayStr);
    console.log('Employee ID for queries:', employee.id);

    // Get today's attendance with detailed logging
    console.log('=== STATS: Getting today\'s attendance ===');
    console.log('SQL Query: SELECT COALESCE(SUM(total_hours), 0) as total FROM attendance WHERE employee_id = ? AND date = ?');
    console.log('Parameters:', [employee.id, today]);
    
    const todayAttendance = await dbGet(`
      SELECT COALESCE(SUM(total_hours), 0) as total FROM attendance 
      WHERE employee_id = ? AND date = ?
    `, [employee.id, today]) as any;

    console.log('=== STATS: Today\'s attendance result ===');
    console.log('Raw result:', todayAttendance);
    console.log('Total hours today:', todayAttendance?.total || 0);

    // Get weekly hours (current week - Monday to Sunday) with detailed logging
    console.log('=== STATS: Getting weekly hours ===');
    console.log('SQL Query: SELECT COALESCE(SUM(total_hours), 0) as total FROM attendance WHERE employee_id = ? AND date >= ?');
    console.log('Parameters:', [employee.id, mondayStr]);
    
    // Get all attendance records since Monday of current week
    const { data: weeklyAttendanceData } = await supabase
      .from('attendance')
      .select('total_hours, date')
      .eq('employee_id', employee.id)
      .gte('date', mondayStr);
    
    console.log('Weekly attendance records:', weeklyAttendanceData);
    
    // Calculate total hours for the week
    const weeklyTotal = (weeklyAttendanceData || []).reduce((sum, record) => sum + (record.total_hours || 0), 0);
    
    console.log('=== STATS: Weekly hours result ===');
    console.log('Weekly records found:', weeklyAttendanceData?.length || 0);
    console.log('Total weekly hours calculated:', weeklyTotal);

    // Get monthly attendance rate with detailed logging
    console.log('=== STATS: Getting monthly attendance ===');
    console.log('SQL Query: SELECT COUNT(*) as total_days, COUNT(CASE WHEN status = \'present\' THEN 1 END) as present_days FROM attendance WHERE employee_id = ? AND strftime(\'%Y-%m\', date) = ?');
    console.log('Parameters:', [employee.id, currentMonth]);
    
    const monthlyAttendance = await dbAll(`
      SELECT COUNT(*) as total_days,
             COUNT(CASE WHEN status = 'present' THEN 1 END) as present_days
      FROM attendance 
      WHERE employee_id = ? AND strftime('%Y-%m', date) = ?
    `, [employee.id, currentMonth]) as any;

    console.log('=== STATS: Monthly attendance result ===');
    console.log('Raw result:', monthlyAttendance);
    console.log('Monthly attendance array:', monthlyAttendance);

    const attendanceRate = monthlyAttendance[0]?.total_days > 0 
      ? Math.round((monthlyAttendance[0].present_days / monthlyAttendance[0].total_days) * 100)
      : 100;

    console.log('=== STATS: Calculated attendance rate ===');
    console.log('Total days:', monthlyAttendance[0]?.total_days);
    console.log('Present days:', monthlyAttendance[0]?.present_days);
    console.log('Calculated rate:', attendanceRate);

    // Get leave statistics with detailed logging
    console.log('=== STATS: Getting leave statistics ===');
    console.log('SQL Query: SELECT COUNT(CASE WHEN status = \'pending\' THEN 1 END) as pending_leaves, COUNT(CASE WHEN status = \'approved\' THEN 1 END) as approved_leaves, COALESCE(SUM(CASE WHEN status = \'approved\' THEN days ELSE 0 END), 0) as used_leave_days FROM leave_requests WHERE employee_id = ? AND strftime(\'%Y\', created_at) = strftime(\'%Y\', \'now\')');
    console.log('Parameters:', [employee.id]);
    
    const leaveStats = await dbGet(`
      SELECT 
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_leaves,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_leaves,
        COALESCE(SUM(CASE WHEN status = 'approved' THEN days ELSE 0 END), 0) as used_leave_days
      FROM leave_requests 
      WHERE employee_id = ? AND strftime('%Y', created_at) = strftime('%Y', 'now')
    `, [employee.id]) as any;

    console.log('=== STATS: Leave statistics result ===');
    console.log('Raw result:', leaveStats);

    // Calculate remaining leave days (assuming 20 days per year)
    const totalLeaveAllowance = 20;
    const remainingLeaves = totalLeaveAllowance - (leaveStats?.used_leave_days || 0);

    console.log('=== STATS: Leave calculations ===');
    console.log('Total leave allowance:', totalLeaveAllowance);
    console.log('Used leave days:', leaveStats?.used_leave_days || 0);
    console.log('Remaining leaves:', Math.max(0, remainingLeaves));

    // Let's also check what attendance records actually exist for this employee
    console.log('=== STATS: Checking all attendance records for debugging ===');
    const allAttendanceRecords = await dbAll(`
      SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC LIMIT 10
    `, [employee.id]);
    
    console.log('=== STATS: All attendance records (last 10) ===');
    console.log('Number of records found:', allAttendanceRecords?.length || 0);
    if (allAttendanceRecords && allAttendanceRecords.length > 0) {
      allAttendanceRecords.forEach((record, index) => {
        console.log(`Record ${index + 1}:`, {
          id: record.id,
          date: record.date,
          check_in: record.check_in,
          check_out: record.check_out,
          total_hours: record.total_hours,
          status: record.status
        });
      });
    } else {
      console.log('❌ No attendance records found for employee_id:', employee.id);
    }

    const result = {
      attendanceToday: !!todayAttendance && todayAttendance.total > 0,
      checkInTime: null, // We'll need to get this separately if needed
      checkOutTime: null, // We'll need to get this separately if needed
      totalHoursToday: todayAttendance?.total || 0,
      weeklyHours: weeklyTotal || 0, // Use the calculated weekly total
      monthlyAttendance: attendanceRate,
      pendingLeaves: leaveStats?.pending_leaves || 0,
      approvedLeaves: leaveStats?.approved_leaves || 0,
      remainingLeaves: Math.max(0, remainingLeaves)
    };

    console.log('=== STATS: Final result object ===');
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('=== END STATS API ===');

    return NextResponse.json(result);
  } catch (error) {
    console.error('Get employee stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}