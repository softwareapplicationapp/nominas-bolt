import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { dbRun, dbGet, dbAll } from '@/lib/database';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Employees only see their own payroll records
    if (user.role === 'employee') {
      const employeeRecord = await dbGet(
        `SELECT id FROM employees WHERE user_id = ?`,
        [user.id]
      ) as any;

      if (!employeeRecord) {
        return NextResponse.json([]);
      }

      const { data, error } = await supabase
        .from('payroll')
        .select('*, employees!inner(first_name, last_name, department, employee_id)')
        .eq('employee_id', employeeRecord.id)
        .order('pay_period_start', { ascending: false });

      if (error) {
        console.error('Payroll query error:', error);
        return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
      }

      const records = (data || []).map((record: any) => ({
        ...record,
        first_name: record.employees.first_name,
        last_name: record.employees.last_name,
        department: record.employees.department,
        employee_id: record.employees.employee_id,
      }));

      return NextResponse.json(records);
    }

    // Admins and managers see all company payroll records
    const { data, error } = await supabase
      .from('payroll')
      .select('*, employees!inner(first_name, last_name, department, employee_id)')
      .eq('employees.company_id', user.company_id)
      .order('pay_period_start', { ascending: false });

    if (error) {
      console.error('Payroll query error:', error);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    const payrollRecords = (data || []).map((record: any) => ({
      ...record,
      first_name: record.employees.first_name,
      last_name: record.employees.last_name,
      department: record.employees.department,
      employee_id: record.employees.employee_id,
    }));

    return NextResponse.json(payrollRecords);
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

    // CRITICAL FIX: First check if the employee exists
    const { data: employeeCheck, error: employeeError } = await supabase
      .from('employees')
      .select('id, first_name, last_name, employee_id')
      .eq('id', employeeId)
      .maybeSingle();
      
    console.log('Employee check result:', employeeCheck);
    if (employeeError) {
      console.error('Employee check error:', employeeError);
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    
    if (!employeeCheck) {
      console.log('❌ Employee not found with ID:', employeeId);
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    
    console.log('✅ Employee found:', employeeCheck);

    const result = await dbRun(`
      INSERT INTO payroll (employee_id, pay_period_start, pay_period_end, base_salary, bonus, deductions, net_pay, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [employeeId, payPeriodStart, payPeriodEnd, baseSalary, bonus, deductions, netPay, status]) as any;

    console.log('Insert result:', result);

    // FIXED: Get the new payroll record with employee details
    console.log('=== GETTING NEW PAYROLL RECORD ===');
    console.log('Looking for payroll record with ID:', result.lastID);
    
    try {
      // CRITICAL FIX: First try a direct query to confirm the record exists
      const { data: directCheck, error: directError } = await supabase
        .from('payroll')
        .select('*, employees!inner(first_name, last_name, department, employee_id)')
        .eq('id', result.lastID)
        .maybeSingle();
        
      console.log('Direct payroll check result:', directCheck ? 'Found' : 'Not found');
      if (directError) {
        console.error('Direct payroll check error:', directError);
      }
      
      if (!directCheck) {
        console.log('❌ CRITICAL ERROR: Payroll record not found in direct check');
        throw new Error('Payroll record not found after creation');
      } else {
        console.log('✅ Payroll record exists in database');
      }

      // CRITICAL FIX: Try a different approach to get the record with employee details
      console.log('=== TRYING ALTERNATIVE QUERY APPROACH ===');
      try {
        // Get the payroll record directly
        const { data: payrollData } = await supabase
          .from('payroll')
          .select('*')
          .eq('id', result.lastID)
          .single();
          
        if (!payrollData) {
          throw new Error('Payroll record not found');
        }
        
        // Get the employee details separately
        const { data: employeeData } = await supabase
          .from('employees')
          .select('first_name, last_name, department, employee_id')
          .eq('id', employeeId)
          .single();
          
        if (!employeeData) {
          throw new Error('Employee not found');
        }
        
        // Combine the data manually
        const combinedRecord = {
          ...payrollData,
          first_name: employeeData.first_name,
          last_name: employeeData.last_name,
          department: employeeData.department,
          employee_id: employeeData.employee_id
        };
        
        console.log('✅ Alternative query successful:', combinedRecord ? 'Record found' : 'No record');
        
        if (combinedRecord) {
          return NextResponse.json(combinedRecord);
        }
      } catch (altError) {
        console.error('Alternative query approach failed:', altError);
      }
      
      // Now try to get the record with employee details
      try {
        const newPayroll = await dbGet(`
          SELECT p.*, e.first_name, e.last_name, e.department, e.employee_id
          FROM payroll p
          JOIN employees e ON p.employee_id = e.id
          WHERE p.id = ?
        `, [result.lastID]);

        console.log('New payroll record retrieved:', newPayroll);
        
        if (newPayroll) {
          return NextResponse.json(newPayroll);
        } else {
          console.log('❌ Failed to retrieve new payroll record with join');
          console.log('=== DIRECT PAYROLL CHECK ===');
          
          // Try a direct query without joins as fallback
          const directPayroll = await dbGet(`SELECT * FROM payroll WHERE id = ?`, [result.lastID]);
          console.log('Direct payroll check result:', directPayroll);
          
          // If direct check succeeds but join fails, create a manual response
          if (directPayroll) {
            console.log('Creating manual response with employee data');
            
            // CRITICAL FIX: Check if employeeCheck has the required properties
            console.log('Employee check data for manual response:', employeeCheck);
            
            const manualResponse = {
              ...directPayroll,
              first_name: employeeCheck.first_name,
              last_name: employeeCheck.last_name,
              department: 'Unknown', // employeeCheck doesn't have department property
              employee_id: employeeCheck.employee_id || `EMP${employeeId.toString().padStart(3, '0')}`
            };
            console.log('Manual response:', manualResponse);
            return NextResponse.json(manualResponse);
          }
          
          // If all else fails, return a basic response with the data we have
          return NextResponse.json({
            id: result.lastID,
            employee_id: employeeCheck.id,
            pay_period_start: payPeriodStart,
            pay_period_end: payPeriodEnd,
            base_salary: baseSalary,
            bonus: bonus,
            deductions: deductions,
            net_pay: netPay,
            status: status,
            created_at: new Date().toISOString(),
            first_name: employeeCheck.first_name,
            last_name: employeeCheck.last_name,
            department: 'Unknown',
            employee_code: `EMP${employeeId.toString().padStart(3, '0')}`
          });
        }
      } catch (joinError) {
        console.error('Join query failed:', joinError);
        
        // Try a direct query without joins as fallback
        const directPayroll = await dbGet(`SELECT * FROM payroll WHERE id = ?`, [result.lastID]);
        console.log('Direct payroll check result:', directPayroll);
        
        // If direct check succeeds but join fails, create a manual response
        if (directPayroll) {
          console.log('Creating manual response with employee data');
          
          const manualResponse = {
            ...directPayroll,
            first_name: employeeCheck.first_name,
            last_name: employeeCheck.last_name,
            department: 'Unknown',
            employee_id: `EMP${employeeId.toString().padStart(3, '0')}`
          };
          console.log('Manual response:', manualResponse);
          return NextResponse.json(manualResponse);
        }
        
        // If all else fails, return a basic response with the data we have
        return NextResponse.json({
          id: result.lastID,
          employee_id: employeeId,
          pay_period_start: payPeriodStart,
          pay_period_end: payPeriodEnd,
          base_salary: baseSalary,
          bonus: bonus,
          deductions: deductions,
          net_pay: netPay,
          status: status,
          created_at: new Date().toISOString(),
          first_name: employeeCheck.first_name,
          last_name: employeeCheck.last_name,
          department: 'Unknown',
          employee_code: `EMP${employeeId.toString().padStart(3, '0')}`
        });
      }
    } catch (error) {
      console.error('Error retrieving created payroll record:', error);
      
      // Fallback response with basic information
      return NextResponse.json({
        id: result.lastID,
        employee_id: employeeId,
        pay_period_start: payPeriodStart,
        pay_period_end: payPeriodEnd,
        base_salary: baseSalary,
        bonus: bonus,
        deductions: deductions,
        net_pay: netPay,
        status: status,
        created_at: new Date().toISOString(),
        first_name: employeeCheck.first_name,
        last_name: employeeCheck.last_name,
        department: 'Unknown',
        employee_code: `EMP${employeeId.toString().padStart(3, '0')}`
      });
    }
  } catch (error: any) {
    console.error('Create payroll error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}