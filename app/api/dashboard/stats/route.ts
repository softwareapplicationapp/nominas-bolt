import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { dbGet, dbAll } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Get total employees
    const totalEmployees = await dbGet(`
      SELECT COUNT(*) as count FROM employees WHERE company_id = ? AND status = 'active'
    `, [user.company_id]) as any;

    // Get today's attendance
    const todayAttendance = await dbGet(`
      SELECT COUNT(*) as count FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE e.company_id = ? AND a.date = ? AND a.status = 'present'
    `, [user.company_id, today]) as any;

    // Get pending leaves
    const pendingLeaves = await dbGet(`
      SELECT COUNT(*) as count FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      WHERE e.company_id = ? AND lr.status = 'pending'
    `, [user.company_id]) as any;

    // Get current month payroll
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyPayroll = await dbGet(`
      SELECT COALESCE(SUM(net_pay), 0) as total FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      WHERE e.company_id = ? AND strftime('%Y-%m', p.pay_period_start) = ?
    `, [user.company_id, currentMonth]) as any;

    // Get attendance trends (last 7 days)
    const attendanceTrends = await dbAll(`
      SELECT 
        a.date,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE e.company_id = ? AND a.date >= date('now', '-7 days')
      GROUP BY a.date
      ORDER BY a.date
    `, [user.company_id]);

    // Get department distribution
    const departmentStats = await dbAll(`
      SELECT department, COUNT(*) as count
      FROM employees
      WHERE company_id = ? AND status = 'active'
      GROUP BY department
    `, [user.company_id]);

    return NextResponse.json({
      totalEmployees: totalEmployees.count,
      presentToday: todayAttendance.count,
      pendingLeaves: pendingLeaves.count,
      monthlyPayroll: monthlyPayroll.total,
      attendanceTrends,
      departmentStats
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}