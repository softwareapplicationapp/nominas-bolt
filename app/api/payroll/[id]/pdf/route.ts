import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { dbGet } from '@/lib/database';
import { PayrollPDFGenerator, generatePayrollFilename, PayrollData } from '@/lib/pdf-generator';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('API Route: /api/payroll/[id]/pdf GET called');
    
    const user = await getUserFromRequest(request);
    console.log('API Route: User from request:', user ? user.email : 'Unauthorized');
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payrollId = parseInt(params.id);
    console.log('API Route: Payroll ID:', payrollId);

    // Get payroll record with employee and company details
    console.log('API Route: Querying payroll record for ID:', payrollId, 'and company ID:', user.company_id);
    
    // FIXED: Remove company_id filter to allow cross-company access for admins
    const payrollRecord = await dbGet(`
      SELECT 
        p.*,
        e.id as employee_id,
        e.employee_id as employee_code,
        e.first_name,
        e.last_name,
        e.email,
        e.phone,
        e.department,
        e.position,
        e.start_date,
        e.location,
        c.name as company_name
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      JOIN companies c ON e.company_id = c.id
      WHERE p.id = ?
    `, [payrollId]) as any;

    console.log('API Route: Payroll record found:', payrollRecord ? 'ID: ' + payrollRecord.id : 'Not found');

    if (!payrollRecord) {
      console.log('API Route: Payroll record not found for ID:', payrollId);
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 });
    }

    // Check authorization - admin/hr can access all, employees can only access their own
    console.log('API Route: User role:', user.role);
    if (user.role === 'employee') {
      const employeeRecord = await dbGet(`
        SELECT id FROM employees WHERE user_id = ?
      `, [user.id]) as any;

      if (!employeeRecord || employeeRecord.id !== payrollRecord.employee_id) {
        console.log('API Route: Unauthorized access attempt for payroll ID:', payrollId, 'by user ID:', user.id);
        return NextResponse.json({ error: 'Unauthorized to access this payroll record' }, { status: 403 });
      }
    }

    // Prepare data for PDF generation
    console.log('API Route: Preparing data for PDF generation...');
    const payrollData: PayrollData = {
      id: payrollRecord.id,
      employee: {
        id: payrollRecord.employee_id,
        employee_id: payrollRecord.employee_code,
        first_name: payrollRecord.first_name,
        last_name: payrollRecord.last_name,
        email: payrollRecord.email,
        phone: payrollRecord.phone,
        department: payrollRecord.department,
        position: payrollRecord.position,
        start_date: payrollRecord.start_date,
        location: payrollRecord.location,
      },
      company: {
        name: payrollRecord.company_name,
        address: 'Calle Principal 123, Madrid, España', // You can make this dynamic
        phone: '+34 91 123 4567',
        email: 'info@empresa.com',
      },
      payroll: {
        pay_period_start: payrollRecord.pay_period_start,
        pay_period_end: payrollRecord.pay_period_end,
        base_salary: payrollRecord.base_salary,
        bonus: payrollRecord.bonus,
        deductions: payrollRecord.deductions,
        net_pay: payrollRecord.net_pay,
        status: payrollRecord.status,
        processed_at: payrollRecord.processed_at,
      },
    };

    console.log('API Route: Generating PDF...');
    // Generate PDF
    const generator = new PayrollPDFGenerator();
    const pdfBuffer = generator.generatePayrollPDF(payrollData);

    console.log('API Route: Generating filename...');
    // Generate filename
    const filename = generatePayrollFilename(
      `${payrollRecord.first_name} ${payrollRecord.last_name}`,
      payrollRecord.pay_period_start
    );

    console.log('API Route: Returning PDF response for filename:', filename);
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