// Pure JavaScript in-memory database - No SQLite dependencies
import bcrypt from 'bcryptjs';

interface Company {
  id: number;
  name: string;
  industry: string;
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  email: string;
  password_hash: string;
  role: string;
  company_id: number;
  created_at: string;
  updated_at: string;
}

interface Employee {
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

interface Attendance {
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

interface LeaveRequest {
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

interface Payroll {
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

// In-memory database storage - GLOBAL SINGLETON
let globalDatabase = {
  companies: [] as Company[],
  users: [] as User[],
  employees: [] as Employee[],
  attendance: [] as Attendance[],
  leave_requests: [] as LeaveRequest[],
  payroll: [] as Payroll[],
  _counters: {
    companies: 0,
    users: 0,
    employees: 0,
    attendance: 0,
    leave_requests: 0,
    payroll: 0
  }
};

let isGloballyInitialized = false;

function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

function getNextId(table: keyof typeof globalDatabase._counters): number {
  return ++globalDatabase._counters[table];
}

function initializeDatabase() {
  if (isGloballyInitialized) {
    console.log('Database already initialized globally, using existing data...');
    console.log('Current database state:');
    console.log('- Companies:', globalDatabase.companies.length);
    console.log('- Users:', globalDatabase.users.length);
    console.log('- Employees:', globalDatabase.employees.length);
    console.log('- Attendance records:', globalDatabase.attendance.length);
    console.log('- Leave requests:', globalDatabase.leave_requests.length);
    return;
  }
  
  console.log('Initializing database for the first time...');
  
  // Reset database
  globalDatabase = {
    companies: [],
    users: [],
    employees: [],
    attendance: [],
    leave_requests: [],
    payroll: [],
    _counters: {
      companies: 0,
      users: 0,
      employees: 0,
      attendance: 0,
      leave_requests: 0,
      payroll: 0
    }
  };

  seedDatabase();
  isGloballyInitialized = true;
  console.log('JSON Database initialized successfully');
  console.log('Final database state:');
  console.log('- Companies:', globalDatabase.companies.length);
  console.log('- Users:', globalDatabase.users.length);
  console.log('- Employees:', globalDatabase.employees.length);
  console.log('- Attendance records:', globalDatabase.attendance.length);
  console.log('- Leave requests:', globalDatabase.leave_requests.length);
}

function seedDatabase() {
  try {
    const now = getCurrentTimestamp();
    console.log('Starting database seeding...');
    
    // Create demo company
    const company: Company = {
      id: getNextId('companies'),
      name: 'Demo Company',
      industry: 'Technology',
      created_at: now,
      updated_at: now
    };
    globalDatabase.companies.push(company);
    console.log('Created company:', company.name, 'with ID:', company.id);

    // Create demo admin user
    const adminPasswordHash = bcrypt.hashSync('admin123', 12);
    const adminUser: User = {
      id: getNextId('users'),
      email: 'admin@demo.com',
      password_hash: adminPasswordHash,
      role: 'admin',
      company_id: company.id,
      created_at: now,
      updated_at: now
    };
    globalDatabase.users.push(adminUser);
    console.log('Created admin user:', adminUser.email, 'with ID:', adminUser.id);

    // Create demo employee user
    const empPasswordHash = bcrypt.hashSync('employee123', 12);
    const empUser: User = {
      id: getNextId('users'),
      email: 'employee@demo.com',
      password_hash: empPasswordHash,
      role: 'employee',
      company_id: company.id,
      created_at: now,
      updated_at: now
    };
    globalDatabase.users.push(empUser);
    console.log('Created employee user:', empUser.email, 'with ID:', empUser.id);

    // Create admin employee record
    const adminEmployee: Employee = {
      id: getNextId('employees'),
      user_id: adminUser.id,
      employee_id: 'EMP001',
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@demo.com',
      department: 'Administration',
      position: 'Administrator',
      start_date: '2024-01-01',
      status: 'active',
      company_id: company.id,
      created_at: now,
      updated_at: now
    };
    globalDatabase.employees.push(adminEmployee);
    console.log('Created admin employee:', adminEmployee.first_name, adminEmployee.last_name);

    // Create demo employee record
    const employee: Employee = {
      id: getNextId('employees'),
      user_id: empUser.id,
      employee_id: 'EMP002',
      first_name: 'John',
      last_name: 'Doe',
      email: 'employee@demo.com',
      department: 'Engineering',
      position: 'Software Developer',
      start_date: '2024-01-15',
      status: 'active',
      salary: 75000,
      company_id: company.id,
      created_at: now,
      updated_at: now
    };
    globalDatabase.employees.push(employee);
    console.log('Created employee:', employee.first_name, employee.last_name);

    // Add more demo employees
    const employees = [
      ['EMP003', 'Sarah', 'Wilson', 'sarah@demo.com', 'Engineering', 'Senior Developer', '2023-06-01', 95000],
      ['EMP004', 'Emily', 'Chen', 'emily@demo.com', 'Design', 'UI/UX Designer', '2023-08-15', 80000],
      ['EMP005', 'Michael', 'Brown', 'michael@demo.com', 'Marketing', 'Marketing Manager', '2023-09-01', 85000],
    ];

    employees.forEach(([empId, firstName, lastName, email, dept, position, startDate, salary]) => {
      // Create user account
      const user: User = {
        id: getNextId('users'),
        email: email as string,
        password_hash: empPasswordHash,
        role: 'employee',
        company_id: company.id,
        created_at: now,
        updated_at: now
      };
      globalDatabase.users.push(user);
      console.log('Created user for:', firstName, lastName);

      // Create employee record
      const emp: Employee = {
        id: getNextId('employees'),
        user_id: user.id,
        employee_id: empId as string,
        first_name: firstName as string,
        last_name: lastName as string,
        email: email as string,
        department: dept as string,
        position: position as string,
        start_date: startDate as string,
        status: 'active',
        salary: salary as number,
        company_id: company.id,
        created_at: now,
        updated_at: now
      };
      globalDatabase.employees.push(emp);
      console.log('Created employee:', firstName, lastName, 'in', dept);
    });

    // Add some demo attendance records
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Today's attendance
    globalDatabase.attendance.push({
      id: getNextId('attendance'),
      employee_id: 2,
      date: today,
      check_in: '09:00',
      check_out: '17:30',
      total_hours: 8.5,
      status: 'present',
      created_at: now
    });

    globalDatabase.attendance.push({
      id: getNextId('attendance'),
      employee_id: 3,
      date: today,
      check_in: '08:45',
      check_out: '17:15',
      total_hours: 8.5,
      status: 'present',
      created_at: now
    });

    globalDatabase.attendance.push({
      id: getNextId('attendance'),
      employee_id: 4,
      date: today,
      check_in: '09:15',
      check_out: '17:45',
      total_hours: 8.5,
      status: 'late',
      created_at: now
    });

    // Yesterday's attendance
    globalDatabase.attendance.push({
      id: getNextId('attendance'),
      employee_id: 2,
      date: yesterday,
      check_in: '09:00',
      check_out: '17:00',
      total_hours: 8.0,
      status: 'present',
      created_at: now
    });

    globalDatabase.attendance.push({
      id: getNextId('attendance'),
      employee_id: 3,
      date: yesterday,
      check_in: '08:30',
      check_out: '17:30',
      total_hours: 9.0,
      status: 'present',
      created_at: now
    });

    globalDatabase.attendance.push({
      id: getNextId('attendance'),
      employee_id: 4,
      date: yesterday,
      check_in: '09:00',
      total_hours: 0,
      status: 'absent',
      created_at: now
    });

    // Add some leave requests
    globalDatabase.leave_requests.push({
      id: getNextId('leave_requests'),
      employee_id: 2,
      type: 'vacation',
      start_date: '2024-07-01',
      end_date: '2024-07-05',
      days: 5,
      reason: 'Summer vacation',
      status: 'pending',
      created_at: now
    });

    globalDatabase.leave_requests.push({
      id: getNextId('leave_requests'),
      employee_id: 3,
      type: 'sick',
      start_date: '2024-06-20',
      end_date: '2024-06-21',
      days: 2,
      reason: 'Flu symptoms',
      status: 'approved',
      approved_by: 1,
      approved_at: now,
      created_at: now
    });

    console.log('Demo database seeded successfully');
    console.log('Total employees created:', globalDatabase.employees.length);
    console.log('Employees:', globalDatabase.employees.map(e => `${e.first_name} ${e.last_name} (${e.department}) - Company: ${e.company_id}`));
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Database operation functions
export const dbRun = (sql: string, params: any[] = []) => {
  initializeDatabase();
  
  // Parse SQL and execute operations
  const sqlLower = sql.toLowerCase().trim();
  
  if (sqlLower.startsWith('insert into companies')) {
    const company: Company = {
      id: getNextId('companies'),
      name: params[0],
      industry: params[1],
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp()
    };
    globalDatabase.companies.push(company);
    return { lastID: company.id, changes: 1 };
  }
  
  if (sqlLower.startsWith('insert into users')) {
    const user: User = {
      id: getNextId('users'),
      email: params[0],
      password_hash: params[1],
      role: params[2],
      company_id: params[3],
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp()
    };
    globalDatabase.users.push(user);
    return { lastID: user.id, changes: 1 };
  }
  
  if (sqlLower.startsWith('insert into employees')) {
    const employee: Employee = {
      id: getNextId('employees'),
      user_id: params[0] || undefined,
      employee_id: params[1],
      first_name: params[2],
      last_name: params[3],
      email: params[4],
      phone: params[5] || undefined,
      department: params[6],
      position: params[7],
      start_date: params[8],
      salary: params[9] || undefined,
      location: params[10] || undefined,
      company_id: params[11],
      status: params[12] || 'active',
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp()
    };
    globalDatabase.employees.push(employee);
    return { lastID: employee.id, changes: 1 };
  }
  
  if (sqlLower.startsWith('insert or replace into attendance') || sqlLower.startsWith('insert into attendance')) {
    const existingIndex = globalDatabase.attendance.findIndex(a => 
      a.employee_id === params[0] && a.date === params[1]
    );
    
    const attendance: Attendance = {
      id: existingIndex >= 0 ? globalDatabase.attendance[existingIndex].id : getNextId('attendance'),
      employee_id: params[0],
      date: params[1],
      check_in: params[2] || undefined,
      check_out: params[3] || undefined,
      total_hours: params[4] || 0,
      status: params[5] || 'present',
      notes: params[6] || undefined,
      created_at: existingIndex >= 0 ? globalDatabase.attendance[existingIndex].created_at : getCurrentTimestamp()
    };
    
    if (existingIndex >= 0) {
      globalDatabase.attendance[existingIndex] = attendance;
    } else {
      globalDatabase.attendance.push(attendance);
    }
    
    return { lastID: attendance.id, changes: 1 };
  }
  
  if (sqlLower.startsWith('insert into leave_requests')) {
    const leaveRequest: LeaveRequest = {
      id: getNextId('leave_requests'),
      employee_id: params[0],
      type: params[1],
      start_date: params[2],
      end_date: params[3],
      days: params[4],
      reason: params[5],
      status: 'pending',
      created_at: getCurrentTimestamp()
    };
    globalDatabase.leave_requests.push(leaveRequest);
    return { lastID: leaveRequest.id, changes: 1 };
  }
  
  if (sqlLower.includes('update employees')) {
    if (sqlLower.includes('where id = ?')) {
      const employeeId = params[params.length - 2];
      const companyId = params[params.length - 1];
      const employee = globalDatabase.employees.find(e => e.id === employeeId && e.company_id === companyId);
      
      if (employee) {
        if (sqlLower.includes('first_name = ?')) {
          employee.first_name = params[0];
          employee.last_name = params[1];
          employee.email = params[2];
          employee.phone = params[3];
          employee.department = params[4];
          employee.position = params[5];
          employee.start_date = params[6];
          employee.salary = params[7];
          employee.location = params[8];
        } else if (sqlLower.includes('status = ?')) {
          employee.status = params[0];
        }
        employee.updated_at = getCurrentTimestamp();
        return { lastID: employee.id, changes: 1 };
      }
    } else if (sqlLower.includes('where user_id = ?')) {
      const userId = params[params.length - 1];
      const employee = globalDatabase.employees.find(e => e.user_id === userId);
      
      if (employee) {
        employee.first_name = params[0];
        employee.last_name = params[1];
        employee.phone = params[2];
        employee.location = params[3];
        employee.updated_at = getCurrentTimestamp();
        return { lastID: employee.id, changes: 1 };
      }
    }
  }
  
  if (sqlLower.includes('update attendance')) {
    if (sqlLower.includes('check_in = ?')) {
      const attendanceId = params[params.length - 1];
      const attendance = globalDatabase.attendance.find(a => a.id === attendanceId);
      if (attendance) {
        attendance.check_in = params[0];
        attendance.status = params[1];
        return { lastID: attendance.id, changes: 1 };
      }
    } else if (sqlLower.includes('check_out = ?')) {
      const attendanceId = params[params.length - 1];
      const attendance = globalDatabase.attendance.find(a => a.id === attendanceId);
      if (attendance) {
        attendance.check_out = params[0];
        attendance.total_hours = params[1];
        return { lastID: attendance.id, changes: 1 };
      }
    }
  }
  
  if (sqlLower.includes('update leave_requests')) {
    const leaveId = params[params.length - 1];
    const leave = globalDatabase.leave_requests.find(l => l.id === leaveId);
    if (leave) {
      leave.status = params[0];
      leave.approved_by = params[1];
      leave.approved_at = getCurrentTimestamp();
      return { lastID: leave.id, changes: 1 };
    }
  }
  
  return { lastID: 0, changes: 0 };
};

export const dbGet = (sql: string, params: any[] = []) => {
  initializeDatabase();
  
  const sqlLower = sql.toLowerCase().trim();
  
  if (sqlLower.includes('select * from users where email = ?')) {
    return globalDatabase.users.find(u => u.email === params[0]);
  }
  
  if (sqlLower.includes('select * from users where id = ?')) {
    return globalDatabase.users.find(u => u.id === params[0]);
  }
  
  if (sqlLower.includes('select id from users where email = ?')) {
    const user = globalDatabase.users.find(u => u.email === params[0]);
    return user ? { id: user.id } : null;
  }
  
  if (sqlLower.includes('select * from employees where id = ?')) {
    return globalDatabase.employees.find(e => e.id === params[0]);
  }
  
  if (sqlLower.includes('select e.*, u.role from employees e join users u on e.user_id = u.id where e.user_id = ?')) {
    const employee = globalDatabase.employees.find(e => e.user_id === params[0]);
    if (employee) {
      const user = globalDatabase.users.find(u => u.id === employee.user_id);
      return { ...employee, role: user?.role };
    }
    return null;
  }
  
  if (sqlLower.includes('select id from employees where user_id = ?')) {
    const employee = globalDatabase.employees.find(e => e.user_id === params[0]);
    return employee ? { id: employee.id } : null;
  }
  
  if (sqlLower.includes('select employee_id from employees where company_id = ? order by id desc limit 1')) {
    const employees = globalDatabase.employees
      .filter(e => e.company_id === params[0])
      .sort((a, b) => b.id - a.id);
    return employees[0] ? { employee_id: employees[0].employee_id } : null;
  }
  
  if (sqlLower.includes('select * from attendance where employee_id = ? and date = ?')) {
    return globalDatabase.attendance.find(a => a.employee_id === params[0] && a.date === params[1]);
  }
  
  if (sqlLower.includes('count(*) as count from employees where company_id = ? and status = \'active\'')) {
    const count = globalDatabase.employees.filter(e => e.company_id === params[0] && e.status === 'active').length;
    return { count };
  }
  
  if (sqlLower.includes('count(*) as count from attendance')) {
    if (sqlLower.includes('status = \'present\'')) {
      const count = globalDatabase.attendance.filter(a => {
        const employee = globalDatabase.employees.find(e => e.id === a.employee_id);
        return employee?.company_id === params[0] && a.date === params[1] && a.status === 'present';
      }).length;
      return { count };
    }
  }
  
  if (sqlLower.includes('count(*) as count from leave_requests')) {
    const count = globalDatabase.leave_requests.filter(lr => {
      const employee = globalDatabase.employees.find(e => e.id === lr.employee_id);
      return employee?.company_id === params[0] && lr.status === 'pending';
    }).length;
    return { count };
  }
  
  if (sqlLower.includes('coalesce(sum(net_pay), 0) as total from payroll')) {
    return { total: 0 }; // No payroll data yet
  }
  
  if (sqlLower.includes('coalesce(sum(total_hours), 0) as total from attendance where employee_id = ?')) {
    const total = globalDatabase.attendance
      .filter(a => a.employee_id === params[0] && a.date >= params[1])
      .reduce((sum, a) => sum + a.total_hours, 0);
    return { total };
  }
  
  // Employee stats queries
  if (sqlLower.includes('count(case when status = \'pending\' then 1 end) as pending_leaves')) {
    const leaveStats = globalDatabase.leave_requests
      .filter(lr => lr.employee_id === params[0])
      .reduce((acc, lr) => {
        if (lr.status === 'pending') acc.pending_leaves++;
        if (lr.status === 'approved') {
          acc.approved_leaves++;
          acc.used_leave_days += lr.days;
        }
        return acc;
      }, { pending_leaves: 0, approved_leaves: 0, used_leave_days: 0 });
    
    return leaveStats;
  }
  
  if (sqlLower.includes('count(*) as total_days') && sqlLower.includes('count(case when status = \'present\' then 1 end) as present_days')) {
    const monthlyAttendance = globalDatabase.attendance
      .filter(a => a.employee_id === params[0])
      .reduce((acc, a) => {
        acc.total_days++;
        if (a.status === 'present') acc.present_days++;
        return acc;
      }, { total_days: 0, present_days: 0 });
    
    return [monthlyAttendance];
  }
  
  return null;
};

export const dbAll = (sql: string, params: any[] = []) => {
  initializeDatabase();

  const sqlLower = sql.toLowerCase().trim();

  console.log('=== dbAll Query Debug ===');
  console.log('SQL:', sql);
  console.log('Params:', params);
  console.log('Database state:');
  console.log('- Total employees in DB:', globalDatabase.employees.length);
  console.log('- Total users in DB:', globalDatabase.users.length);
  console.log('- Total companies in DB:', globalDatabase.companies.length);

  if (params.length > 0) {
    console.log('- Filtering by company_id:', params[0]);
    console.log('- Employees in this company:', globalDatabase.employees.filter(e => e.company_id === params[0]).length);
  }

  // === EMPLOYEES PAGE QUERY ===
  if (
    sqlLower.includes(
      'select e.*, u.role from employees e left join users u on e.user_id = u.id where e.company_id = ?'
    )
  ) {
    console.log('*** EMPLOYEES PAGE QUERY ***');
    console.log('Fetching employees for company:', params[0]);
    console.log('Available employees:', globalDatabase.employees.length);

    const filteredEmployees = globalDatabase.employees.filter(e => {
      console.log(
        `Checking employee ${e.first_name} ${e.last_name}: company_id ${e.company_id} === ${params[0]}?`,
        e.company_id === params[0]
      );
      return e.company_id === params[0];
    });

    // Nuevo log explícito
    console.log('>>> filteredEmployees length:', filteredEmployees.length);

    console.log(
      'Filtered employees:',
      filteredEmployees.map(
        e => `${e.first_name} ${e.last_name} (ID: ${e.id}, Company: ${e.company_id})`
      )
    );

    // Se mantiene el mapeo/ordenamiento para depurar, pero ya no se devuelve
    const result = filteredEmployees
      .map(e => {
        const user = globalDatabase.users.find(u => u.id === e.user_id);
        console.log(
          `Mapping employee ${e.first_name} ${e.last_name} (user_id: ${e.user_id}) -> user found:`,
          !!user,
          'role:',
          user?.role || 'no user found'
        );
        return { ...e, role: user?.role || null };
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    console.log('Final result count:', result.length);
    console.log(
      'Final result:',
      result.map(
        e => `${e.first_name} ${e.last_name} (${e.department}) - Role: ${e.role}`
      )
    );
    console.log('=== End Query Debug ===');

    // Cambio temporal: devolvemos directamente filteredEmployees
    return filteredEmployees;
  }

  if (
    sqlLower.includes(
      'select a.*, e.first_name, e.last_name, e.department from attendance a join employees e on a.employee_id = e.id'
    )
  ) {
    let attendanceRecords = globalDatabase.attendance
      .map(a => {
        const employee = globalDatabase.employees.find(e => e.id === a.employee_id);
        if (employee && employee.company_id === params[0]) {
          if (params[1] && a.date !== params[1]) return null;
          return {
            ...a,
            first_name: employee.first_name,
            last_name: employee.last_name,
            department: employee.department
          };
        }
        return null;
      })
      .filter(Boolean);

    return attendanceRecords.sort(
      (a, b) =>
        new Date(b!.created_at).getTime() - new Date(a!.created_at).getTime()
    );
  }

  if (sqlLower.includes('select * from attendance where employee_id = ?')) {
    let records = globalDatabase.attendance.filter(a => a.employee_id === params[0]);
    if (params[1]) {
      records = records.filter(a => a.date === params[1]);
    }
    return records.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  if (sqlLower.includes('select lr.*, e.first_name, e.last_name, e.department')) {
    if (sqlLower.includes('where e.company_id = ?')) {
      // Admin view - all company leaves
      return globalDatabase.leave_requests
        .map(lr => {
          const employee = globalDatabase.employees.find(e => e.id === lr.employee_id);
          if (employee && employee.company_id === params[0]) {
            const approver = lr.approved_by
              ? globalDatabase.employees.find(e => e.id === lr.approved_by)
              : null;
            return {
              ...lr,
              first_name: employee.first_name,
              last_name: employee.last_name,
              department: employee.department,
              approver_first_name: approver?.first_name,
              approver_last_name: approver?.last_name
            };
          }
          return null;
        })
        .filter(Boolean)
        .sort(
          (a, b) =>
            new Date(b!.created_at).getTime() -
            new Date(a!.created_at).getTime()
        );
    } else if (sqlLower.includes('where lr.employee_id = ?')) {
      // Employee view - their own leaves
      return globalDatabase.leave_requests
        .filter(lr => lr.employee_id === params[0])
        .map(lr => {
          const approver = lr.approved_by
            ? globalDatabase.employees.find(e => e.id === lr.approved_by)
            : null;
          return {
            ...lr,
            approver_first_name: approver?.first_name,
            approver_last_name: approver?.last_name
          };
        })
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
    }
  }

  if (sqlLower.includes('select department, count(*) as count from employees')) {
    const departments = globalDatabase.employees
      .filter(e => e.company_id === params[0] && e.status === 'active')
      .reduce((acc, e) => {
        acc[e.department] = (acc[e.department] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(departments).map(([department, count]) => ({
      department,
      count
    }));
  }

  if (sqlLower.includes('select a.date')) {
    // Attendance trends query
    const trends = globalDatabase.attendance
      .filter(a => {
        const employee = globalDatabase.employees.find(e => e.id === a.employee_id);
        return employee?.company_id === params[0];
      })
      .reduce((acc, a) => {
        if (!acc[a.date]) {
          acc[a.date] = { date: a.date, present: 0, absent: 0, late: 0 };
        }
        if (a.status === 'present') acc[a.date].present++;
        else if (a.status === 'absent') acc[a.date].absent++;
        else if (a.status === 'late') acc[a.date].late++;
        return acc;
      }, {} as Record<string, any>);

    return Object.values(trends).sort(
      (a: any, b: any) => a.date.localeCompare(b.date)
    );
  }

  return [];
};

export const dbExec = (sql: string) => {
  initializeDatabase();
  // For schema creation, we don't need to do anything as our structure is already defined
  return true;
};