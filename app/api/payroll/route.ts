import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { dbRun, dbGet, dbAll } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get payroll records for the company
    const payrollRecords = await dbAll(`
      SELECT p.*, e.first_name, e.last_name, e.department, e.employee_id
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      WHERE e.company_id = ?
      ORDER BY p.pay_period_start DESC
    `, [user.company_id]);

    return NextResponse.json(payrollRecords);
  } catch (error: any) {
    console.error('Get payroll error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== 'admin' && user.role !== 'hr_manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      employeeId,
      payPeriodStart,
      payPeriodEnd,
      baseSalary,
      bonus = 0,
      deductions = 0,
      status = 'pending'
    } = await request.json();

    // Calculate net pay
    const netPay = baseSalary + bonus - deductions;

    const result = await dbRun(`
      INSERT INTO payroll (employee_id, pay_period_start, pay_period_end, base_salary, bonus, deductions, net_pay, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [employeeId, payPeriodStart, payPeriodEnd, baseSalary, bonus, deductions, netPay, status]) as any;

    const newPayroll = await dbGet(`
      SELECT p.*, e.first_name, e.last_name, e.department, e.employee_id
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.id = ?
    `, [result.lastID]);

    return NextResponse.json(newPayroll);
  } catch (error: any) {
    console.error('Create payroll error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}