import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { dbRun, dbGet, dbAll } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET /api/employees/leaves called ===');
    
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

    // Get employee record
    console.log('Getting employee record for user_id:', user.id);
    const employee = await dbGet(`
      SELECT id FROM employees WHERE user_id = ?
    `, [user.id]) as any;

    console.log('Employee record found:', employee);

    if (!employee) {
      console.log('Employee profile not found for user_id:', user.id);
      return NextResponse.json({ error: 'Employee profile not found' }, { status: 404 });
    }

    console.log('=== GETTING EMPLOYEE LEAVES ===');
    console.log('Employee ID:', employee.id);

    const leaves = await dbAll(`
      SELECT lr.*, 
             approver.first_name as approver_first_name, 
             approver.last_name as approver_last_name
      FROM leave_requests lr
      LEFT JOIN employees approver ON lr.approved_by = approver.id
      WHERE lr.employee_id = ?
      ORDER BY lr.created_at DESC
    `, [employee.id]);

    console.log('=== LEAVES QUERY RESULT ===');
    console.log('Number of leaves found:', leaves?.length || 0);
    if (leaves && leaves.length > 0) {
      console.log('Leaves data:', leaves.map(l => ({
        id: l.id,
        type: l.type,
        start_date: l.start_date,
        end_date: l.end_date,
        days: l.days,
        status: l.status,
        reason: l.reason
      })));
    } else {
      console.log('No leaves found for employee_id:', employee.id);
    }

    return NextResponse.json(leaves || []);
  } catch (error: any) {
    console.error('Get employee leaves error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== POST /api/employees/leaves called ===');
    
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

    console.log('Creating leave request:', {
      employee_id: employee.id,
      type,
      startDate,
      endDate,
      reason
    });

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

    console.log('New leave request created:', newLeave);

    return NextResponse.json(newLeave);
  } catch (error: any) {
    console.error('Create employee leave error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}