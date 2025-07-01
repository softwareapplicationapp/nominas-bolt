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
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .in('employee_id', employeeIds)
        .eq('date', params[1])
        .order('created_at', { ascending: false });
      
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

    // FIXED: Employee attendance query - this is the key fix for My Attendance page
    if (q.includes('select * from attendance where employee_id = ?')) {
      console.log('=== EMPLOYEE ATTENDANCE QUERY (dbAll) ===');
      console.log('Employee ID:', params[0]);
      console.log('Date filter:', params[1] || 'No date filter');
      
      let query = supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', params[0]);
      
      // Apply date filter if provided
      if (params[1]) {
        query = query.eq('date', params[1]);
        console.log('Filtering by date:', params[1]);
      }
      
      const { data, error } = await query.order('date', { ascending: false });
      
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