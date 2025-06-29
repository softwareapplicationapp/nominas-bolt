import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { dbRun, dbGet, dbAll } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leaves = await dbAll(`
      SELECT lr.*, e.first_name, e.last_name, e.department,
             approver.first_name as approver_first_name, approver.last_name as approver_last_name
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN employees approver ON lr.approved_by = approver.id
      WHERE e.company_id = ?
      ORDER BY lr.created_at DESC
    `, [user.company_id]);

    return NextResponse.json(leaves);
  } catch (error) {
    console.error('Get leaves error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { employeeId, type, startDate, endDate, reason } = await request.json();

    // Calculate days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const result = await dbRun(`
      INSERT INTO leave_requests (employee_id, type, start_date, end_date, days, reason)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [employeeId, type, startDate, endDate, days, reason]) as any;

    const newLeave = await dbGet(`
      SELECT lr.*, e.first_name, e.last_name, e.department
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      WHERE lr.id = ?
    `, [result.lastID]);

    return NextResponse.json(newLeave);
  } catch (error) {
    console.error('Create leave error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}