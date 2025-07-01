import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { dbRun, dbGet, dbAll } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET /api/employees/attendance called ===');
    
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

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    console.log('Date parameter:', date);

    console.log('=== CALLING dbAll for attendance ===');
    console.log('Employee ID:', employee.id);
    console.log('Date filter:', date);

    // Use the corrected dbAll function
    const attendance = await dbAll(`
      SELECT * FROM attendance 
      WHERE employee_id = ?
      ORDER BY date DESC, created_at DESC
    `, [employee.id, date]); // Pass date as second parameter even if null

    console.log('=== dbAll RESULT ===');
    console.log('Attendance records found:', attendance?.length || 0);
    if (attendance && attendance.length > 0) {
      console.log('First record:', attendance[0]);
      console.log('Last record:', attendance[attendance.length - 1]);
    } else {
      console.log('No attendance records found');
    }

    return NextResponse.json(attendance || []);
  } catch (error) {
    console.error('Get employee attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== POST /api/employees/attendance called ===');
    
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
    console.log('Action requested:', action);
    
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5);
    
    console.log('Today:', today);
    console.log('Current time:', currentTime);

    if (action === 'check_in') {
      // For check-in, always create a new record
      console.log('Creating new check-in record');
      
      const result = await dbRun(`
        INSERT INTO attendance (employee_id, date, check_in, status)
        VALUES (?, ?, ?, 'present')
      `, [employee.id, today, currentTime]) as any;

      console.log('New check-in record created with ID:', result.lastID);

      // Return the new record
      const newRecord = await dbGet(`
        SELECT * FROM attendance WHERE id = ?
      `, [result.lastID]);

      console.log('New attendance record:', newRecord);
      return NextResponse.json(newRecord);

    } else if (action === 'check_out') {
      // For check-out, find the most recent check-in without check-out
      console.log('Looking for most recent check-in without check-out');
      
      const openRecord = await dbGet(`
        SELECT * FROM attendance 
        WHERE employee_id = ? AND date = ? AND check_in IS NOT NULL AND check_out IS NULL
        ORDER BY created_at DESC
        LIMIT 1
      `, [employee.id, today]) as any;

      console.log('Open record found:', openRecord);

      if (!openRecord) {
        return NextResponse.json({ 
          error: 'No open check-in found for today. Please check in first.' 
        }, { status: 400 });
      }

      // Calculate total hours
      const checkInTime = new Date(`2000-01-01 ${openRecord.check_in}`);
      const checkOutTime = new Date(`2000-01-01 ${currentTime}`);
      const totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

      console.log('Calculating total hours:', {
        checkIn: openRecord.check_in,
        checkOut: currentTime,
        totalHours
      });

      // Update the record with check-out time
      await dbRun(`
        UPDATE attendance 
        SET check_out = ?, total_hours = ?
        WHERE id = ?
      `, [currentTime, totalHours, openRecord.id]);

      // Return updated record
      const updatedRecord = await dbGet(`
        SELECT * FROM attendance WHERE id = ?
      `, [openRecord.id]);

      console.log('Updated attendance record:', updatedRecord);
      return NextResponse.json(updatedRecord);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Employee attendance action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}