import { supabase } from './supabaseClient';

export interface Company {
  id: number;
  name: string;
  industry: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  password_hash: string;
  role: string;
  company_id: number;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: number;
  user_id?: number;
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
    const { data, error } = await supabase
      .from('employees')
      .insert({
        user_id: params[0] || null,
        employee_id: params[1],
        first_name: params[2],
        last_name: params[3],
        email: params[4],
        phone: params[5] || null,
        department: params[6],
        position: params[7],
        start_date: params[8],
        salary: params[9] || null,
        location: params[10] || null,
        company_id: params[11],
        status: params[12] || 'active',
      })
      .select('id')
      .single();
    if (error) throw error;
    return { lastID: data!.id, changes: 1 };
  }

  if (q.startsWith('insert or replace into attendance') || q.startsWith('insert into attendance')) {
    const { data, error } = await supabase
      .from('attendance')
      .upsert({
        employee_id: params[0],
        date: params[1],
        check_in: params[2] || null,
        check_out: params[3] || null,
        total_hours: params[4] || 0,
        status: params[5] || 'present',
        notes: params[6] || null,
      }, { onConflict: 'employee_id,date' })
      .select('id')
      .single();
    if (error) throw error;
    return { lastID: data!.id, changes: 1 };
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

  if (q.includes('update employees')) {
    if (q.includes('where id = ?')) {
      const { error } = await supabase
        .from('employees')
        .update({
          first_name: params[0],
          last_name: params[1],
          email: params[2],
          phone: params[3],
          department: params[4],
          position: params[5],
          start_date: params[6],
          salary: params[7],
          location: params[8],
          updated_at: new Date().toISOString(),
        })
        .eq('id', params[9])
        .eq('company_id', params[10]);
      if (error) throw error;
      return { lastID: params[9], changes: 1 };
    } else if (q.includes('where user_id = ?')) {
      const { error } = await supabase
        .from('employees')
        .update({
          first_name: params[0],
          last_name: params[1],
          phone: params[2],
          location: params[3],
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', params[4]);
      if (error) throw error;
      return { lastID: params[4], changes: 1 };
    } else if (q.includes('status =')) {
      const { error } = await supabase
        .from('employees')
        .update({ status: params[0], updated_at: new Date().toISOString() })
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

  return { lastID: 0, changes: 0 };
};

export const dbGet = async (sql: string, params: any[] = []) => {
  const q = sql.toLowerCase().trim();

  if (q.includes('select * from users where email = ?')) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('email', params[0])
      .maybeSingle();
    return data || null;
  }

  if (q.includes('select * from users where id = ?')) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', params[0])
      .maybeSingle();
    return data || null;
  }

  if (q.includes('select id from users where email = ?')) {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('email', params[0])
      .maybeSingle();
    return data || null;
  }

  if (q.includes('select * from employees where id = ?')) {
    const { data } = await supabase
      .from('employees')
      .select('*')
      .eq('id', params[0])
      .maybeSingle();
    return data || null;
  }

  if (q.includes('select e.*, u.role from employees e join users u on e.user_id = u.id where e.user_id = ?')) {
    const { data, error } = await supabase
      .from('employees')
      .select('*, users!inner(role)')
      .eq('user_id', params[0])
      .maybeSingle();
    if (error) throw error;
    return data ? { ...data, role: (data as any).users.role } : null;
  }

  if (q.includes('select id from employees where user_id = ?')) {
    const { data } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', params[0])
      .maybeSingle();
    return data || null;
  }

  if (q.includes('select employee_id from employees where company_id = ?')) {
    const { data, error } = await supabase
      .from('employees')
      .select('employee_id')
      .eq('company_id', params[0])
      .order('id', { ascending: false })
      .limit(1)
      .single();
    if (error) return null;
    return data;
  }

  if (q.includes('select * from attendance where employee_id = ? and date = ?')) {
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', params[0])
      .eq('date', params[1])
      .maybeSingle();
    return data || null;
  }

  if (q.includes('count(*) as count from employees')) {
    const { count } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', params[0])
      .eq('status', 'active');
    return { count: count || 0 };
  }

  if (q.includes('count(*) as count from attendance')) {
    const { count } = await supabase
      .from('attendance')
      .select('id', { count: 'exact', head: true })
      .eq('date', params[1])
      .eq('status', 'present')
      .in('employee_id', supabase
        .from('employees')
        .select('id')
        .eq('company_id', params[0]));
    return { count: count || 0 };
  }

  if (q.includes('count(*) as count from leave_requests')) {
    const { count } = await supabase
      .from('leave_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .in('employee_id', supabase
        .from('employees')
        .select('id')
        .eq('company_id', params[0]));
    return { count: count || 0 };
  }

  if (q.includes('coalesce(sum(net_pay), 0) as total from payroll')) {
    const { data, error } = await supabase
      .from('payroll')
      .select('net_pay, employees!inner(company_id)')
      .eq('employees.company_id', params[0])
      .like('pay_period_start', `${params[1]}%`);
    if (error) throw error;
    const total = (data as any[]).reduce((sum, p) => sum + (p as any).net_pay, 0);
    return { total };
  }

  if (q.includes('coalesce(sum(total_hours), 0) as total from attendance')) {
    const { data, error } = await supabase
      .from('attendance')
      .select('total_hours')
      .eq('employee_id', params[0])
      .gte('date', params[1]);
    if (error) throw error;
    const total = (data as any[]).reduce((sum, a) => sum + (a as any).total_hours, 0);
    return { total };
  }

  if (q.includes('count(case when status = \'pending\' then 1 end) as pending_leaves')) {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('status, days')
      .eq('employee_id', params[0]);
    if (error) throw error;
    const stats = (data as any[]).reduce((acc, lr) => {
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
    const stats = (data as any[]).reduce(
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
};

export const dbAll = async (sql: string, params: any[] = []) => {
  const q = sql.toLowerCase().trim();

  if (q.includes('select e.*, u.role') && q.includes('from employees')) {
    const { data, error } = await supabase
      .from('employees')
      .select('*, users(role)')
      .eq('company_id', params[0])
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as any[]).map(e => ({ ...e, role: (e as any).users?.role || null }));
  }

  if (q.includes('select a.*, e.first_name')) {
    const { data, error } = await supabase
      .from('attendance')
      .select('*, employees!inner(first_name,last_name,department,company_id)')
      .eq('employees.company_id', params[0])
      .eq('date', params[1])
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as any[]).map(a => ({
      ...a,
      first_name: (a as any).employees.first_name,
      last_name: (a as any).employees.last_name,
      department: (a as any).employees.department,
    }));
  }

  if (q.includes('select * from attendance where employee_id = ?')) {
    let query = supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', params[0]);
    if (params[1]) query = query.eq('date', params[1]);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data as any[];
  }

  if (q.includes('select lr.*, e.first_name')) {
    if (q.includes('where e.company_id = ?')) {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*, employees!inner(first_name,last_name,department,company_id), approver:employees!approved_by(first_name,last_name)')
        .eq('employees.company_id', params[0])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as any[]).map(lr => ({
        ...lr,
        first_name: (lr as any).employees.first_name,
        last_name: (lr as any).employees.last_name,
        department: (lr as any).employees.department,
        approver_first_name: (lr as any).approver?.first_name,
        approver_last_name: (lr as any).approver?.last_name,
      }));
    } else if (q.includes('where lr.employee_id = ?')) {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*, approver:employees!approved_by(first_name,last_name)')
        .eq('employee_id', params[0])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as any[]).map(lr => ({
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
    (data as any[]).forEach(e => {
      counts[e.department] = (counts[e.department] || 0) + 1;
    });
    return Object.entries(counts).map(([department, count]) => ({ department, count }));
  }

  if (q.includes('select a.date') && q.includes('attendance trends')) {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const sinceStr = since.toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('attendance')
      .select('date,status, employees!inner(company_id)')
      .eq('employees.company_id', params[0])
      .gte('date', sinceStr);
    if (error) throw error;
    const trends: Record<string, any> = {};
    (data as any[]).forEach(a => {
      if (!trends[a.date]) trends[a.date] = { date: a.date, present: 0, absent: 0, late: 0 };
      if (a.status === 'present') trends[a.date].present++;
      else if (a.status === 'absent') trends[a.date].absent++;
      else if (a.status === 'late') trends[a.date].late++;
    });
    return Object.values(trends).sort((a: any, b: any) => a.date.localeCompare(b.date));
  }

  return [];
};

export const dbExec = async (_sql: string) => true;
