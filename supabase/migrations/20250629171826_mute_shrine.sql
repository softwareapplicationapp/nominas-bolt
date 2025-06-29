/*
  # Initial ArcusHR Database Schema

  1. New Tables
    - `companies` - Company information
    - `users` - User authentication and roles
    - `employees` - Employee profiles and details
    - `attendance` - Daily attendance records
    - `leave_requests` - Leave request management
    - `payroll` - Payroll and salary information

  2. Security
    - Enable RLS on all tables
    - Add policies for company-based data isolation
    - Ensure users can only access their company's data

  3. Indexes
    - Add performance indexes for common queries
    - Foreign key constraints for data integrity
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT NOT NULL DEFAULT 'Technology',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'hr_manager', 'employee')),
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  employee_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  start_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
  salary DECIMAL(10,2),
  location TEXT,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, company_id)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  total_hours DECIMAL(4,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- Leave requests table
CREATE TABLE IF NOT EXISTS leave_requests (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('vacation', 'sick', 'personal', 'emergency', 'maternity', 'paternity')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by INTEGER REFERENCES employees(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payroll table
CREATE TABLE IF NOT EXISTS payroll (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  base_salary DECIMAL(10,2) NOT NULL,
  bonus DECIMAL(10,2) DEFAULT 0,
  deductions DECIMAL(10,2) DEFAULT 0,
  net_pay DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'paid')),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_payroll_employee_id ON payroll(employee_id);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Users can read their own company" ON companies
  FOR SELECT USING (
    id IN (
      SELECT company_id FROM users WHERE id = auth.uid()::integer
    )
  );

-- RLS Policies for users
CREATE POLICY "Users can read users in their company" ON users
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()::integer
    )
  );

CREATE POLICY "Users can update their own record" ON users
  FOR UPDATE USING (id = auth.uid()::integer);

-- RLS Policies for employees
CREATE POLICY "Users can read employees in their company" ON employees
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()::integer
    )
  );

CREATE POLICY "Admins can insert employees" ON employees
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM users 
      WHERE id = auth.uid()::integer 
      AND role IN ('admin', 'hr_manager')
    )
  );

CREATE POLICY "Admins can update employees" ON employees
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE id = auth.uid()::integer 
      AND role IN ('admin', 'hr_manager')
    )
  );

CREATE POLICY "Employees can update their own record" ON employees
  FOR UPDATE USING (
    user_id = auth.uid()::integer
  );

-- RLS Policies for attendance
CREATE POLICY "Users can read attendance in their company" ON attendance
  FOR SELECT USING (
    employee_id IN (
      SELECT e.id FROM employees e
      JOIN users u ON e.company_id = u.company_id
      WHERE u.id = auth.uid()::integer
    )
  );

CREATE POLICY "Admins can manage attendance" ON attendance
  FOR ALL USING (
    employee_id IN (
      SELECT e.id FROM employees e
      JOIN users u ON e.company_id = u.company_id
      WHERE u.id = auth.uid()::integer 
      AND u.role IN ('admin', 'hr_manager')
    )
  );

CREATE POLICY "Employees can manage their own attendance" ON attendance
  FOR ALL USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()::integer
    )
  );

-- RLS Policies for leave_requests
CREATE POLICY "Users can read leave requests in their company" ON leave_requests
  FOR SELECT USING (
    employee_id IN (
      SELECT e.id FROM employees e
      JOIN users u ON e.company_id = u.company_id
      WHERE u.id = auth.uid()::integer
    )
  );

CREATE POLICY "Employees can create their own leave requests" ON leave_requests
  FOR INSERT WITH CHECK (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()::integer
    )
  );

CREATE POLICY "Admins can manage leave requests" ON leave_requests
  FOR ALL USING (
    employee_id IN (
      SELECT e.id FROM employees e
      JOIN users u ON e.company_id = u.company_id
      WHERE u.id = auth.uid()::integer 
      AND u.role IN ('admin', 'hr_manager')
    )
  );

-- RLS Policies for payroll
CREATE POLICY "Users can read payroll in their company" ON payroll
  FOR SELECT USING (
    employee_id IN (
      SELECT e.id FROM employees e
      JOIN users u ON e.company_id = u.company_id
      WHERE u.id = auth.uid()::integer
    )
  );

CREATE POLICY "Admins can manage payroll" ON payroll
  FOR ALL USING (
    employee_id IN (
      SELECT e.id FROM employees e
      JOIN users u ON e.company_id = u.company_id
      WHERE u.id = auth.uid()::integer 
      AND u.role IN ('admin', 'hr_manager')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();