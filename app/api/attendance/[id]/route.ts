import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { dbRun, dbGet } from '@/lib/database';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== 'admin' && user.role !== 'hr_manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const attendanceId = parseInt(params.id);
    const { checkIn, checkOut, totalHours, status, notes } = await request.json();

    // Update the attendance record
    await dbRun(`
      UPDATE attendance 
      SET check_in = ?, check_out = ?, total_hours = ?, status = ?, notes = ?
      WHERE id = ?
    `, [checkIn, checkOut, totalHours, status, notes, attendanceId]);

    // Get the updated record with employee details
    const updatedRecord = await dbGet(`
      SELECT a.*, e.first_name, e.last_name, e.department
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.id = ?
    `, [attendanceId]);

    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error('Update attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== 'admin' && user.role !== 'hr_manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const attendanceId = parseInt(params.id);

    // Delete the attendance record
    await dbRun('DELETE FROM attendance WHERE id = ?', [attendanceId]);

    return NextResponse.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Delete attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}