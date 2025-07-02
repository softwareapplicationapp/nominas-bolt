import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { dbRun, dbGet, dbAll } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET /api/payroll called ===');
    
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

    // Get payroll records for the company
    console.log('Fetching payroll records for company:', user.company_id);
    const payrollRecords = await dbAll(`
      SELECT p.*, e.first_name, e.last_name, e.department, e.employee_id
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      WHERE e.company_id = ?
      ORDER BY p.pay_period_start DESC
    `, [user.company_id]);

    console.log('Payroll records fetched:', payrollRecords?.length || 0);
    if (payrollRecords?.length > 0) {
      console.log('First record:', payrollRecords[0]);
    }

    return NextResponse.json(payrollRecords);
  } catch (error: any) {
    console.error('Get payroll error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== POST /api/payroll called ===');
    
    const user = await getUserFromRequest(request);
    console.log('User from request:', user ? {
      id: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id
    } : 'null');
    
    if (!user || (user.role !== 'admin' && user.role !== 'hr_manager')) {
      console.log('Unauthorized - user role:', user?.role);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestData = await request.json();
    console.log('Request data:', requestData);

    const {
      employeeId,
      payPeriodStart,
      payPeriodEnd,
      baseSalary,
      bonus = 0,
      deductions = 0,
      status = 'pending'
    } = requestData;

    // Calculate net pay
    const netPay = baseSalary + bonus - deductions;
    console.log('Calculated net pay:', netPay);

    console.log('Inserting payroll record with data:', {
      employeeId,
      payPeriodStart,
      payPeriodEnd,
      baseSalary,
      bonus,
      deductions,
      netPay,
      status
    });

    const result = await dbRun(`
      INSERT INTO payroll (employee_id, pay_period_start, pay_period_end, base_salary, bonus, deductions, net_pay, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [employeeId, payPeriodStart, payPeriodEnd, baseSalary, bonus, deductions, netPay, status]) as any;

    console.log('Insert result:', result);

    const newPayroll = await dbGet(`
      SELECT p.*, e.first_name, e.last_name, e.department, e.employee_id
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.id = ?
    `, [result.lastID]);

    console.log('New payroll record:', newPayroll);
    return NextResponse.json(newPayroll);
  } catch (error: any) {
    console.error('Create payroll error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}