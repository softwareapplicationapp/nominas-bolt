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

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
  }

  generatePayrollPDF(data: PayrollData): Uint8Array {
    this.addHeader(data);
    this.addEmployeeInfo(data);
    this.addPayrollDetails(data);
    this.addPayrollBreakdown(data);
    this.addFooter(data);

    return this.doc.output('arraybuffer') as Uint8Array;
  }

  private addHeader(data: PayrollData): void {
    // Company header
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(data.company.name, this.margin, 30);

    // Company details
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    let yPos = 40;
    
    if (data.company.address) {
      this.doc.text(data.company.address, this.margin, yPos);
      yPos += 5;
    }
    
    if (data.company.phone) {
      this.doc.text(`Tel: ${data.company.phone}`, this.margin, yPos);
      yPos += 5;
    }
    
    if (data.company.email) {
      this.doc.text(`Email: ${data.company.email}`, this.margin, yPos);
    }

    // Document title
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('RECIBO DE NÓMINA', this.pageWidth / 2, 70, { align: 'center' });

    // Pay period
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    const startDate = new Date(data.payroll.pay_period_start).toLocaleDateString('es-ES');
    const endDate = new Date(data.payroll.pay_period_end).toLocaleDateString('es-ES');
    this.doc.text(`Período: ${startDate} - ${endDate}`, this.pageWidth / 2, 80, { align: 'center' });

    // Line separator
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, 90, this.pageWidth - this.margin, 90);
  }

  private addEmployeeInfo(data: PayrollData): void {
    let yPos = 105;

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
    yPos = 120;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Email:', rightCol, yPos);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(data.employee.email, rightCol + 20, yPos);

    if (data.employee.phone) {
      yPos += 8;
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Teléfono:', rightCol, yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(data.employee.phone, rightCol + 20, yPos);
    }

    if (data.employee.location) {
      yPos += 8;
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Ubicación:', rightCol, yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(data.employee.location, rightCol + 20, yPos);
    }

    yPos += 8;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Fecha Inicio:', rightCol, yPos);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(new Date(data.employee.start_date).toLocaleDateString('es-ES'), rightCol + 20, yPos);

    // Line separator
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, yPos + 15, this.pageWidth - this.margin, yPos + 15);
  }

  private addPayrollDetails(data: PayrollData): void {
    let yPos = 185;

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
  }

  private addPayrollBreakdown(data: PayrollData): void {
    let yPos = 280;

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
  }

  private addFooter(data: PayrollData): void {
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
    
    // Document ID
    this.doc.text(`ID Documento: PAY-${data.payroll.id}-${new Date().getFullYear()}`, this.pageWidth - this.margin, footerY + 5, { align: 'right' });
  }
}

// Utility function to generate filename
export function generatePayrollFilename(employeeName: string, payPeriodStart: string): string {
  const date = new Date(payPeriodStart);
  const monthYear = date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit' });
  const cleanName = employeeName.replace(/\s+/g, '_').toLowerCase();
  return `nomina_${cleanName}_${monthYear.replace('/', '-')}.pdf`;
}