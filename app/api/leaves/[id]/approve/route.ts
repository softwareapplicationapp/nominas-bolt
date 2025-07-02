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
    const { action, comments } = await request.json(); // Include comments

    console.log('=== LEAVE APPROVAL REQUEST ===');
    console.log('Leave ID:', leaveId);
    console.log('Action:', action);
    console.log('Comments:', comments);

    // Get current user's employee record
    const currentEmployee = await dbGet(`
      SELECT id FROM employees WHERE user_id = ?
    `, [user.id]) as any;

    console.log('Current employee approving:', currentEmployee);

    // FIXED: Update leave request with correct parameter order
    // SQL: UPDATE leave_requests SET status = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP, admin_comments = ? WHERE id = ?
    // Parameters: [status, approved_by, admin_comments, leave_id]
    await dbRun(`
      UPDATE leave_requests 
      SET status = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP, admin_comments = ?
      WHERE id = ?
    `, [
      action === 'approve' ? 'approved' : 'rejected', // status
      currentEmployee?.id,                            // approved_by
      comments || null,                               // admin_comments
      leaveId                                         // leave_id (WHERE clause)
    ]);

    // Get the updated leave request with all details
    const updatedLeave = await dbGet(`
      SELECT lr.*, e.first_name, e.last_name, e.department,
             approver.first_name as approver_first_name, approver.last_name as approver_last_name
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN employees approver ON lr.approved_by = approver.id
      WHERE lr.id = ?
    `, [leaveId]);

    console.log('Updated leave request:', updatedLeave);

    return NextResponse.json(updatedLeave);
  } catch (error) {
    console.error('Approve leave error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}