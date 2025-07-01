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
      if (q.includes('check_in = ?')) {
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
      } else if (q.includes('set check_in = ?, check_out = ?, total_hours = ?, status = ?, notes = ?')) {
        // Handle the new update query for editing attendance records
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
        if (error) throw error;
        return { lastID: params[5], changes: 1 };
      }
    }

    if (q.includes('update leave_requests')) {
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: params[0],
          approved_by: params[1],
          approved_at: new Date().toISOString(),
        })
        .eq('id', params[2]);
      if (error) throw error;
      return { lastID: params[2], changes: 1 };
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

    // Employee stats queries
    if (q.includes('coalesce(sum(total_hours), 0) as total from attendance')) {
      const { data, error } = await supabase
        .from('attendance')
        .select('total_hours')
        .eq('employee_id', params[0])
        .gte('date', params[1]);
      if (error) throw error;
      const total = (data || []).reduce((sum, a) => sum + (a.total_hours || 0), 0);
      return { total };
    }

    if (q.includes('count(case when status = \'pending\' then 1 end) as pending_leaves')) {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('status, days')
        .eq('employee_id', params[0]);
      if (error) throw error;
      const stats = (data || []).reduce((acc, lr) => {
        if (lr.status === 'pending') acc.pending_leaves++;
        if (lr.status === 'approved') {
          acc.approved_leaves++;
          acc.used_leave_days += lr.days;
        }
        return acc;
      }, { pending_leaves: 0, approved_leaves: 0, used_leave_days: 0 });
      return stats;
    }

    if (q.includes('count(*) as total_days') && q.includes('present_days')) {
      const { data, error } = await supabase
        .from('attendance')
        .select('status')
        .eq('employee_id', params[0])
        .like('date', `${params[1]}%`);
      if (error) throw error;
      const stats = (data || []).reduce(
        (acc, a) => {
          acc.total_days++;
          if (a.status === 'present') acc.present_days++;
          return acc;
        },
        { total_days: 0, present_days: 0 }
      );
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

    if (q.includes('select lr.*, e.first_name')) {
      if (q.includes('where e.company_id = ?')) {
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
        const { data, error } = await supabase
          .from('leave_requests')
          .select('*, approver:employees!approved_by(first_name,last_name)')
          .eq('employee_id', params[0])
          .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(lr => ({
          ...lr,
          approver_first_name: (lr as any).approver?.first_name,
          approver_last_name: (lr as any).approver?.last_name,
        }));
      }
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