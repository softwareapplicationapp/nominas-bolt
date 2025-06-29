/*
  # Demo Data for ArcusHR

  1. Demo Company
    - Create a demo company with sample data

  2. Demo Users
    - Admin user
    - Employee user

  3. Demo Employees
    - Sample employee records

  4. Demo Data
    - Sample attendance records
    - Sample leave requests
*/

-- Insert demo company
INSERT INTO companies (name, industry) VALUES 
('Demo Corporation', 'Technology')
ON CONFLICT DO NOTHING;

-- Get the company ID (assuming it's the first one)
DO $$
DECLARE
  demo_company_id INTEGER;
  admin_user_id INTEGER;
  employee_user_id INTEGER;
  admin_employee_id INTEGER;
  employee_employee_id INTEGER;
BEGIN
  -- Get or create demo company
  SELECT id INTO demo_company_id FROM companies WHERE name = 'Demo Corporation' LIMIT 1;
  
  -- Insert demo admin user
  INSERT INTO users (email, password_hash, role, company_id) VALUES 
  ('admin@demo.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hMxDGKKxG', 'admin', demo_company_id)
  ON CONFLICT (email) DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    company_id = EXCLUDED.company_id
  RETURNING id INTO admin_user_id;

  -- Insert demo employee user
  INSERT INTO users (email, password_hash, role, company_id) VALUES 
  ('employee@demo.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hMxDGKKxG', 'employee', demo_company_id)
  ON CONFLICT (email) DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    company_id = EXCLUDED.company_id
  RETURNING id INTO employee_user_id;

  -- Insert admin employee record
  INSERT INTO employees (user_id, employee_id, first_name, last_name, email, phone, department, position, start_date, salary, location, company_id, status) VALUES 
  (admin_user_id, 'EMP001', 'Admin', 'User', 'admin@demo.com', '+1 (555) 123-4567', 'Administration', 'Administrator', '2024-01-01', 120000, 'New York, NY', demo_company_id, 'active')
  ON CONFLICT (employee_id, company_id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    department = EXCLUDED.department,
    position = EXCLUDED.position,
    start_date = EXCLUDED.start_date,
    salary = EXCLUDED.salary,
    location = EXCLUDED.location,
    status = EXCLUDED.status
  RETURNING id INTO admin_employee_id;

  -- Insert employee record
  INSERT INTO employees (user_id, employee_id, first_name, last_name, email, phone, department, position, start_date, salary, location, company_id, status) VALUES 
  (employee_user_id, 'EMP002', 'John', 'Doe', 'employee@demo.com', '+1 (555) 987-6543', 'Engineering', 'Software Developer', '2024-01-15', 85000, 'San Francisco, CA', demo_company_id, 'active')
  ON CONFLICT (employee_id, company_id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    department = EXCLUDED.department,
    position = EXCLUDED.position,
    start_date = EXCLUDED.start_date,
    salary = EXCLUDED.salary,
    location = EXCLUDED.location,
    status = EXCLUDED.status
  RETURNING id INTO employee_employee_id;

  -- Insert additional sample employees
  INSERT INTO employees (employee_id, first_name, last_name, email, department, position, start_date, salary, location, company_id, status) VALUES 
  ('EMP003', 'Sarah', 'Wilson', 'sarah.wilson@demo.com', 'Engineering', 'Senior Developer', '2023-06-01', 95000, 'Austin, TX', demo_company_id, 'active'),
  ('EMP004', 'Michael', 'Brown', 'michael.brown@demo.com', 'Marketing', 'Marketing Manager', '2023-08-15', 75000, 'Chicago, IL', demo_company_id, 'active'),
  ('EMP005', 'Emily', 'Chen', 'emily.chen@demo.com', 'Design', 'UX Designer', '2023-09-01', 80000, 'Seattle, WA', demo_company_id, 'active')
  ON CONFLICT (employee_id, company_id) DO NOTHING;

  -- Insert sample attendance records for the last 7 days
  INSERT INTO attendance (employee_id, date, check_in, check_out, total_hours, status) VALUES
  (admin_employee_id, CURRENT_DATE - INTERVAL '6 days', '09:00', '17:30', 8.5, 'present'),
  (admin_employee_id, CURRENT_DATE - INTERVAL '5 days', '09:15', '17:45', 8.5, 'late'),
  (admin_employee_id, CURRENT_DATE - INTERVAL '4 days', '09:00', '17:00', 8.0, 'present'),
  (admin_employee_id, CURRENT_DATE - INTERVAL '3 days', '09:00', '17:30', 8.5, 'present'),
  (admin_employee_id, CURRENT_DATE - INTERVAL '2 days', '09:00', '17:00', 8.0, 'present'),
  (admin_employee_id, CURRENT_DATE - INTERVAL '1 days', '09:30', '17:30', 8.0, 'late'),
  (admin_employee_id, CURRENT_DATE, '09:00', NULL, 0, 'present'),
  
  (employee_employee_id, CURRENT_DATE - INTERVAL '6 days', '09:00', '18:00', 9.0, 'present'),
  (employee_employee_id, CURRENT_DATE - INTERVAL '5 days', '09:00', '17:30', 8.5, 'present'),
  (employee_employee_id, CURRENT_DATE - INTERVAL '4 days', NULL, NULL, 0, 'absent'),
  (employee_employee_id, CURRENT_DATE - INTERVAL '3 days', '09:00', '17:00', 8.0, 'present'),
  (employee_employee_id, CURRENT_DATE - INTERVAL '2 days', '09:00', '17:30', 8.5, 'present'),
  (employee_employee_id, CURRENT_DATE - INTERVAL '1 days', '09:00', '17:00', 8.0, 'present'),
  (employee_employee_id, CURRENT_DATE, '09:15', NULL, 0, 'late')
  ON CONFLICT (employee_id, date) DO NOTHING;

  -- Insert sample leave requests
  INSERT INTO leave_requests (employee_id, type, start_date, end_date, days, reason, status) VALUES
  (employee_employee_id, 'vacation', CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '11 days', 5, 'Family vacation', 'pending'),
  (employee_employee_id, 'sick', CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE - INTERVAL '4 days', 1, 'Flu symptoms', 'approved')
  ON CONFLICT DO NOTHING;

  -- Insert sample payroll records
  INSERT INTO payroll (employee_id, pay_period_start, pay_period_end, base_salary, bonus, deductions, net_pay, status, processed_at) VALUES
  (admin_employee_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'), DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day', 10000, 1000, 2200, 8800, 'processed', CURRENT_DATE - INTERVAL '15 days'),
  (employee_employee_id, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'), DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day', 7083, 500, 1520, 6063, 'processed', CURRENT_DATE - INTERVAL '15 days')
  ON CONFLICT DO NOTHING;

END $$;