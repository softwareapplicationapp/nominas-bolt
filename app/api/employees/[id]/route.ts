import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { dbRun, dbGet } from '@/lib/database';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== 'admin' && user.role !== 'hr_manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employeeId = parseInt(params.id);
    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      startDate,
      salary,
      location
    } = await request.json();

    await dbRun(`
      UPDATE employees 
      SET first_name = ?, last_name = ?, email = ?, phone = ?, 
          department = ?, position = ?, start_date = ?, salary = ?, location = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND company_id = ?
    `, [
      firstName, lastName, email, phone,
      department, position, startDate, salary, location,
      employeeId, user.company_id
    ]);

    const updatedEmployee = await dbGet('SELECT * FROM employees WHERE id = ?', [employeeId]);

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error('Update employee error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== 'admin' && user.role !== 'hr_manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employeeId = parseInt(params.id);

    // Check if employee exists and belongs to the same company
    const employee = await dbGet('SELECT * FROM employees WHERE id = ? AND company_id = ?', [employeeId, user.company_id]);
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Soft delete by updating status
    await dbRun(`
      UPDATE employees 
      SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND company_id = ?
    `, [employeeId, user.company_id]);

    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}