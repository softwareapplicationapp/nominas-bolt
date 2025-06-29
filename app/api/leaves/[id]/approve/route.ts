import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { dbRun, dbGet } from '@/lib/database';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== 'admin' && user.role !== 'hr_manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leaveId = parseInt(params.id);
    const { action } = await request.json(); // 'approve' or 'reject'

    // Get current user's employee record
    const currentEmployee = await dbGet(`
      SELECT id FROM employees WHERE user_id = ?
    `, [user.id]) as any;

    await dbRun(`
      UPDATE leave_requests 
      SET status = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [action === 'approve' ? 'approved' : 'rejected', currentEmployee?.id, leaveId]);

    const updatedLeave = await dbGet(`
      SELECT lr.*, e.first_name, e.last_name, e.department,
             approver.first_name as approver_first_name, approver.last_name as approver_last_name
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN employees approver ON lr.approved_by = approver.id
      WHERE lr.id = ?
    `, [leaveId]);

    return NextResponse.json(updatedLeave);
  } catch (error) {
    console.error('Approve leave error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}