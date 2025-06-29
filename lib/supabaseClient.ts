import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for better TypeScript support
export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: number;
          name: string;
          industry: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          industry: string;
        };
        Update: {
          name?: string;
          industry?: string;
        };
      };
      users: {
        Row: {
          id: number;
          email: string;
          password_hash: string;
          role: string;
          company_id: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          email: string;
          password_hash: string;
          role: string;
          company_id: number;
        };
        Update: {
          email?: string;
          password_hash?: string;
          role?: string;
          company_id?: number;
        };
      };
      employees: {
        Row: {
          id: number;
          user_id: number | null;
          employee_id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          department: string;
          position: string;
          start_date: string;
          status: string;
          salary: number | null;
          location: string | null;
          company_id: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: number | null;
          employee_id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          department: string;
          position: string;
          start_date: string;
          status?: string;
          salary?: number | null;
          location?: string | null;
          company_id: number;
        };
        Update: {
          user_id?: number | null;
          employee_id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          department?: string;
          position?: string;
          start_date?: string;
          status?: string;
          salary?: number | null;
          location?: string | null;
          company_id?: number;
        };
      };
      attendance: {
        Row: {
          id: number;
          employee_id: number;
          date: string;
          check_in: string | null;
          check_out: string | null;
          total_hours: number;
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          employee_id: number;
          date: string;
          check_in?: string | null;
          check_out?: string | null;
          total_hours?: number;
          status?: string;
          notes?: string | null;
        };
        Update: {
          employee_id?: number;
          date?: string;
          check_in?: string | null;
          check_out?: string | null;
          total_hours?: number;
          status?: string;
          notes?: string | null;
        };
      };
      leave_requests: {
        Row: {
          id: number;
          employee_id: number;
          type: string;
          start_date: string;
          end_date: string;
          days: number;
          reason: string;
          status: string;
          approved_by: number | null;
          approved_at: string | null;
          created_at: string;
        };
        Insert: {
          employee_id: number;
          type: string;
          start_date: string;
          end_date: string;
          days: number;
          reason: string;
          status?: string;
          approved_by?: number | null;
          approved_at?: string | null;
        };
        Update: {
          employee_id?: number;
          type?: string;
          start_date?: string;
          end_date?: string;
          days?: number;
          reason?: string;
          status?: string;
          approved_by?: number | null;
          approved_at?: string | null;
        };
      };
      payroll: {
        Row: {
          id: number;
          employee_id: number;
          pay_period_start: string;
          pay_period_end: string;
          base_salary: number;
          bonus: number;
          deductions: number;
          net_pay: number;
          status: string;
          processed_at: string | null;
          created_at: string;
        };
        Insert: {
          employee_id: number;
          pay_period_start: string;
          pay_period_end: string;
          base_salary: number;
          bonus?: number;
          deductions?: number;
          net_pay: number;
          status?: string;
          processed_at?: string | null;
        };
        Update: {
          employee_id?: number;
          pay_period_start?: string;
          pay_period_end?: string;
          base_salary?: number;
          bonus?: number;
          deductions?: number;
          net_pay?: number;
          status?: string;
          processed_at?: string | null;
        };
      };
    };
  };
}