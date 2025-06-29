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
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

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
      toast.error('Failed to load payslips: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPayslip = (payslipId: number) => {
    toast.success('Payslip download started');
    // In a real app, this would trigger a PDF download
  };

  const handleViewPayslip = (payslipId: number) => {
    toast.info('Opening payslip details');
    // In a real app, this would open a detailed view or PDF
  };

  // Calculate stats
  const totalEarnings = payslips.reduce((sum, p) => sum + p.net_pay, 0);
  const averageMonthly = payslips.length > 0 ? totalEarnings / payslips.length : 0;
  const lastPayslip = payslips.find(p => p.status === 'processed');
  const pendingPayslips = payslips.filter(p => p.status === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 text-gradient">My Payslips</h1>
          <p className="text-gray-600 mt-2">View and download your salary information and payslips</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="card-interactive animate-scale-in stagger-1 hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    ${totalEarnings.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">Total Earnings</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full animate-float">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-interactive animate-scale-in stagger-2 hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    ${averageMonthly.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">Average Monthly</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full animate-float">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-interactive animate-scale-in stagger-3 hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    ${lastPayslip?.net_pay.toLocaleString() || '0'}
                  </div>
                  <p className="text-sm text-gray-600">Last Payment</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full animate-float">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-interactive animate-scale-in stagger-4 hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600">{pendingPayslips}</div>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full animate-float">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payslips Table */}
        <Card className="animate-slide-in-up card-glow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Payslip History</span>
            </CardTitle>
            <CardDescription>
              Your complete payslip records and salary history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pay Period</TableHead>
                    <TableHead>Base Salary</TableHead>
                    <TableHead>Bonus</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslips.map((payslip) => (
                    <TableRow key={payslip.id}>
                      <TableCell className="font-medium">
                        {format(new Date(payslip.pay_period_start), 'MMM dd')} - {format(new Date(payslip.pay_period_end), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>${payslip.base_salary.toLocaleString()}</TableCell>
                      <TableCell>${payslip.bonus.toLocaleString()}</TableCell>
                      <TableCell>${payslip.deductions.toLocaleString()}</TableCell>
                      <TableCell className="font-bold text-green-600">
                        ${payslip.net_pay.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={payslip.status === 'processed' ? 'default' : 'secondary'}
                        >
                          {payslip.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewPayslip(payslip.id)}
                            className="hover-scale"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {payslip.status === 'processed' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownloadPayslip(payslip.id)}
                              className="hover-scale"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
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
          <Card className="animate-slide-in-up card-glow">
            <CardHeader>
              <CardTitle>Latest Payslip Breakdown</CardTitle>
              <CardDescription>
                Detailed breakdown of your most recent payment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-green-50 rounded-lg hover-scale">
                  <div className="text-3xl font-bold text-green-600">
                    ${lastPayslip.base_salary.toLocaleString()}
                  </div>
                  <p className="text-green-700 font-medium">Base Salary</p>
                  <p className="text-sm text-green-600 mt-1">Monthly base pay</p>
                </div>
                
                <div className="text-center p-6 bg-blue-50 rounded-lg hover-scale">
                  <div className="text-3xl font-bold text-blue-600">
                    ${lastPayslip.bonus.toLocaleString()}
                  </div>
                  <p className="text-blue-700 font-medium">Bonus</p>
                  <p className="text-sm text-blue-600 mt-1">Performance & incentives</p>
                </div>
                
                <div className="text-center p-6 bg-red-50 rounded-lg hover-scale">
                  <div className="text-3xl font-bold text-red-600">
                    ${lastPayslip.deductions.toLocaleString()}
                  </div>
                  <p className="text-red-700 font-medium">Deductions</p>
                  <p className="text-sm text-red-600 mt-1">Taxes & benefits</p>
                </div>
              </div>
              
              <div className="mt-6 text-center p-6 bg-purple-50 rounded-lg">
                <div className="text-4xl font-bold text-purple-600">
                  ${lastPayslip.net_pay.toLocaleString()}
                </div>
                <p className="text-purple-700 font-medium text-lg">Net Pay</p>
                <p className="text-sm text-purple-600 mt-1">
                  Processed on {lastPayslip.processed_at ? format(new Date(lastPayslip.processed_at), 'MMM dd, yyyy') : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}