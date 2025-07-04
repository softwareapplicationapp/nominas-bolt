import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || `${new Date().getFullYear()}`);
    const startDateParam = searchParams.get('startDate') || `${year}-01-01`;
    const endDateParam = searchParams.get('endDate') || `${year}-12-31`;
    const employeeIdParam = searchParams.get('employeeId');
    const department = searchParams.get('department');

    let employeeQuery = supabase
      .from('employees')
      .select('id, department')
      .eq('company_id', user.company_id)
      .eq('status', 'active');

    if (department) {
      employeeQuery = employeeQuery.eq('department', department);
    }
    if (employeeIdParam) {
      employeeQuery = employeeQuery.eq('id', Number(employeeIdParam));
    }

    const { data: employees } = await employeeQuery;

    if (!employees || employees.length === 0) {
      return NextResponse.json({
        keyMetrics: { totalEmployees: 0, avgAttendance: 0, monthlyPayroll: 0, goalAchievement: 0 },
        attendanceData: [],
        monthBreakdown: { present: 0, late: 0, absent: 0 },
        payrollBreakdown: { base: 0, bonus: 0, deductions: 0, net: 0 },
        payrollTrends: [],
        departmentMetrics: [],
        leaveAnalysis: [],
        leaveStats: { totalLeaveDays: 0, averagePerEmployee: 0, pending: 0, approvalRate: 0 },
        performanceData: [],
      });
    }

    const employeeIds = employees.map(e => e.id);
    const currentMonth = endDateParam.slice(0, 7);

    const { data: monthAttendance } = await supabase
      .from('attendance')
      .select('status')
      .in('employee_id', employeeIds)
      .gte('date', startDateParam)
      .lte('date', endDateParam);

    let present = 0;
    let absent = 0;
    let late = 0;
    (monthAttendance || []).forEach(a => {
      if (a.status === 'present') present++;
      else if (a.status === 'absent') absent++;
      else if (a.status === 'late') late++;
    });
    const totalRecords = present + absent + late;
    const avgAttendance = totalRecords > 0 ? Math.round(((present + late) / totalRecords) * 100) : 0;
    const monthBreakdown = { present, late, absent };

    const { data: monthPayroll } = await supabase
      .from('payroll')
      .select('base_salary, bonus, deductions, net_pay')
      .in('employee_id', employeeIds)
      .gte('pay_period_start', startDateParam)
      .lte('pay_period_end', endDateParam);
    const monthlyPayroll = (monthPayroll || []).reduce((sum, p) => sum + (p.net_pay || 0), 0);
    const payrollBreakdown = (monthPayroll || []).reduce(
      (acc, p) => {
        acc.base += p.base_salary || 0;
        acc.bonus += p.bonus || 0;
        acc.deductions += p.deductions || 0;
        acc.net += p.net_pay || 0;
        return acc;
      },
      { base: 0, bonus: 0, deductions: 0, net: 0 }
    );

    const keyMetrics = {
      totalEmployees: employees.length,
      avgAttendance,
      monthlyPayroll,
      goalAchievement: avgAttendance,
    };

    const attendanceData: Array<{ month: string; present: number; absent: number; late: number }> = [];
    const start = new Date(startDateParam);
    const end = new Date(endDateParam);
    const iter = new Date(start.getFullYear(), start.getMonth(), 1);
    while (iter <= end && attendanceData.length < 12) {
      const monthStr = iter.toISOString().slice(0, 7);
      const { data } = await supabase
        .from('attendance')
        .select('status')
        .in('employee_id', employeeIds)
        .like('date', `${monthStr}%`);
      let p = 0;
      let a = 0;
      let l = 0;
      (data || []).forEach(r => {
        if (r.status === 'present') p++;
        else if (r.status === 'absent') a++;
        else if (r.status === 'late') l++;
      });
      attendanceData.push({
        month: iter.toLocaleString('default', { month: 'short' }),
        present: p,
        absent: a,
        late: l,
      });
      iter.setMonth(iter.getMonth() + 1);
    }

    const payrollTrends: Array<{ month: string; amount: number; employees: number }> = [];
    const iter2 = new Date(start.getFullYear(), start.getMonth(), 1);
    while (iter2 <= end && payrollTrends.length < 12) {
      const monthStr = iter2.toISOString().slice(0, 7);
      const { data } = await supabase
        .from('payroll')
        .select('net_pay, employee_id')
        .in('employee_id', employeeIds)
        .like('pay_period_start', `${monthStr}%`);
      const amount = (data || []).reduce((sum, p) => sum + (p.net_pay || 0), 0);
      const uniqueEmployees = new Set((data || []).map(r => r.employee_id));
      payrollTrends.push({
        month: iter2.toLocaleString('default', { month: 'short' }),
        amount,
        employees: uniqueEmployees.size,
      });
      iter2.setMonth(iter2.getMonth() + 1);
    }

    const departmentMap: Record<string, number[]> = {};
    employees.forEach(e => {
      if (!departmentMap[e.department]) departmentMap[e.department] = [];
      departmentMap[e.department].push(e.id);
    });

    const departmentMetrics: Array<{ name: string; employees: number; productivity: number; satisfaction: number }> = [];
    for (const [dept, ids] of Object.entries(departmentMap)) {
      const { data } = await supabase
        .from('attendance')
        .select('status')
        .in('employee_id', ids)
        .like('date', `${currentMonth}%`);
      let p = 0;
      let a = 0;
      let l = 0;
      (data || []).forEach(r => {
        if (r.status === 'present') p++;
        else if (r.status === 'absent') a++;
        else if (r.status === 'late') l++;
      });
      const total = p + a + l;
      const rate = total > 0 ? ((p + l) / total) * 100 : 0;
      departmentMetrics.push({
        name: dept,
        employees: ids.length,
        productivity: Math.round(rate),
        satisfaction: Math.round(100 - (a / (total || 1)) * 100),
      });
    }

    const startOfYear = `${year}-01-01`;
    const endOfYear = `${year}-12-31`;
    const { data: leaves } = await supabase
      .from('leave_requests')
      .select('type,status,days')
      .in('employee_id', employeeIds)
      .gte('start_date', startOfYear)
      .lte('start_date', endOfYear);
    const leaveCounts: Record<string, number> = {};
    let totalLeaveDays = 0;
    let pending = 0;
    let approved = 0;
    let totalRequests = 0;
    (leaves || []).forEach(l => {
      leaveCounts[l.type] = (leaveCounts[l.type] || 0) + 1;
      if (l.status === 'approved') {
        totalLeaveDays += l.days || 0;
        approved++;
      }
      if (l.status === 'pending') pending++;
      totalRequests++;
    });
    const leaveAnalysis = Object.entries(leaveCounts).map(([type, count], idx) => ({
      type,
      count,
      color: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#7c3aed'][idx % 5],
    }));
    const leaveStats = {
      totalLeaveDays,
      averagePerEmployee: employees.length > 0 ? +(totalLeaveDays / employees.length).toFixed(1) : 0,
      pending,
      approvalRate: totalRequests > 0 ? Math.round((approved / totalRequests) * 100) : 0,
    };

    const performanceData: Array<{ quarter: string; goals: number; achieved: number }> = [];
    for (let q = 0; q < 4; q++) {
      const startMonth = q * 3;
      const quarterStart = new Date(year, startMonth, 1);
      const quarterEnd = new Date(year, startMonth + 3, 0);
      const { data } = await supabase
        .from('attendance')
        .select('status')
        .in('employee_id', employeeIds)
        .gte('date', quarterStart.toISOString().split('T')[0])
        .lte('date', quarterEnd.toISOString().split('T')[0]);
      let p = 0;
      let a = 0;
      let l = 0;
      (data || []).forEach(r => {
        if (r.status === 'present') p++;
        else if (r.status === 'absent') a++;
        else if (r.status === 'late') l++;
      });
      const total = p + a + l;
      const achieved = total > 0 ? Math.round(((p + l) / total) * 100) : 0;
      performanceData.push({ quarter: `Q${q + 1}`, goals: 100, achieved });
    }

    return NextResponse.json({
      keyMetrics,
      attendanceData,
      monthBreakdown,
      payrollBreakdown,
      payrollTrends,
      departmentMetrics,
      leaveAnalysis,
      leaveStats,
      performanceData,
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

