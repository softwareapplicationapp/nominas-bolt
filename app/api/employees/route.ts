import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, createUser } from '@/lib/auth';
import { dbRun, dbGet, dbAll } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET /api/employees called ===');
    
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

    console.log('Fetching employees for company:', user.company_id);
    
    const employees = await dbAll(`
      SELECT e.*, u.role
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      WHERE e.company_id = ?
      ORDER BY e.created_at DESC
    `, [user.company_id]);

    console.log('Employees fetched from database:', employees.length);
    if (employees.length > 0) {
      console.log('Employee details:', employees.map(e => `${e.first_name} ${e.last_name} (${e.department}) - Role: ${e.role}`));
    } else {
      console.log('No employees found for company:', user.company_id);
    }

    console.log('=== Returning employees response ===');
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== 'admin' && user.role !== 'hr_manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      startDate,
      salary,
      location,
      password // New field for employee password
    } = await request.json();

    // Check if email already exists
    const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    // Generate employee ID
    const lastEmployee = await dbGet(`
      SELECT employee_id FROM employees 
      WHERE company_id = ? 
      ORDER BY id DESC LIMIT 1
    `, [user.company_id]) as any;

    let nextId = 1;
    if (lastEmployee?.employee_id) {
      const lastNum = parseInt(lastEmployee.employee_id.replace('EMP', ''));
      nextId = lastNum + 1;
    }
    const employeeId = `EMP${nextId.toString().padStart(3, '0')}`;

    // Create user account for the employee
    const defaultPassword = password || 'employee123'; // Use provided password or default
    const newUser = await createUser(email, defaultPassword, 'employee', user.company_id);

    // Create employee record
    const result = await dbRun(`
      INSERT INTO employees (
        user_id, employee_id, first_name, last_name, email, phone, 
        department, position, start_date, salary, location, company_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      newUser.id, employeeId, firstName, lastName, email, phone,
      department, position, startDate, salary, location, user.company_id
    ]) as any;

    const newEmployee = await dbGet(`
      SELECT e.*, u.role
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      WHERE e.id = ?
    `, [result.lastID]);

    return NextResponse.json({
      ...newEmployee,
      temporaryPassword: defaultPassword // Return the password so admin knows what it is
    });
  } catch (error) {
    console.error('Create employee error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}