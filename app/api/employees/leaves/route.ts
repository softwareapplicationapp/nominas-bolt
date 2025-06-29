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

    const leaves = await dbAll(`
      SELECT lr.*, 
             approver.first_name as approver_first_name, 
             approver.last_name as approver_last_name
      FROM leave_requests lr
      LEFT JOIN employees approver ON lr.approved_by = approver.id
      WHERE lr.employee_id = ?
      ORDER BY lr.created_at DESC
    `, [employee.id]);

    return NextResponse.json(leaves);
  } catch (error) {
    console.error('Get employee leaves error:', error);
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

    const { type, startDate, endDate, reason } = await request.json();

    // Calculate days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const result = await dbRun(`
      INSERT INTO leave_requests (employee_id, type, start_date, end_date, days, reason)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [employee.id, type, startDate, endDate, days, reason]) as any;

    const newLeave = await dbGet(`
      SELECT lr.*, 
             approver.first_name as approver_first_name, 
             approver.last_name as approver_last_name
      FROM leave_requests lr
      LEFT JOIN employees approver ON lr.approved_by = approver.id
      WHERE lr.id = ?
    `, [result.lastID]);

    return NextResponse.json(newLeave);
  } catch (error) {
    console.error('Create employee leave error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}