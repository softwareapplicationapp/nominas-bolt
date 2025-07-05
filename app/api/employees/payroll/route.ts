import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { dbAll, dbGet } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET /api/employees/payroll called ===');

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

    // Get employee record for this user
    console.log('Getting employee record for user_id:', user.id);
    const employee = await dbGet(
      `SELECT id FROM employees WHERE user_id = ?`,
      [user.id]
    ) as any;

    console.log('Employee record found:', employee);

    if (!employee) {
      console.log('Employee profile not found for user_id:', user.id);
      return NextResponse.json({ error: 'Employee profile not found' }, { status: 404 });
    }

    console.log('Fetching payroll records for employee_id:', employee.id);

    const payrollRecords = await dbAll(
      `SELECT p.*, e.first_name, e.last_name, e.department, e.employee_id
       FROM payroll p
       JOIN employees e ON p.employee_id = e.id
       WHERE p.employee_id = ?
       ORDER BY p.pay_period_start DESC`,
      [employee.id]
    );

    console.log('Payroll records found:', payrollRecords?.length || 0);
    if (payrollRecords && payrollRecords.length > 0) {
      console.log('First record:', payrollRecords[0]);
    }

    return NextResponse.json(payrollRecords || []);
  } catch (error: any) {
    console.error('Get employee payroll error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
