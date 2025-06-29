import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { dbRun, dbGet, dbAll } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get employee record
    const employee = await dbGet(`
      SELECT id FROM employees WHERE user_id = ?
    `, [user.id]) as any;

    if (!employee) {
      return NextResponse.json({ error: 'Employee profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const attendance = await dbAll(`
      SELECT * FROM attendance 
      WHERE employee_id = ? AND date = ?
      ORDER BY created_at DESC
    `, [employee.id, date]);

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Get employee attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get employee record
    const employee = await dbGet(`
      SELECT id FROM employees WHERE user_id = ?
    `, [user.id]) as any;

    if (!employee) {
      return NextResponse.json({ error: 'Employee profile not found' }, { status: 404 });
    }

    const { action } = await request.json(); // 'check_in' or 'check_out'
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5);

    // Check if there's already an attendance record for today
    const existingAttendance = await dbGet(`
      SELECT * FROM attendance WHERE employee_id = ? AND date = ?
    `, [employee.id, today]) as any;

    if (action === 'check_in') {
      if (existingAttendance && existingAttendance.check_in) {
        return NextResponse.json({ error: 'Already checked in today' }, { status: 400 });
      }

      if (existingAttendance) {
        // Update existing record
        await dbRun(`
          UPDATE attendance 
          SET check_in = ?, status = 'present'
          WHERE id = ?
        `, [currentTime, existingAttendance.id]);
      } else {
        // Create new record
        await dbRun(`
          INSERT INTO attendance (employee_id, date, check_in, status)
          VALUES (?, ?, ?, 'present')
        `, [employee.id, today, currentTime]);
      }
    } else if (action === 'check_out') {
      if (!existingAttendance || !existingAttendance.check_in) {
        return NextResponse.json({ error: 'Must check in first' }, { status: 400 });
      }

      if (existingAttendance.check_out) {
        return NextResponse.json({ error: 'Already checked out today' }, { status: 400 });
      }

      // Calculate total hours
      const checkInTime = new Date(`2000-01-01 ${existingAttendance.check_in}`);
      const checkOutTime = new Date(`2000-01-01 ${currentTime}`);
      const totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

      await dbRun(`
        UPDATE attendance 
        SET check_out = ?, total_hours = ?
        WHERE id = ?
      `, [currentTime, totalHours, existingAttendance.id]);
    }

    // Return updated attendance record
    const updatedAttendance = await dbGet(`
      SELECT * FROM attendance WHERE employee_id = ? AND date = ?
    `, [employee.id, today]);

    return NextResponse.json(updatedAttendance);
  } catch (error) {
    console.error('Employee attendance action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}