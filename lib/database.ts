// lib/database.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';   // ← ajusta si lo llamas distinto

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* --------------------------- helpers genéricos --------------------------- */

export async function dbAll<T = unknown>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const q = sql.toLowerCase().trim();

  /* 1) Empleados + rol ---------------------------------------------------- */
  if (q.includes('select e.*, u.role') && q.includes('from employees')) {
    const { data, error } = await supabase
      .from('employees')
      .select('*, users(role)')
      .eq('company_id', params[0] as string)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map(e => ({
      ...e,
      role: (e as any).users?.role ?? null
    })) as T[];
  }

  /* 2) Asistencia de todos los empleados --------------------------------- */
  if (q.includes('select a.*, e.first_name')) {
    const { data: employees } = await supabase
      .from('employees')
      .select('id, first_name, last_name, department')
      .eq('company_id', params[0] as string);

    if (!employees?.length) return [];

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .in('employee_id', employees.map(e => e.id))
      .eq('date', params[1] as string)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map(a => {
      const emp = employees.find(e => e.id === a.employee_id);
      return {
        ...a,
        first_name : emp?.first_name ?? '',
        last_name  : emp?.last_name  ?? '',
        department : emp?.department ?? ''
      };
    }) as T[];
  }

  /* 3) Asistencia de un empleado ----------------------------------------- */
  if (q.includes('select * from attendance where employee_id = ?')) {
    let query = supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', params[0] as string);

    if (params[1]) query = query.eq('date', params[1] as string);

    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;
    return (data ?? []) as T[];
  }

  /* 4) Solicitudes de vacaciones ----------------------------------------- */
  if (q.includes('select lr.*, e.first_name')) {
    if (q.includes('where e.company_id = ?')) {
      const { data: employees } = await supabase
        .from('employees')
        .select('id, first_name, last_name, department')
        .eq('company_id', params[0] as string);

      if (!employees?.length) return [];

      const { data, error } = await supabase
        .from('leave_requests')
        .select('*, approver:employees!approved_by(first_name,last_name)')
        .in('employee_id', employees.map(e => e.id))
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data ?? []).map(lr => {
        const emp = employees.find(e => e.id === lr.employee_id);
        return {
          ...lr,
          first_name          : emp?.first_name ?? '',
          last_name           : emp?.last_name  ?? '',
          department          : emp?.department ?? '',
          approver_first_name : (lr as any).approver?.first_name,
          approver_last_name  : (lr as any).approver?.last_name
        };
      }) as T[];
    }

    if (q.includes('where lr.employee_id = ?')) {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*, approver:employees!approved_by(first_name,last_name)')
        .eq('employee_id', params[0] as string)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data ?? []).map(lr => ({
        ...lr,
        approver_first_name : (lr as any).approver?.first_name,
        approver_last_name  : (lr as any).approver?.last_name
      })) as T[];
    }
  }

  /* 5) Conteo por departamento ------------------------------------------- */
  if (q.includes('select department, count(*) as count from employees')) {
    const { data, error } = await supabase
      .from('employees')
      .select('department')
      .eq('company_id', params[0] as string)
      .eq('status', 'active');

    if (error) throw error;

    const counts: Record<string, number> = {};
    for (const e of data ?? []) {
      counts[e.department] = (counts[e.department] ?? 0) + 1;
    }
    return Object.entries(counts).map(([department, count]) => ({ department, count })) as T[];
  }

  /* 6) Tendencias de asistencia (últimos 7 días) ------------------------- */
  if (q.includes('select a.date') && q.includes('attendance trends')) {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const sinceStr = since.toISOString().slice(0, 10);

    const { data: employees } = await supabase
      .from('employees')
      .select('id')
      .eq('company_id', params[0] as string);

    if (!employees?.length) return [];

    const { data, error } = await supabase
      .from('attendance')
      .select('date, status')
      .in('employee_id', employees.map(e => e.id))
      .gte('date', sinceStr);

    if (error) throw error;

    const trends: Record<
      string,
      { date: string; present: number; absent: number; late: number }
    > = {};

    for (const a of data ?? []) {
      if (!trends[a.date])
        trends[a.date] = { date: a.date, present: 0, absent: 0, late: 0 };

      if (a.status === 'present') trends[a.date].present++;
      else if (a.status === 'absent') trends[a.date].absent++;
      else if (a.status === 'late') trends[a.date].late++;
    }
    return Object.values(trends).sort((a, b) => a.date.localeCompare(b.date)) as T[];
  }

  return [];
}

/* ------------------------- atajos de conveniencia ------------------------- */

export async function dbGet<T = unknown>(
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await dbAll<T>(sql, params);
  return rows[0] ?? null;
}

export async function dbRun(
  sql: string,
  params: unknown[] = []
): Promise<void> {
  await dbAll(sql, params); // mantenemos compatibilidad con los _route.ts_
}
