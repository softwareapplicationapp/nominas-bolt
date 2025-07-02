import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { dbGet } from '@/lib/database';
import { PayrollPDFGenerator, generatePayrollFilename, PayrollData } from '@/lib/pdf-generator';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('API Route: /api/payroll/[id]/pdf GET called');
    console.log('API Route: Request URL:', request.url);
    console.log('API Route: Request headers:', Object.fromEntries(request.headers.entries()));
    
    const user = await getUserFromRequest(request);
    console.log('API Route: User from request:', user ? {
      id: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id
    } : 'Unauthorized');
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payrollId = parseInt(params.id);
    console.log('API Route: Payroll ID:', payrollId);

    // CRITICAL FIX: First check if the payroll record exists directly
    console.log('API Route: Direct check for payroll record');
    const { data: directPayrollCheck, error: directPayrollError } = await supabase
      .from('payroll')
      .select('*')
      .eq('id', payrollId)
      .maybeSingle();
      
    console.log('API Route: Direct payroll check result:', directPayrollCheck ? 'Found' : 'Not found');
    if (directPayrollError) {
      console.error('API Route: Direct payroll check error:', directPayrollError);
    }
    
    if (!directPayrollCheck) {
      console.log('API Route: Payroll record not found in direct check');
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 });
    }
    
    console.log('API Route: Payroll record exists, now getting full details');

    // Get payroll record with employee and company details
    console.log('API Route: Querying payroll record for ID:', payrollId);
    
    // CRITICAL FIX: Use direct Supabase query instead of dbGet
    const { data: payrollData, error: payrollError } = await supabase
      .from('payroll')
      .select(`
        *,
        employee:employees!inner(
          id, employee_id, first_name, last_name, email, phone, 
          department, position, start_date, location,
          company:companies!inner(name)
        )
      `)
      .eq('id', payrollId)
      .maybeSingle();
    
    console.log('API Route: Payroll query result:', payrollData ? 'Found' : 'Not found');
    if (payrollError) {
      console.error('API Route: Payroll query error:', payrollError);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }
    
    if (!payrollData) {
      console.log('API Route: Payroll record not found for ID:', payrollId);
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 });
    }
    
    const employee = (payrollData as any).employee;
    const company = employee.company;
    
    console.log('API Route: Employee data:', {
      id: employee.id,
      name: `${employee.first_name} ${employee.last_name}`,
      department: employee.department
    });
    
    console.log('API Route: Company data:', {
      name: company.name
    });

    // Check authorization - admin/hr can access all, employees can only access their own
    console.log('API Route: User role:', user.role);
    if (user.role === 'employee') {
      const employeeRecord = await dbGet(`
        SELECT id FROM employees WHERE user_id = ?
      `, [user.id]) as any;

      if (!employeeRecord || employeeRecord.id !== employee.id) {
        console.log('API Route: Unauthorized access attempt for payroll ID:', payrollId, 'by user ID:', user.id);
        return NextResponse.json({ error: 'Unauthorized to access this payroll record' }, { status: 403 });
      }
    }

    // Prepare data for PDF generation
    console.log('API Route: Preparing data for PDF generation...');
    const payrollDataForPDF: PayrollData = {
      id: payrollData.id,
      employee: {
        id: employee.id,
        employee_id: employee.employee_id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
        position: employee.position,
        start_date: employee.start_date,
        location: employee.location,
      },
      company: {
        name: company.name,
        address: 'Calle Principal 123, Madrid, España', // You can make this dynamic
        phone: '+34 91 123 4567',
        email: 'info@empresa.com',
      },
      payroll: {
        pay_period_start: payrollData.pay_period_start,
        pay_period_end: payrollData.pay_period_end,
        base_salary: payrollData.base_salary,
        bonus: payrollData.bonus,
        deductions: payrollData.deductions,
        net_pay: payrollData.net_pay,
        status: payrollData.status,
        processed_at: payrollData.processed_at,
      },
    };

    console.log('API Route: Generating PDF...');
    // Generate PDF
    const generator = new PayrollPDFGenerator();
    const pdfBuffer = generator.generatePayrollPDF(payrollDataForPDF);

    console.log('API Route: Generating filename...');
    // Generate filename
    const filename = generatePayrollFilename(
      `${employee.first_name} ${employee.last_name}`,
      payrollData.pay_period_start
    );

    console.log('API Route: Returning PDF response for filename:', filename);
    console.log('API Route: PDF buffer size:', pdfBuffer.byteLength);
    
    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Generate payroll PDF error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}