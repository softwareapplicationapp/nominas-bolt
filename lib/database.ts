import { supabase } from './supabaseClient';

export interface Company {
  id: number;
  name: string;
  industry: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string; // Changed from number to string for UUID
  email: string;
  password_hash: string;
  role: string;
  company_id: number;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: number;
  user_id?: string; // Changed from number to string for UUID
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  start_date: string;
  status: string;
  salary?: number;
  location?: string;
  company_id: number;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: number;
  employee_id: number;
  date: string;
  check_in?: string;
  check_out?: string;
  total_hours: number;
  status: string;
  notes?: string;
  created_at: string;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: string;
  approved_by?: number;
  approved_at?: string;
  admin_comments?: string; // NEW: Admin comments field
  created_at: string;
}

export interface Payroll {
  id: number;
  employee_id: number;
  pay_period_start: string;
  pay_period_end: string;
  base_salary: number;
  bonus: number;
  deductions: number;
  net_pay: number;
  status: string;
  processed_at?: string;
  created_at: string;
}

export const dbRun = async (sql: string, params: any[] = []) => {
  const q = sql.toLowerCase().trim();

  try {
    if (q.startsWith('insert into companies')) {
      const { data, error } = await supabase
        .from('companies')
        .insert({ name: params[0], industry: params[1] })
        .select('id')
        .single();
      if (error) throw error;
      return { lastID: data!.id, changes: 1 };
    }

    if (q.startsWith('insert into users')) {
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: params[0],
          password_hash: params[1],
          role: params[2],
          company_id: params[3],
        })
        .select('id')
        .single();
      if (error) throw error;
      return { lastID: data!.id, changes: 1 };
    }

    if (q.startsWith('insert into employees')) {
      // The SQL query from auth/register/route.ts:
      // INSERT INTO employees (user_id, employee_id, first_name, last_name, email, department, position, company_id, status)
      // VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      // Parameters: [user.id, 'EMP001', 'Admin', 'User', email, 'Administration', 'Administrator', companyId, 'active']
      
      const employeeData: any = {
        user_id: params[0],
        employee_id: params[1],
        first_name: params[2],
        last_name: params[3],
        email: params[4],
        department: params[5],
        position: params[6],
        company_id: params[7],
        status: params[8] || 'active',
      };

      // For the more complex employee creation from employees API
      if (params.length > 9) {
        // This is from the employees API with more fields
        // INSERT INTO employees (user_id, employee_id, first_name, last_name, email, phone, department, position, start_date, salary, location, company_id)
        employeeData.phone = params[5];
        employeeData.department = params[6];
        employeeData.position = params[7];
        employeeData.start_date = params[8];
        employeeData.salary = params[9];
        employeeData.location = params[10];
        employeeData.company_id = params[11];
        employeeData.status = params[12] || 'active';
      } else {
        // Simple employee creation from registration
        // Set default values for missing fields
        employeeData.start_date = new Date().toISOString().split('T')[0];
      }

      const { data, error } = await supabase
        .from('employees')
        .insert(employeeData)
        .select('id')
        .single();
      if (error) throw error;
      return { lastID: data!.id, changes: 1 };
    }

    // UPDATED: Handle both INSERT and INSERT INTO for attendance
    if (q.includes('insert') && q.includes('attendance')) {
      const attendanceData: any = {
        employee_id: params[0],
        date: params[1],
        status: 'present', // Default status
      };

      // Check if this is a simple check-in (3 params) or full record (6+ params)
      if (params.length === 3) {
        // Simple check-in: INSERT INTO attendance (employee_id, date, check_in, status)
        attendanceData.check_in = params[2];
      } else {
        // Full record: INSERT OR REPLACE INTO attendance (employee_id, date, check_in, check_out, total_hours, status, notes)
        if (params[2]) attendanceData.check_in = params[2];
        if (params[3]) attendanceData.check_out = params[3];
        attendanceData.total_hours = params[4] || 0;
        attendanceData.status = params[5] || 'present';
        if (params[6]) attendanceData.notes = params[6];
      }

      // For simple INSERT, just insert. For INSERT OR REPLACE, use upsert
      if (q.includes('or replace')) {
        const { data, error } = await supabase
          .from('attendance')
          .upsert(attendanceData, { onConflict: 'employee_id,date' })
          .select('id')
          .single();
        if (error) throw error;
        return { lastID: data!.id, changes: 1 };
      } else {
        const { data, error } = await supabase
          .from('attendance')
          .insert(attendanceData)
          .select('id')
          .single();
        if (error) throw error;
        return { lastID: data!.id, changes: 1 };
      }
    }

    if (q.startsWith('insert into leave_requests')) {
      const { data, error } = await supabase
        .from('leave_requests')
        .insert({
          employee_id: params[0],
          type: params[1],
          start_date: params[2],
          end_date: params[3],
          days: params[4],
          reason: params[5],
          status: 'pending',
        })
        .select('id')
        .single();
      if (error) throw error;
      return { lastID: data!.id, changes: 1 };
    }

    // FIXED: Handle payroll insertions with better logging
    if (q.startsWith('insert into payroll')) {
      console.log('=== INSERTING PAYROLL RECORD ===');
      console.log('Parameters:', params);
      
      // Create the payroll data object
      const payrollData = {
        employee_id: params[0],
        pay_period_start: params[1],
        pay_period_end: params[2],
        base_salary: params[3],
        bonus: params[4],
        deductions: params[5],
        net_pay: params[6],
        status: params[7],
        processed_at: params[7] === 'processed' ? new Date().toISOString() : null
      };
      
      console.log('Payroll data to insert:', payrollData);
      
      const { data, error } = await supabase
        .from('payroll')
        .insert(payrollData)
        .select('id')
        .single();
      
      if (error) {
        console.error('Payroll insert error:', error);
        throw error;
      }
      
      console.log('Payroll record created with ID:', data!.id);
      return { lastID: data!.id, changes: 1 };
    }

    // Handle UPDATE queries
    if (q.includes('update employees')) {
      if (q.includes('where id = ?') && q.includes('company_id = ?')) {
        const updateData: any = {
          first_name: params[0],
          last_name: params[1],
          email: params[2],
          department: params[4],
          position: params[5],
          start_date: params[6],
          updated_at: new Date().toISOString(),
        };

        if (params[3]) updateData.phone = params[3];
        if (params[7]) updateData.salary = params[7];
        if (params[8]) updateData.location = params[8];

        const { error } = await supabase
          .from('employees')
          .update(updateData)
          .eq('id', params[9])
          .eq('company_id', params[10]);
        if (error) throw error;
        return { lastID: params[9], changes: 1 };
      } else if (q.includes('where user_id = ?')) {
        const updateData: any = {
          first_name: params[0],
          last_name: params[1],
          updated_at: new Date().toISOString(),
        };

        if (params[2]) updateData.phone = params[2];
        if (params[3]) updateData.location = params[3];

        const { error } = await supabase
          .from('employees')
          .update(updateData)
          .eq('user_id', params[4]);
        if (error) throw error;
        return { lastID: params[4], changes: 1 };
      } else if (q.includes('status =')) {
        const { error } = await supabase
          .from('employees')
          .update({ 
            status: params[0], 
            updated_at: new Date().toISOString() 
          })
          .eq('id', params[1])
          .eq('company_id', params[2]);
        if (error) throw error;
        return { lastID: params[1], changes: 1 };
      }
    }

    if (q.includes('update attendance')) {
      if (q.includes('check_in = ?, check_out = ?, total_hours = ?, status = ?, notes = ?')) {
        // Handle the new update query for editing attendance records
        console.log('=== UPDATING ATTENDANCE RECORD ===');
        console.log('Parameters received:', params);
        console.log('check_in:', params[0]);
        console.log('check_out:', params[1]);
        console.log('total_hours:', params[2]);
        console.log('status:', params[3]);
        console.log('notes:', params[4]);
        console.log('id:', params[5]);

        // Validate status before updating
        const validStatuses = ['present', 'absent', 'late', 'half_day'];
        const status = params[3];
        
        if (!validStatuses.includes(status)) {
          console.error('Invalid status value:', status);
          throw new Error(`Invalid status value: ${status}. Must be one of: ${validStatuses.join(', ')}`);
        }

        const { error } = await supabase
          .from('attendance')
          .update({
            check_in: params[0],
            check_out: params[1],
            total_hours: params[2],
            status: params[3],
            notes: params[4]
          })
          .eq('id', params[5]);
        
        if (error) {
          console.error('Supabase update error:', error);
          throw error;
        }
        
        console.log('✅ Attendance record updated successfully');
        return { lastID: params[5], changes: 1 };
      } else if (q.includes('check_in = ?')) {
        const { error } = await supabase
          .from('attendance')
          .update({ check_in: params[0], status: params[1] })
          .eq('id', params[2]);
        if (error) throw error;
        return { lastID: params[2], changes: 1 };
      } else if (q.includes('check_out = ?')) {
        const { error } = await supabase
          .from('attendance')
          .update({ check_out: params[0], total_hours: params[1] })
          .eq('id', params[2]);
        if (error) throw error;
        return { lastID: params[2], changes: 1 };
      }
    }

    // FIXED: Handle leave request updates with correct parameter order
    if (q.includes('update leave_requests')) {
      console.log('=== UPDATING LEAVE REQUEST ===');
      console.log('SQL Query:', q);
      console.log('Parameters:', params);
      
      // The SQL query should be:
      // UPDATE leave_requests SET status = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP, admin_comments = ? WHERE id = ?
      // Parameters should be: [status, approved_by, admin_comments, leave_id]
      
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: params[0],                    // status (approved/rejected)
          approved_by: params[1],               // approved_by (employee ID or null)
          approved_at: new Date().toISOString(), // approved_at (current timestamp)
          admin_comments: params[2] || null,    // admin_comments (can be null)
        })
        .eq('id', params[3]);                   // WHERE id = leave_id
      
      if (error) {
        console.error('Supabase leave update error:', error);
        throw error;
      }
      
      console.log('✅ Leave request updated successfully');
      return { lastID: params[3], changes: 1 };
    }

    // FIXED: Handle payroll updates with better logging
    if (q.includes('update payroll')) {
      console.log('=== UPDATING PAYROLL RECORD ===');
      console.log('SQL Query:', q);
      console.log('Parameters:', params);
      
      const updateData: any = {};
      
      // Check if this is a status update (for processing payroll)
      if (q.includes('status = ?') && q.includes('processed_at')) {
        updateData.status = params[0];
        if (params[1]) {
          updateData.processed_at = params[1];
        } else if (params[0] === 'processed') {
          // If status is processed but no processed_at date provided, set it to now
          updateData.processed_at = new Date().toISOString();
        }
        
        console.log('Updating payroll status to:', updateData.status);
        console.log('Setting processed_at to:', updateData.processed_at);
        
        const { data, error } = await supabase
          .from('payroll')
          .update(updateData)
          .eq('id', params[2])
          .select()
          .single();
        
        if (error) {
          console.error('Payroll update error:', error);
          throw error;
        }
        
        console.log('Payroll record updated successfully:', data);
        return { lastID: params[2], changes: 1 };
      } else {
        // Full payroll update
        const { error } = await supabase
          .from('payroll')
          .update({
            pay_period_start: params[0],
            pay_period_end: params[1],
            base_salary: params[2],
            bonus: params[3],
            deductions: params[4],
            net_pay: params[5],
            status: params[6],
            processed_at: params[7] ? new Date().toISOString() : null,
          })
          .eq('id', params[8]);
        if (error) throw error;
        return { lastID: params[8], changes: 1 };
      }
    }

    // Handle DELETE queries
    if (q.includes('delete from attendance where id = ?')) {
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', params[0]);
      if (error) throw error;
      return { lastID: params[0], changes: 1 };
    }

    // NEW: Handle payroll deletions
    if (q.includes('delete from payroll where id = ?')) {
      const { error } = await supabase
        .from('payroll')
        .delete()
        .eq('id', params[0]);
      if (error) throw error;
      return { lastID: params[0], changes: 1 };
    }

    return { lastID: 0, changes: 0 };
  } catch (error) {
    console.error('Database operation error:', error);
    throw error;
  }
};

export const dbGet = async (sql: string, params: any[] = []) => {
  const q = sql.toLowerCase().trim();

  try {
    if (q.includes('select * from users where email = ?')) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('email', params[0])
        .maybeSingle();
      return data;
    }

    if (q.includes('select * from users where id = ?')) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', params[0])
        .maybeSingle();
      return data;
    }

    if (q.includes('select id from users where email = ?')) {
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('email', params[0])
        .maybeSingle();
      return data;
    }

    if (q.includes('select * from employees where id = ?')) {
      const { data } = await supabase
        .from('employees')
        .select('*')
        .eq('id', params[0])
        .maybeSingle();
      return data;
    }

    // CRITICAL FIX: This is the main query that's failing
    if (q.includes('select e.*, u.role from employees e join users u on e.user_id = u.id where e.user_id = ?')) {
      console.log('=== DETAILED EMPLOYEE PROFILE QUERY DEBUG ===');
      console.log('SQL Query:', q);
      console.log('Looking for user_id:', params[0]);
      console.log('User ID type:', typeof params[0]);
      console.log('User ID length:', params[0]?.length);
      
      // First, let's check if the employee exists at all
      console.log('Step 1: Checking if employee exists...');
      const { data: employeeCheck, error: employeeCheckError } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', params[0]);
      
      console.log('Employee check result:', employeeCheck);
      console.log('Employee check error:', employeeCheckError);
      
      if (employeeCheckError) {
        console.error('Employee check failed:', employeeCheckError);
        throw employeeCheckError;
      }
      
      if (!employeeCheck || employeeCheck.length === 0) {
        console.log('❌ No employee found with user_id:', params[0]);
        
        // Let's check what employees exist in the database
        console.log('Step 2: Checking all employees in database...');
        const { data: allEmployees, error: allEmployeesError } = await supabase
          .from('employees')
          .select('id, user_id, first_name, last_name, email');
        
        console.log('All employees in database:', allEmployees);
        console.log('All employees error:', allEmployeesError);
        
        return null;
      }
      
      console.log('✅ Employee found:', employeeCheck[0]);
      
      // Now get the user role
      console.log('Step 3: Getting user role...');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', params[0])
        .maybeSingle();
      
      console.log('User data result:', userData);
      console.log('User error:', userError);
      
      if (userError) {
        console.error('User query failed:', userError);
        // Don't throw error, just continue without role
      }
      
      // Combine the results
      const result = {
        ...employeeCheck[0],
        role: userData?.role || 'employee'
      };
      
      console.log('✅ Final combined result:', result);
      console.log('=== END DETAILED DEBUG ===');
      
      return result;
    }

    if (q.includes('select id from employees where user_id = ?')) {
      console.log('=== GETTING EMPLOYEE ID FOR USER ===');
      console.log('Looking for user_id:', params[0]);
      
      const { data, error } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', params[0])
        .maybeSingle();
      
      console.log('Employee ID query result:', data);
      console.log('Employee ID query error:', error);
      
      return data;
    }

    if (q.includes('select employee_id from employees where company_id = ?')) {
      const { data, error } = await supabase
        .from('employees')
        .select('employee_id')
        .eq('company_id', params[0])
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
      return data;
    }

    if (q.includes('select * from attendance where employee_id = ? and date = ?')) {
      console.log('=== ATTENDANCE QUERY FOR SPECIFIC DATE ===');
      console.log('Employee ID:', params[0]);
      console.log('Date:', params[1]);
      
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', params[0])
        .eq('date', params[1])
        .maybeSingle();
      
      console.log('Attendance query result:', data);
      console.log('Attendance query error:', error);
      
      return data;
    }

    // NEW: Handle query for most recent open check-in
    if (q.includes('select * from attendance') && q.includes('check_in is not null and check_out is null')) {
      console.log('=== FINDING MOST RECENT OPEN CHECK-IN ===');
      console.log('Employee ID:', params[0]);
      console.log('Date:', params[1]);
      
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', params[0])
        .eq('date', params[1])
        .not('check_in', 'is', null)
        .is('check_out', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      console.log('Open check-in query result:', data);
      console.log('Open check-in query error:', error);
      
      return data;
    }

    // Handle SELECT * FROM attendance WHERE id = ?
    if (q.includes('select * from attendance where id = ?')) {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('id', params[0])
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }

    // Handle attendance record with employee details
    if (q.includes('select a.*, e.first_name, e.last_name, e.department from attendance a join employees e')) {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          employees!inner(first_name, last_name, department)
        `)
        .eq('id', params[0])
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        const employee = (data as any).employees;
        return {
          ...data,
          first_name: employee.first_name,
          last_name: employee.last_name,
          department: employee.department
        };
      }
      
      return data;
    }

    // UPDATED: Handle leave requests query for single employee - now includes admin_comments
    if (q.includes('select lr.*') && q.includes('from leave_requests lr') && q.includes('where lr.id = ?')) {
      console.log('=== SINGLE LEAVE REQUEST QUERY ===');
      console.log('Leave request ID:', params[0]);
      
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*, approver:employees!approved_by(first_name,last_name)')
        .eq('id', params[0])
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        return {
          ...data,
          approver_first_name: (data as any).approver?.first_name,
          approver_last_name: (data as any).approver?.last_name,
        };
      }
      
      return data;
    }

    // FIXED: Handle payroll queries - this was the main issue
    if (q.includes('select p.*, e.') && q.includes('from payroll p join employees e')) {
      console.log('=== PAYROLL QUERY (dbGet) ===');
      console.log('SQL Query:', q);
      console.log('Parameters:', params);
      
      if (q.includes('where p.id = ?')) {
        // Single payroll record with employee details
        console.log('Getting single payroll record with ID:', params[0]);
        
        const { data, error } = await supabase
          .from('payroll')
          .select(`
            *,
            employees!inner(
              id, employee_id, first_name, last_name, email, phone, 
              department, position, start_date, location,
              companies!inner(name)
            )
          `)
          .eq('id', params[0])
          .maybeSingle();
        
        if (error) {
          console.error('Payroll query error:', error);
          throw error;
        }
        
        console.log('Payroll query result:', data);
        
        if (data) {
          const employee = (data as any).employees;
          const company = employee.companies;
          return {
            ...data,
            employee_id: employee.id,
            employee_code: employee.employee_id,
            first_name: employee.first_name,
            last_name: employee.last_name,
            email: employee.email,
            phone: employee.phone,
            department: employee.department,
            position: employee.position,
            start_date: employee.start_date,
            location: employee.location,
            company_name: company.name
          };
        }
        
        return data;
      }
    }

    // FIXED: Handle simple payroll query by ID
    if (q.includes('select p.*, e.first_name, e.last_name, e.department, e.employee_id from payroll p join employees e') && q.includes('where p.id = ?')) {
      console.log('=== SIMPLE PAYROLL QUERY BY ID ===');
      console.log('Payroll ID:', params[0]);
      
      const { data, error } = await supabase
        .from('payroll')
        .select(`
          *,
          employees!inner(first_name, last_name, department, employee_id)
        `)
        .eq('id', params[0])
        .maybeSingle();
      
      if (error) {
        console.error('Simple payroll query error:', error);
        throw error;
      }
      
      console.log('Simple payroll query result:', data);
      
      if (data) {
        const employee = (data as any).employees;
        return {
          ...data,
          first_name: employee.first_name,
          last_name: employee.last_name,
          department: employee.department,
          employee_id: employee.employee_id
        };
      }
      
      return data;
    }

    // ADDED: Direct payroll query without joins
    if (q.includes('select * from payroll where id = ?')) {
      console.log('=== DIRECT PAYROLL QUERY ===');
      console.log('Payroll ID:', params[0]);
      
      const { data, error } = await supabase
        .from('payroll')
        .select('*')
        .eq('id', params[0])
        .maybeSingle();
      
      console.log('Direct payroll query result:', data);
      console.log('Direct payroll query error:', error);
      
      return data;
    }

    // Count queries
    if (q.includes('count(*) as count from employees')) {
      const { count } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', params[0])
        .eq('status', 'active');
      return { count: count || 0 };
    }

    if (q.includes('count(*) as count from attendance')) {
      const { data: employees } = await supabase
        .from('employees')
        .select('id')
        .eq('company_id', params[0]);
      
      if (!employees || employees.length === 0) {
        return { count: 0 };
      }

      const employeeIds = employees.map(e => e.id);
      const { count } = await supabase
        .from('attendance')
        .select('id', { count: 'exact', head: true })
        .eq('date', params[1])
        .eq('status', 'present')
        .in('employee_id', employeeIds);
      return { count: count || 0 };
    }

    if (q.includes('count(*) as count from leave_requests')) {
      const { data: employees } = await supabase
        .from('employees')
        .select('id')
        .eq('company_id', params[0]);
      
      if (!employees || employees.length === 0) {
        return { count: 0 };
      }

      const employeeIds = employees.map(e => e.id);
      const { count } = await supabase
        .from('leave_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')
        .in('employee_id', employeeIds);
      return { count: count || 0 };
    }

    // Payroll sum query - FIXED: Use proper date range calculation
    if (q.includes('coalesce(sum(net_pay), 0) as total from payroll')) {
      const { data: employees } = await supabase
        .from('employees')
        .select('id')
        .eq('company_id', params[0]);
      
      if (!employees || employees.length === 0) {
        return { total: 0 };
      }

      const employeeIds = employees.map(e => e.id);
      
      // Parse the year-month parameter (e.g., "2024-06")
      const yearMonth = params[1];
      const [year, month] = yearMonth.split('-');
      
      // Calculate the correct start and end dates for the month
      const startOfMonth = `${year}-${month.padStart(2, '0')}-01`;
      
      // Calculate the last day of the month properly
      const nextMonth = new Date(parseInt(year), parseInt(month), 1);
      const lastDayOfMonth = new Date(nextMonth.getTime() - 1);
      const endOfMonth = lastDayOfMonth.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('payroll')
        .select('net_pay')
        .in('employee_id', employeeIds)
        .gte('pay_period_start', startOfMonth)
        .lte('pay_period_start', endOfMonth);
      
      if (error) throw error;
      const total = (data || []).reduce((sum, p) => sum + (p.net_pay || 0), 0);
      return { total };
    }

    // CRITICAL FIX: Employee stats queries - Updated to calculate weekly hours correctly
    if (q.includes('coalesce(sum(total_hours), 0) as total from attendance')) {
      console.log('=== EMPLOYEE STATS: Total hours query ===');
      console.log('Employee ID:', params[0]);
      
      if (q.includes('date >= date(\'now\', \'-7 days\')')) {
        // Weekly hours calculation - FIXED to calculate current week (Monday to Sunday)
        console.log('Calculating weekly hours (current week)');
        
        // Get the current date
        const now = new Date();
        
        // Calculate the Monday of the current week
        const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // If Sunday, go back 6 days, otherwise go back (currentDay - 1) days
        
        const monday = new Date(now);
        monday.setDate(now.getDate() - daysFromMonday);
        monday.setHours(0, 0, 0, 0);
        
        const mondayStr = monday.toISOString().split('T')[0];
        
        console.log('Current date:', now.toISOString().split('T')[0]);
        console.log('Current day of week:', currentDay);
        console.log('Days from Monday:', daysFromMonday);
        console.log('Monday of current week:', mondayStr);
        
        // Get all attendance records for this week (from Monday to today)
        const { data, error } = await supabase
          .from('attendance')
          .select('total_hours, date')
          .eq('employee_id', params[0])
          .gte('date', mondayStr);
        
        if (error) {
          console.error('Weekly hours query error:', error);
          throw error;
        }
        
        console.log('Weekly hours records found:', data?.length || 0);
        if (data && data.length > 0) {
          console.log('Records:', data.map(r => ({ date: r.date, hours: r.total_hours })));
        }
        
        const total = (data || []).reduce((sum, a) => sum + (a.total_hours || 0), 0);
        console.log('Weekly hours total calculated:', total);
        return { total };
      } else {
        // Today's hours calculation
        console.log('Calculating today\'s hours');
        
        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('attendance')
          .select('total_hours')
          .eq('employee_id', params[0])
          .eq('date', today);
        
        if (error) {
          console.error('Today\'s hours query error:', error);
          throw error;
        }
        
        const total = (data || []).reduce((sum, a) => sum + (a.total_hours || 0), 0);
        console.log('Today\'s hours result:', { total, records: data?.length || 0, data });
        return { total };
      }
    }

    if (q.includes('count(case when status = \'pending\' then 1 end) as pending_leaves')) {
      console.log('=== EMPLOYEE STATS: Leave statistics query ===');
      console.log('Employee ID:', params[0]);
      
      const { data, error } = await supabase
        .from('leave_requests')
        .select('status, days')
        .eq('employee_id', params[0]);
      
      if (error) {
        console.error('Leave stats query error:', error);
        throw error;
      }
      
      const stats = (data || []).reduce((acc, lr) => {
        if (lr.status === 'pending') acc.pending_leaves++;
        if (lr.status === 'approved') {
          acc.approved_leaves++;
          acc.used_leave_days += lr.days;
        }
        return acc;
      }, { pending_leaves: 0, approved_leaves: 0, used_leave_days: 0 });
      
      console.log('Leave stats result:', stats);
      return stats;
    }

    if (q.includes('count(*) as total_days') && q.includes('present_days')) {
      console.log('=== EMPLOYEE STATS: Monthly attendance query ===');
      console.log('Employee ID:', params[0]);
      console.log('Month filter:', params[1]);
      
      const { data, error } = await supabase
        .from('attendance')
        .select('status')
        .eq('employee_id', params[0])
        .like('date', `${params[1]}%`);
      
      if (error) {
        console.error('Monthly attendance query error:', error);
        throw error;
      }
      
      const stats = (data || []).reduce(
        (acc, a) => {
          acc.total_days++;
          if (a.status === 'present') acc.present_days++;
          return acc;
        },
        { total_days: 0, present_days: 0 }
      );
      
      console.log('Monthly attendance result:', stats);
      return [stats];
    }

    return null;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const dbAll = async (sql: string, params: any[] = []) => {
  const q = sql.toLowerCase().trim();

  try {
    if (q.includes('select e.*, u.role') && q.includes('from employees')) {
      const { data, error } = await supabase
        .from('employees')
        .select('*, users(role)')
        .eq('company_id', params[0])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(e => ({ ...e, role: (e as any).users?.role || null }));
    }

    if (q.includes('select a.*, e.first_name')) {
      const { data: employees } = await supabase
        .from('employees')
        .select('id, first_name, last_name, department')
        .eq('company_id', params[0]);
      
      if (!employees || employees.length === 0) {
        return [];
      }

      const employeeIds = employees.map(e => e.id);
      let query = supabase
        .from('attendance')
        .select('*')
        .in('employee_id', employeeIds);

      // Apply date filter if provided
      if (params[1]) {
        query = query.eq('date', params[1]);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(a => {
        const employee = employees.find(e => e.id === a.employee_id);
        return {
          ...a,
          first_name: employee?.first_name || '',
          last_name: employee?.last_name || '',
          department: employee?.department || '',
        };
      });
    }

    // CRITICAL FIX: This is the main query for My Attendance page
    if (q.includes('select * from attendance') && q.includes('where employee_id = ?')) {
      console.log('=== EMPLOYEE ATTENDANCE QUERY (dbAll) ===');
      console.log('Employee ID:', params[0]);
      console.log('Date filter:', params[1] || 'No date filter');
      console.log('Full SQL query:', q);
      
      let query = supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', params[0]);
      
      // Apply date filter if provided (params[1] would be the date)
      // But in our case, we want ALL records, so we don't filter by date
      // The SQL query is: "SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC, created_at DESC"
      
      const { data, error } = await query.order('date', { ascending: false }).order('created_at', { ascending: false });
      
      console.log('Query result:', data);
      console.log('Query error:', error);
      console.log('Number of records:', data?.length || 0);
      
      if (error) {
        console.error('Attendance query failed:', error);
        throw error;
      }
      
      return data || [];
    }

    // UPDATED: Handle leave requests queries properly - now includes admin_comments
    if (q.includes('select lr.*') && q.includes('from leave_requests lr')) {
      console.log('=== LEAVE REQUESTS QUERY (dbAll) ===');
      console.log('SQL Query:', q);
      console.log('Parameters:', params);
      
      if (q.includes('where e.company_id = ?')) {
        // This is for admin/manager view - get all leaves for company
        console.log('Getting leaves for company:', params[0]);
        
        const { data: employees } = await supabase
          .from('employees')
          .select('id, first_name, last_name, department')
          .eq('company_id', params[0]);
        
        if (!employees || employees.length === 0) {
          return [];
        }

        const employeeIds = employees.map(e => e.id);
        const { data, error } = await supabase
          .from('leave_requests')
          .select('*, approver:employees!approved_by(first_name,last_name)')
          .in('employee_id', employeeIds)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return (data || []).map(lr => {
          const employee = employees.find(e => e.id === lr.employee_id);
          return {
            ...lr,
            first_name: employee?.first_name || '',
            last_name: employee?.last_name || '',
            department: employee?.department || '',
            approver_first_name: (lr as any).approver?.first_name,
            approver_last_name: (lr as any).approver?.last_name,
          };
        });
      } else if (q.includes('where lr.employee_id = ?')) {
        // This is for employee view - get leaves for specific employee
        console.log('Getting leaves for employee:', params[0]);
        
        const { data, error } = await supabase
          .from('leave_requests')
          .select('*, approver:employees!approved_by(first_name,last_name)')
          .eq('employee_id', params[0])
          .order('created_at', { ascending: false });
        
        console.log('Leave requests query result:', data);
        console.log('Leave requests query error:', error);
        console.log('Number of leave requests found:', data?.length || 0);
        
        if (error) {
          console.error('Leave requests query failed:', error);
          throw error;
        }
        
        return (data || []).map(lr => ({
          ...lr,
          approver_first_name: (lr as any).approver?.first_name,
          approver_last_name: (lr as any).approver?.last_name,
        }));
      }
    }

    // FIXED: Handle payroll queries - this was the main issue causing 0 records
    if (q.includes('select p.*, e.first_name') && q.includes('from payroll p join employees e')) {
      console.log('=== PAYROLL QUERY (dbAll) ===');
      console.log('SQL Query:', q);
      console.log('Parameters:', params);
      
      // First get employees for the company
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id, first_name, last_name, department, employee_id')
        .eq('company_id', params[0]);
      
      console.log('Found employees:', employees?.length || 0);
      console.log('Employees error:', employeesError);
      
      if (employeesError) {
        console.error('Employees query failed:', employeesError);
        throw employeesError;
      }
      
      if (!employees || employees.length === 0) {
        console.log('No employees found for company:', params[0]);
        return [];
      }

      const employeeIds = employees.map(e => e.id);
      console.log('Employee IDs for payroll query:', employeeIds);
      
      // CRITICAL FIX: Direct query to check if payroll records exist for these employees
      const { count: payrollCount, error: countError } = await supabase
        .from('payroll')
        .select('*', { count: 'exact', head: true })
        .in('employee_id', employeeIds);
        
      console.log('Total payroll records for these employees:', payrollCount);
      
      if (countError) {
        console.error('Payroll count query failed:', countError);
      }
      
      // Now get payroll records for these employees
      const { data: payrollData, error: payrollError } = await supabase
        .from('payroll')
        .select('*')
        .in('employee_id', employeeIds)
        .order('pay_period_start', { ascending: false });
      
      console.log('Payroll query result count:', payrollData?.length || 0);
      if (payrollData && payrollData.length > 0) {
        console.log('First payroll record:', payrollData[0]);
      }
      console.log('Payroll query error:', payrollError);
      
      if (payrollError) {
        console.error('Payroll query failed:', payrollError);
        throw payrollError;
      }
      
      // CRITICAL FIX: If no records found, try a direct query to see all payroll records
      if (!payrollData || payrollData.length === 0) {
        console.log('=== NO PAYROLL RECORDS FOUND, CHECKING ALL RECORDS ===');
        const { data: allPayroll, error: allPayrollError } = await supabase
          .from('payroll')
          .select('*')
          .limit(10);
          
        console.log('All payroll records (up to 10):', allPayroll);
        console.log('All payroll error:', allPayrollError);
        
        if (allPayroll && allPayroll.length > 0) {
          console.log('There are payroll records in the database, but none for the current company employees');
          console.log('Employee IDs in company:', employeeIds);
          console.log('Employee IDs in payroll records:', allPayroll.map(p => p.employee_id));
          
          // Check if there's a mismatch between employee IDs
          const payrollEmployeeIds = allPayroll.map(p => p.employee_id);
          const matchingIds = employeeIds.filter(id => payrollEmployeeIds.includes(id));
          console.log('Matching employee IDs:', matchingIds);
        }
      }
      
      // Combine payroll data with employee information
      const result = (payrollData || []).map(p => {
        const employee = employees.find(e => e.id === p.employee_id);
        return {
          ...p,
          first_name: employee?.first_name || '',
          last_name: employee?.last_name || '',
          department: employee?.department || '',
          employee_id: employee?.employee_id || '', // This is the employee code like EMP001
        };
      });
      
      console.log('Final payroll result with employee data:', result.length, 'records');
      if (result.length > 0) {
        console.log('Sample result:', result[0]);
      }
      
      return result;
    }

    if (q.includes('select department, count(*) as count from employees')) {
      const { data, error } = await supabase
        .from('employees')
        .select('department')
        .eq('company_id', params[0])
        .eq('status', 'active');
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach(e => {
        counts[e.department] = (counts[e.department] || 0) + 1;
      });
      return Object.entries(counts).map(([department, count]) => ({ department, count }));
    }

    if (q.includes('select a.date') && q.includes('attendance trends')) {
      const since = new Date();
      since.setDate(since.getDate() - 7);
      const sinceStr = since.toISOString().split('T')[0];
      
      const { data: employees } = await supabase
        .from('employees')
        .select('id')
        .eq('company_id', params[0]);
      
      if (!employees || employees.length === 0) {
        return [];
      }

      const employeeIds = employees.map(e => e.id);
      const { data, error } = await supabase
        .from('attendance')
        .select('date, status')
        .in('employee_id', employeeIds)
        .gte('date', sinceStr);
      
      if (error) throw error;
      
      const trends: Record<string, any> = {};
      (data || []).forEach(a => {
        if (!trends[a.date]) trends[a.date] = { date: a.date, present: 0, absent: 0, late: 0 };
        if (a.status === 'present') trends[a.date].present++;
        else if (a.status === 'absent') trends[a.date].absent++;
        else if (a.status === 'late') trends[a.date].late++;
      });
      return Object.values(trends).sort((a: any, b: any) => a.date.localeCompare(b.date));
    }

    return [];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const dbExec = async (_sql: string) => true;