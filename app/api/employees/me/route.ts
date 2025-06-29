import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { dbGet, dbRun } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET /api/employees/me called ===');
    
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

    console.log('Fetching employee data for user ID:', user.id);
    console.log('User ID type:', typeof user.id);
    
    // Get employee data for the current user - SIMPLIFIED APPROACH
    const employee = await dbGet(`
      SELECT e.*, u.role
      FROM employees e
      JOIN users u ON e.user_id = u.id
      WHERE e.user_id = ?
    `, [user.id]);

    console.log('Employee data from database:', employee);

    if (!employee) {
      console.log('Employee profile not found for user:', user.id);
      return NextResponse.json({ error: 'Employee profile not found' }, { status: 404 });
    }

    console.log('=== Returning employee profile ===');
    return NextResponse.json(employee);
  } catch (error) {
    console.error('Get employee profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('=== PUT /api/employees/me called ===');
    
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { firstName, lastName, phone, location } = await request.json();
    console.log('Update data:', { firstName, lastName, phone, location });

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

    console.log('Updated employee:', updatedEmployee);
    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error('Update employee profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}