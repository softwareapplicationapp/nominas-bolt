/*
  # Fix RLS Policies for Custom JWT Authentication

  1. Problem
    - Current policies use auth.uid() which is for Supabase Auth
    - Our app uses custom JWT authentication
    - This causes infinite recursion during login/register

  2. Solution
    - Disable RLS for authentication operations
    - Use service role for backend operations
    - Implement security at application level
*/

-- Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Users can read their own company" ON companies;
DROP POLICY IF EXISTS "Users can read users in their company" ON users;
DROP POLICY IF EXISTS "Users can update their own record" ON users;
DROP POLICY IF EXISTS "Users can read employees in their company" ON employees;
DROP POLICY IF EXISTS "Admins can insert employees" ON employees;
DROP POLICY IF EXISTS "Admins can update employees" ON employees;
DROP POLICY IF EXISTS "Employees can update their own record" ON employees;
DROP POLICY IF EXISTS "Users can read attendance in their company" ON attendance;
DROP POLICY IF EXISTS "Admins can manage attendance" ON attendance;
DROP POLICY IF EXISTS "Employees can manage their own attendance" ON attendance;
DROP POLICY IF EXISTS "Users can read leave requests in their company" ON leave_requests;
DROP POLICY IF EXISTS "Employees can create their own leave requests" ON leave_requests;
DROP POLICY IF EXISTS "Admins can manage leave requests" ON leave_requests;
DROP POLICY IF EXISTS "Users can read payroll in their company" ON payroll;
DROP POLICY IF EXISTS "Admins can manage payroll" ON payroll;

-- Disable RLS temporarily for our custom auth system
-- We'll implement security at the application level
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE payroll DISABLE ROW LEVEL SECURITY;

-- Create simple policies that allow service role access
-- This is needed for our backend API operations

-- Allow service role to do everything (our backend will handle authorization)
CREATE POLICY "Service role can do everything" ON companies FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can do everything" ON users FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can do everything" ON employees FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can do everything" ON attendance FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can do everything" ON leave_requests FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can do everything" ON payroll FOR ALL TO service_role USING (true);

-- Re-enable RLS with the new simple policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;