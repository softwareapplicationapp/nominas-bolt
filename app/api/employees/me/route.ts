import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { dbGet, dbRun } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get employee data for the current user
    const employee = await dbGet(`
      SELECT e.*, u.role
      FROM employees e
      JOIN users u ON e.user_id = u.id
      WHERE e.user_id = ?
    `, [user.id]);

    if (!employee) {
      return NextResponse.json({ error: 'Employee profile not found' }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Get employee profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { firstName, lastName, phone, location } = await request.json();

    await dbRun(`
      UPDATE employees 
      SET first_name = ?, last_name = ?, phone = ?, location = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `, [firstName, lastName, phone, location, user.id]);

    const updatedEmployee = await dbGet(`
      SELECT e.*, u.role
      FROM employees e
      JOIN users u ON e.user_id = u.id
      WHERE e.user_id = ?
    `, [user.id]);

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error('Update employee profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}