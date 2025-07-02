import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { dbRun, dbGet, dbAll } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET /api/payroll called ===');
    
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

    // Get payroll records for the company
    console.log('Fetching payroll records for company:', user.company_id);
    const payrollRecords = await dbAll(`
      SELECT p.*, e.first_name, e.last_name, e.department, e.employee_id
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      WHERE e.company_id = ?
      ORDER BY p.pay_period_start DESC
    `, [user.company_id]);

    console.log('Payroll records fetched:', payrollRecords?.length || 0);
    if (payrollRecords?.length > 0) {
      console.log('First record:', payrollRecords[0]);
      console.log('Sample records:', payrollRecords.slice(0, 3).map(r => ({
        id: r.id,
        employee_name: `${r.first_name} ${r.last_name}`,
        period: `${r.pay_period_start} to ${r.pay_period_end}`,
        net_pay: r.net_pay,
        status: r.status
      })));
    } else {
      console.log('❌ No payroll records found for company:', user.company_id);
      
      // Let's debug what employees exist for this company
      console.log('=== DEBUGGING: Checking employees for company ===');
      const employees = await dbAll(`
        SELECT e.*, u.role
        FROM employees e
        LEFT JOIN users u ON e.user_id = u.id
        WHERE e.company_id = ?
        ORDER BY e.created_at DESC
      `, [user.company_id]);
      
      console.log('Employees found for company:', employees?.length || 0);
      if (employees && employees.length > 0) {
        console.log('Employee IDs:', employees.map(e => e.id));
        
        // Check if there are any payroll records for these employees
        console.log('=== CHECKING PAYROLL RECORDS DIRECTLY ===');
        const employeeIds = employees.map(e => e.id);
        console.log('Looking for payroll records for employee IDs:', employeeIds);
      }
    }

    return NextResponse.json(payrollRecords || []);
  } catch (error: any) {
    console.error('Get payroll error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== POST /api/payroll called ===');
    
    const user = await getUserFromRequest(request);
    console.log('User from request:', user ? {
      id: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id
    } : 'null');
    
    if (!user || (user.role !== 'admin' && user.role !== 'hr_manager')) {
      console.log('Unauthorized - user role:', user?.role);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestData = await request.json();
    console.log('Request data:', requestData);

    const {
      employeeId,
      payPeriodStart,
      payPeriodEnd,
      baseSalary,
      bonus = 0,
      deductions = 0,
      status = 'pending'
    } = requestData;

    // Calculate net pay
    const netPay = baseSalary + bonus - deductions;
    console.log('Calculated net pay:', netPay);

    console.log('Inserting payroll record with data:', {
      employeeId,
      payPeriodStart,
      payPeriodEnd,
      baseSalary,
      bonus,
      deductions,
      netPay,
      status
    });

    const result = await dbRun(`
      INSERT INTO payroll (employee_id, pay_period_start, pay_period_end, base_salary, bonus, deductions, net_pay, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [employeeId, payPeriodStart, payPeriodEnd, baseSalary, bonus, deductions, netPay, status]) as any;

    console.log('Insert result:', result);

    // FIXED: Get the new payroll record with employee details
    console.log('=== GETTING NEW PAYROLL RECORD ===');
    console.log('Looking for payroll record with ID:', result.lastID);
    
    const newPayroll = await dbGet(`
      SELECT p.*, e.first_name, e.last_name, e.department, e.employee_id
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.id = ?
    `, [result.lastID]);

    console.log('New payroll record retrieved:', newPayroll);
    
    if (!newPayroll) {
      console.log('❌ Failed to retrieve new payroll record');
      // Let's try a direct query to see if the record exists
      console.log('=== DIRECT PAYROLL CHECK ===');
      const directCheck = await dbGet(`SELECT * FROM payroll WHERE id = ?`, [result.lastID]);
      console.log('Direct payroll check result:', directCheck);
    }
    
    return NextResponse.json(newPayroll);
  } catch (error: any) {
    console.error('Create payroll error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}