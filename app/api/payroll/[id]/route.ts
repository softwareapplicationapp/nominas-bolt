import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { dbRun, dbGet } from '@/lib/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== 'admin' && user.role !== 'hr_manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payrollId = parseInt(params.id);
    const data = await request.json();

    if ('status' in data && Object.keys(data).length <= 2) {
      // Simple status update (used when processing payroll)
      await dbRun(
        `UPDATE payroll SET status = ?, processed_at = ? WHERE id = ?`,
        [data.status, data.processed_at || null, payrollId]
      );
    } else {
      // Full update of payroll record
      await dbRun(
        `UPDATE payroll
         SET pay_period_start = ?, pay_period_end = ?, base_salary = ?, bonus = ?, deductions = ?, net_pay = ?, status = ?, processed_at = ?
         WHERE id = ?`,
        [
          data.payPeriodStart,
          data.payPeriodEnd,
          data.baseSalary,
          data.bonus ?? 0,
          data.deductions ?? 0,
          data.netPay,
          data.status,
          data.processed_at ?? null,
          payrollId,
        ]
      );
    }

    const updatedPayroll = await dbGet(
      `SELECT p.*, e.first_name, e.last_name, e.department, e.employee_id
       FROM payroll p
       JOIN employees e ON p.employee_id = e.id
       WHERE p.id = ?`,
      [payrollId]
    );

    return NextResponse.json(updatedPayroll);
  } catch (error) {
    console.error('Update payroll error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== 'admin' && user.role !== 'hr_manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payrollId = parseInt(params.id);
    await dbRun('DELETE FROM payroll WHERE id = ?', [payrollId]);
    return NextResponse.json({ message: 'Payroll record deleted successfully' });
  } catch (error) {
    console.error('Delete payroll error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
