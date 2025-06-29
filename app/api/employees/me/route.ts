import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET /api/employees/me called ===');
    
    const user = await getUserFromRequest(request);
    console.log('User from request:', user ? {
      id: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id
    } : 'null');
    
    if (!user) {
      console.log('No user found - unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('=== DIRECT SUPABASE QUERY ===');
    console.log('Looking for user_id:', user.id);
    console.log('User ID type:', typeof user.id);
    
    // Direct Supabase query - bypass our database abstraction layer
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    console.log('Direct Supabase employee query result:', employeeData);
    console.log('Direct Supabase employee query error:', employeeError);
    
    if (employeeError) {
      console.error('Supabase employee query failed:', employeeError);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    if (!employeeData) {
      console.log('❌ No employee found with user_id:', user.id);
      
      // Let's check what employees exist in the database
      console.log('=== CHECKING ALL EMPLOYEES ===');
      const { data: allEmployees, error: allEmployeesError } = await supabase
        .from('employees')
        .select('id, user_id, first_name, last_name, email, company_id');
      
      console.log('All employees in database:', allEmployees);
      console.log('All employees error:', allEmployeesError);
      
      // Let's also check if the user exists in the users table
      console.log('=== CHECKING USER IN USERS TABLE ===');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      console.log('User data from users table:', userData);
      console.log('User error:', userError);
      
      return NextResponse.json({ error: 'Employee profile not found' }, { status: 404 });
    }
    
    console.log('✅ Employee found:', employeeData);
    
    // Get the user role directly from Supabase
    console.log('=== GETTING USER ROLE ===');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    
    console.log('User role data:', userData);
    console.log('User role error:', userError);
    
    // Combine the results
    const result = {
      ...employeeData,
      role: userData?.role || 'employee'
    };
    
    console.log('✅ Final result:', result);
    console.log('=== RETURNING SUCCESS ===');
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Get employee profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('=== PUT /api/employees/me called ===');
    
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { firstName, lastName, phone, location } = await request.json();
    console.log('Update data:', { firstName, lastName, phone, location });

    // Direct Supabase update
    const { data: updatedData, error: updateError } = await supabase
      .from('employees')
      .update({
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        location: location,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select('*')
      .maybeSingle();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Get user role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const result = {
      ...updatedData,
      role: userData?.role || 'employee'
    };

    console.log('Updated employee:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Update employee profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}