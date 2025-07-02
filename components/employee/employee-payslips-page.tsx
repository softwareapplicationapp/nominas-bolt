'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Download, 
  FileText, 
  DollarSign, 
  Calendar,
  TrendingUp,
  Eye,
  Loader2,
  FileIcon,
  Printer,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/language-context';
import { apiClient } from '@/lib/api-client';

interface Payslip {
  id: number;
  pay_period_start: string;
  pay_period_end: string;
  base_salary: number;
  bonus: number;
  deductions: number;
  net_pay: number;
  status: string;
  processed_at?: string;
}

export default function EmployeePayslipsPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState<number | null>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    loadPayslips();
  }, []);

  const loadPayslips = async () => {
    try {
      setLoading(true);
      // For now, we'll use mock data since payroll isn't fully implemented
      const mockPayslips: Payslip[] = [
        {
          id: 1,
          pay_period_start: '2024-01-01',
          pay_period_end: '2024-01-31',
          base_salary: 6250,
          bonus: 500,
          deductions: 1250,
          net_pay: 5500,
          status: 'processed',
          processed_at: '2024-02-01T10:00:00Z'
        },
        {
          id: 2,
          pay_period_start: '2024-02-01',
          pay_period_end: '2024-02-29',
          base_salary: 6250,
          bonus: 0,
          deductions: 1250,
          net_pay: 5000,
          status: 'processed',
          processed_at: '2024-03-01T10:00:00Z'
        },
        {
          id: 3,
          pay_period_start: '2024-03-01',
          pay_period_end: '2024-03-31',
          base_salary: 6250,
          bonus: 750,
          deductions: 1250,
          net_pay: 5750,
          status: 'processed',
          processed_at: '2024-04-01T10:00:00Z'
        },
        {
          id: 4,
          pay_period_start: '2024-04-01',
          pay_period_end: '2024-04-30',
          base_salary: 6250,
          bonus: 0,
          deductions: 1250,
          net_pay: 5000,
          status: 'pending'
        }
      ];
      
      setPayslips(mockPayslips);
    } catch (error: any) {
      toast.error('Error al cargar recibos de pago: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPayslip = async (payslipId: number) => {
    setIsDownloading(payslipId);
    try {
      console.log('Attempting to download payslip PDF for ID:', payslipId);
      const blob = await apiClient.downloadPayrollPDF(payslipId);
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nomina_${format(new Date(), 'yyyy-MM')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Recibo de pago descargado con éxito');
    } catch (error: any) {
      console.error('Error downloading payslip:', error);
      toast.error('Error al descargar el recibo de pago: ' + error.message);
    } finally {
      setIsDownloading(null);
    }
  };

  const handleViewPayslip = (payslipId: number) => {
    toast.info('Abriendo detalles del recibo de pago');
    // In a real app, this would open a detailed view or PDF
  };

  const handleEmailPayslip = (payslipId: number) => {
    toast.success('Recibo de pago enviado a tu correo electrónico');
  };

  const handlePrintPayslip = (payslipId: number) => {
    toast.info('Preparando recibo de pago para imprimir');
  };

  // Calculate stats
  const totalEarnings = payslips.reduce((sum, p) => sum + p.net_pay, 0);
  const averageMonthly = payslips.length > 0 ? totalEarnings / payslips.length : 0;
  const lastPayslip = payslips.find(p => p.status === 'processed');
  const pendingPayslips = payslips.filter(p => p.status === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 text-gradient">Mis Recibos de Pago</h1>
          <p className="text-gray-800 mt-2 font-semibold">Ver y descargar tu información salarial y recibos de pago</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="card-interactive animate-scale-in stagger-1 hover-glow border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    €{totalEarnings.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-800 font-semibold">Ingresos Totales</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-full animate-float">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-interactive animate-scale-in stagger-2 hover-glow border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    €{averageMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <p className="text-sm text-gray-800 font-semibold">Promedio Mensual</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full animate-float">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-interactive animate-scale-in stagger-3 hover-glow border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    €{lastPayslip?.net_pay.toLocaleString() || '0'}
                  </div>
                  <p className="text-sm text-gray-800 font-semibold">Último Pago</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full animate-float">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-interactive animate-scale-in stagger-4 hover-glow border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{pendingPayslips}</div>
                  <p className="text-sm text-gray-800 font-semibold">Pendientes</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-full animate-float">
                  <FileText className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payslips Table */}
        <Card className="animate-slide-in-up card-glow border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Historial de Recibos de Pago</span>
            </CardTitle>
            <CardDescription className="text-gray-800 font-medium">
              Tus registros completos de recibos de pago e historial salarial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-900 font-semibold">Período de Pago</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Salario Base</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Bonificación</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Deducciones</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Pago Neto</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Estado</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslips.map((payslip) => (
                    <TableRow key={payslip.id}>
                      <TableCell className="font-medium text-gray-900">
                        {format(new Date(payslip.pay_period_start), 'dd MMM', { locale: language === 'es' ? es : undefined })} - {format(new Date(payslip.pay_period_end), 'dd MMM, yyyy', { locale: language === 'es' ? es : undefined })}
                      </TableCell>
                      <TableCell className="text-gray-800 font-medium">€{payslip.base_salary.toLocaleString()}</TableCell>
                      <TableCell className="text-gray-800 font-medium">€{payslip.bonus.toLocaleString()}</TableCell>
                      <TableCell className="text-gray-800 font-medium">€{payslip.deductions.toLocaleString()}</TableCell>
                      <TableCell className="font-bold text-emerald-600">
                        €{payslip.net_pay.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={payslip.status === 'processed' ? 'badge-approved' : 'badge-pending'}
                        >
                          {payslip.status === 'processed' ? 'Procesado' : 'Pendiente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payslip.status === 'processed' && (
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewPayslip(payslip.id)}
                              className="hover-scale text-gray-700 hover:text-gray-900"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownloadPayslip(payslip.id)}
                              disabled={isDownloading === payslip.id}
                              className="hover-scale text-blue-600 hover:text-blue-700"
                            >
                              {isDownloading === payslip.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <FileIcon className="h-4 w-4" />
                              )}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEmailPayslip(payslip.id)}
                              className="hover-scale text-purple-600 hover:text-purple-700"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handlePrintPayslip(payslip.id)}
                              className="hover-scale text-gray-600 hover:text-gray-700"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Payslip Breakdown */}
        {lastPayslip && (
          <Card className="animate-slide-in-up card-glow border-gray-200">
            <CardHeader>
              <CardTitle>Desglose del Último Recibo de Pago</CardTitle>
              <CardDescription className="text-gray-800 font-medium">
                Desglose detallado de tu pago más reciente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-emerald-50 rounded-lg hover-scale border border-emerald-200">
                  <div className="text-3xl font-bold text-emerald-700">
                    €{lastPayslip.base_salary.toLocaleString()}
                  </div>
                  <p className="text-emerald-800 font-semibold">Salario Base</p>
                  <p className="text-sm text-emerald-700 font-medium mt-1">Pago base mensual</p>
                </div>
                
                <div className="text-center p-6 bg-blue-50 rounded-lg hover-scale border border-blue-200">
                  <div className="text-3xl font-bold text-blue-700">
                    €{lastPayslip.bonus.toLocaleString()}
                  </div>
                  <p className="text-blue-800 font-semibold">Bonificación</p>
                  <p className="text-sm text-blue-700 font-medium mt-1">Rendimiento e incentivos</p>
                </div>
                
                <div className="text-center p-6 bg-red-50 rounded-lg hover-scale border border-red-200">
                  <div className="text-3xl font-bold text-red-700">
                    €{lastPayslip.deductions.toLocaleString()}
                  </div>
                  <p className="text-red-800 font-semibold">Deducciones</p>
                  <p className="text-sm text-red-700 font-medium mt-1">Impuestos y beneficios</p>
                </div>
              </div>
              
              <div className="mt-6 text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-4xl font-bold text-purple-700">
                  €{lastPayslip.net_pay.toLocaleString()}
                </div>
                <p className="text-purple-800 font-semibold text-lg">Pago Neto</p>
                <p className="text-sm text-purple-700 font-medium mt-1">
                  Procesado el {lastPayslip.processed_at ? format(new Date(lastPayslip.processed_at), 'dd MMM, yyyy', { locale: language === 'es' ? es : undefined }) : 'N/A'}
                </p>
              </div>

              <div className="mt-6 flex justify-center space-x-4">
                <Button 
                  onClick={() => handleDownloadPayslip(lastPayslip.id)}
                  disabled={isDownloading === lastPayslip.id}
                  className="btn-primary"
                >
                  {isDownloading === lastPayslip.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Descargar Recibo de Pago
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleEmailPayslip(lastPayslip.id)}
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar por Email
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}