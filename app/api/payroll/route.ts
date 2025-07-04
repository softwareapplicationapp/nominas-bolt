import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { dbRun, dbGet, dbAll } from '@/lib/database';
import { supabase } from '@/lib/supabaseClient';

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
    
    // CRITICAL FIX: First check if there are any employees for this company
    const { data: employeeCheck, error: employeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('company_id', user.company_id);
      
    console.log('Employee check result:', employeeCheck?.length || 0, 'employees found');
    if (employeeError) {
      console.error('Employee check error:', employeeError);
    }
    
    if (!employeeCheck || employeeCheck.length === 0) {
      console.log('No employees found for company:', user.company_id);
      return NextResponse.json([]);
    }
    
    // CRITICAL FIX: Direct Supabase query to check payroll records
    const employeeIds = employeeCheck.map(e => e.id);
    console.log('Employee IDs for payroll query:', employeeIds);
    
    const { data: directPayrollCheck, error: directPayrollError } = await supabase
      .from('payroll')
      .select('*')
      .in('employee_id', employeeIds)
      .limit(5);
      
    console.log('Direct payroll check result:', directPayrollCheck?.length || 0, 'records found');
    if (directPayrollCheck && directPayrollCheck.length > 0) {
      console.log('Sample payroll record:', directPayrollCheck[0]);
    }
    if (directPayrollError) {
      console.error('Direct payroll check error:', directPayrollError);
    }
    
    // Now use our database abstraction to get the full records with employee details
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
        
        // Direct Supabase query to check all payroll records
        const { data: allPayroll, error: allPayrollError } = await supabase
          .from('payroll')
          .select('*');
          
        console.log('All payroll records in database:', allPayroll?.length || 0);
        if (allPayroll && allPayroll.length > 0) {
          console.log('First few payroll records:', allPayroll.slice(0, 3));
          
          // Check which employee IDs have payroll records
          const payrollEmployeeIds = allPayroll.map(p => p.employee_id);
          console.log('Employee IDs in payroll records:', payrollEmployeeIds);
          
          // Check for matches
          const matchingIds = employeeIds.filter(id => payrollEmployeeIds.includes(id));
          console.log('Matching employee IDs:', matchingIds);
          
          if (matchingIds.length > 0) {
            // There should be records but we're not getting them
            console.log('❌ CRITICAL ERROR: There are matching payroll records but query is not returning them');
          }
        }
        if (allPayrollError) {
          console.error('All payroll query error:', allPayrollError);
        }
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

    // CRITICAL FIX: First check if the employee exists
    const { data: employeeCheck, error: employeeError } = await supabase
      .from('employees')
      .select('id, first_name, last_name')
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
            employee_code: `EMP${employeeId.toString().padStart(3, '0')}`
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