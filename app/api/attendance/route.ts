import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { dbRun, dbGet, dbAll } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const attendance = await dbAll(`
      SELECT a.*, e.first_name, e.last_name, e.department
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE e.company_id = ? AND a.date = ?
      ORDER BY a.created_at DESC
    `, [user.company_id, date]);

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { employeeId, date, checkIn, checkOut, status, notes } = await request.json();

    // Calculate total hours if both check in and out are provided
    let totalHours = 0;
    if (checkIn && checkOut) {
      const checkInTime = new Date(`2000-01-01 ${checkIn}`);
      const checkOutTime = new Date(`2000-01-01 ${checkOut}`);
      totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
    }

    const result = await dbRun(`
      INSERT OR REPLACE INTO attendance (employee_id, date, check_in, check_out, total_hours, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [employeeId, date, checkIn, checkOut, totalHours, status, notes]) as any;

    const newAttendance = await dbGet(`
      SELECT a.*, e.first_name, e.last_name, e.department
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.id = ?
    `, [result.lastID]);

    return NextResponse.json(newAttendance);
  } catch (error) {
    console.error('Create attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}