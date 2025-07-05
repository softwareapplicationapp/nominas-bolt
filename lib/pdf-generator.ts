// lib/pdf-generator.ts
import jsPDF from 'jspdf';

export interface PayrollData {
  id: number;
  employee: {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    department: string;
    position: string;
    start_date: string;
    location?: string;
  };
  company: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  payroll: {
    pay_period_start: string;
    pay_period_end: string;
    base_salary: number;
    bonus: number;
    deductions: number;
    net_pay: number;
    status: string;
    processed_at?: string;
  };
}

export class PayrollPDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;

  constructor() {
    console.log('PDF Generator: Initializing PDF generator');
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
  }

  generatePayrollPDF(data: PayrollData): Uint8Array {
    console.log('PDF Generator: Starting PDF generation for payroll ID:', data.id);
    console.log('PDF Generator: Employee:', `${data.employee.first_name} ${data.employee.last_name}`);
    console.log('PDF Generator: Company:', data.company.name);
    console.log('PDF Generator: Period:', `${data.payroll.pay_period_start} to ${data.payroll.pay_period_end}`);
    console.log('PDF Generator: Net pay:', data.payroll.net_pay);
    
    try {
      this.addHeader(data);
      this.addEmployeeInfo(data);
      this.addPayrollDetails(data);
      this.addPayrollBreakdown(data);
      this.addFooter(data);

      console.log('PDF Generator: PDF generation completed successfully');
      return this.doc.output('arraybuffer') as Uint8Array;
    } catch (error) {
      console.error('PDF Generator: Error generating PDF:', error);
      throw error;
    }
  }

  private addHeader(data: PayrollData): void {
    console.log('PDF Generator: Adding header section');
    let y = this.margin;

    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(data.company.name, this.margin, y);

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    y += 6;
    if (data.company.address) {
      this.doc.text(data.company.address, this.margin, y);
      y += 5;
    }
    if (data.company.phone) {
      this.doc.text(`Tel: ${data.company.phone}`, this.margin, y);
      y += 5;
    }
    if (data.company.email) {
      this.doc.text(`Email: ${data.company.email}`, this.margin, y);
      y += 5;
    }

    y += 10;
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('RECIBO DE NÓMINA', this.pageWidth / 2, y, { align: 'center' });

    y += 8;
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    const startDate = new Date(data.payroll.pay_period_start).toLocaleDateString('es-ES');
    const endDate = new Date(data.payroll.pay_period_end).toLocaleDateString('es-ES');
    this.doc.text(`Período: ${startDate} - ${endDate}`, this.pageWidth / 2, y, { align: 'center' });

    y += 8;
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, y, this.pageWidth - this.margin, y);

    // store end position for next sections
    this.currentY = y + 10;
  }

  private addEmployeeInfo(data: PayrollData): void {
    console.log('PDF Generator: Adding employee information section');
    let yPos = this.currentY;

    // Employee Information Section
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('INFORMACIÓN DEL EMPLEADO', this.margin, yPos);
    
    yPos += 15;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    // Left column
    const leftCol = this.margin;
    const rightCol = this.pageWidth / 2 + 10;

    // Employee details - Left column
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Nombre:', leftCol, yPos);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`${data.employee.first_name} ${data.employee.last_name}`, leftCol + 25, yPos);

    yPos += 8;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('ID Empleado:', leftCol, yPos);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(data.employee.employee_id, leftCol + 25, yPos);

    yPos += 8;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Departamento:', leftCol, yPos);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(data.employee.department, leftCol + 25, yPos);

    yPos += 8;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Cargo:', leftCol, yPos);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(data.employee.position, leftCol + 25, yPos);

    // Right column
    let rightY = yPos - (4 * 8); // align roughly with top of left column
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Email:', rightCol, rightY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(data.employee.email, rightCol + 20, rightY);

    if (data.employee.phone) {
      rightY += 8;
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Teléfono:', rightCol, rightY);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(data.employee.phone, rightCol + 20, rightY);
    }

    if (data.employee.location) {
      rightY += 8;
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Ubicación:', rightCol, rightY);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(data.employee.location, rightCol + 20, rightY);
    }

    rightY += 8;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Fecha Inicio:', rightCol, rightY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(new Date(data.employee.start_date).toLocaleDateString('es-ES'), rightCol + 20, rightY);

    // Line separator
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, Math.max(yPos, rightY) + 15, this.pageWidth - this.margin, Math.max(yPos, rightY) + 15);

    this.currentY = Math.max(yPos, rightY) + 25;
  }

  private addPayrollDetails(data: PayrollData): void {
    console.log('PDF Generator: Adding payroll details section');
    let yPos = this.currentY;

    // Payroll Details Section
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('DETALLES DE NÓMINA', this.margin, yPos);

    yPos += 15;
    this.doc.setFontSize(10);

    // Table headers
    const tableStartY = yPos;
    const col1X = this.margin;
    const col2X = this.pageWidth - 80;

    // Table background
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(col1X, tableStartY - 5, this.pageWidth - 2 * this.margin, 12, 'F');

    this.doc.setFont('helvetica', 'bold');
    this.doc.text('CONCEPTO', col1X + 5, tableStartY + 2);
    this.doc.text('IMPORTE', col2X, tableStartY + 2);

    yPos += 15;

    // Salary details
    const salaryItems = [
      { label: 'Salario Base', amount: data.payroll.base_salary },
      { label: 'Bonificaciones', amount: data.payroll.bonus },
      { label: 'Deducciones', amount: -data.payroll.deductions }
    ];

    this.doc.setFont('helvetica', 'normal');
    
    salaryItems.forEach((item, index) => {
      // Alternate row background
      if (index % 2 === 0) {
        this.doc.setFillColor(250, 250, 250);
        this.doc.rect(col1X, yPos - 5, this.pageWidth - 2 * this.margin, 10, 'F');
      }

      this.doc.text(item.label, col1X + 5, yPos);
      
      // Format amount with color
      const formattedAmount = `€${Math.abs(item.amount).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
      if (item.amount < 0) {
        this.doc.setTextColor(200, 0, 0); // Red for deductions
        this.doc.text(`-${formattedAmount}`, col2X, yPos);
        this.doc.setTextColor(0, 0, 0); // Reset to black
      } else {
        this.doc.text(formattedAmount, col2X, yPos);
      }
      
      yPos += 12;
    });

    // Total line
    this.doc.setLineWidth(1);
    this.doc.line(col1X, yPos, this.pageWidth - this.margin, yPos);
    
    yPos += 10;
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.text('TOTAL NETO:', col1X + 5, yPos);
    
    // Net pay amount - highlighted
    this.doc.setFillColor(0, 120, 0);
    this.doc.setTextColor(255, 255, 255);
    const netPayText = `€${data.payroll.net_pay.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
    const textWidth = this.doc.getTextWidth(netPayText);
    this.doc.rect(col2X - 5, yPos - 8, textWidth + 10, 12, 'F');
    this.doc.text(netPayText, col2X, yPos);
    this.doc.setTextColor(0, 0, 0); // Reset color

    this.currentY = yPos + 20;
  }

  private addPayrollBreakdown(data: PayrollData): void {
    console.log('PDF Generator: Adding payroll breakdown section');
    let yPos = this.currentY;

    // Additional Information
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('INFORMACIÓN ADICIONAL', this.margin, yPos);

    yPos += 15;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    // Status
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Estado:', this.margin, yPos);
    this.doc.setFont('helvetica', 'normal');
    const statusText = data.payroll.status === 'processed' ? 'Procesado' : 
                      data.payroll.status === 'pending' ? 'Pendiente' : 'Pagado';
    this.doc.text(statusText, this.margin + 25, yPos);

    // Processed date
    if (data.payroll.processed_at) {
      yPos += 8;
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Fecha Proceso:', this.margin, yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(new Date(data.payroll.processed_at).toLocaleDateString('es-ES'), this.margin + 25, yPos);
    }

    // Generation date
    yPos += 8;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Fecha Generación:', this.margin, yPos);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(new Date().toLocaleDateString('es-ES'), this.margin + 25, yPos);

    // Important note
    yPos += 20;
    this.doc.setFillColor(255, 255, 200);
    this.doc.rect(this.margin, yPos - 5, this.pageWidth - 2 * this.margin, 25, 'F');
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('NOTA IMPORTANTE:', this.margin + 5, yPos + 3);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Este documento es un recibo oficial de nómina. Conserve este documento', this.margin + 5, yPos + 10);
    this.doc.text('para sus registros personales y efectos fiscales.', this.margin + 5, yPos + 17);

    this.currentY = yPos + 30;
  }

  private addFooter(data: PayrollData): void {
    console.log('PDF Generator: Adding footer section');
    const footerY = this.pageHeight - 30;

    // Footer line
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, footerY - 10, this.pageWidth - this.margin, footerY - 10);

    // Footer text
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    
    this.doc.text('Este documento ha sido generado automáticamente por ArcusHR', this.margin, footerY);
    this.doc.text(`Generado el: ${new Date().toLocaleString('es-ES')}`, this.margin, footerY + 5);
    
    // Page number
    this.doc.text('Página 1 de 1', this.pageWidth - this.margin, footerY, { align: 'right' });
    
    // Document ID - Use data.id instead of data.payroll.id
    console.log('PDF Generator: Using document ID:', data.id);
    this.doc.text(`ID Documento: PAY-${data.id}-${new Date().getFullYear()}`, this.pageWidth - this.margin, footerY + 5, { align: 'right' });
  }
}

// Utility function to generate filename
export function generatePayrollFilename(employeeName: string, payPeriodStart: string): string {
  console.log('PDF Generator: Generating filename for employee:', employeeName, 'period:', payPeriodStart);
  const date = new Date(payPeriodStart);
  const monthYear = date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit' });
  const cleanName = employeeName.replace(/\s+/g, '_').toLowerCase();
  return `nomina_${cleanName}_${monthYear.replace('/', '-')}.pdf`;
}