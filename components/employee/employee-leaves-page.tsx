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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  MessageSquare,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/language-context';

interface LeaveRequest {
  id: number;
  type: string;
  start_date: string;
  end_date: string;
  days: number;
  status: string;
  reason: string;
  admin_comments?: string; // NEW: Admin comments field
  created_at: string;
  approver_first_name?: string;
  approver_last_name?: string;
}

export default function EmployeeLeavesPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // NEW: Comments dialog state
  const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null);
  
  const { t } = useLanguage();

  // Form state
  const [formData, setFormData] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employees/leaves', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (!response.ok) throw new Error('Error al cargar solicitudes de permisos');
      
      const data = await response.json();
      setLeaveRequests(data);
    } catch (error: any) {
      toast.error('Error al cargar solicitudes de permisos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/employees/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al enviar solicitud de permiso');
      }

      toast.success('¡Solicitud de permiso enviada con éxito!');
      setIsDialogOpen(false);
      setFormData({
        type: '',
        startDate: '',
        endDate: '',
        reason: ''
      });
      loadLeaveRequests();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // NEW: Handle viewing comments
  const handleViewComments = (request: LeaveRequest) => {
    setSelectedLeaveRequest(request);
    setIsCommentsDialogOpen(true);
  };

  // Calculate stats
  const pendingRequests = leaveRequests.filter(req => req.status === 'pending').length;
  const approvedRequests = leaveRequests.filter(req => req.status === 'approved').length;
  const rejectedRequests = leaveRequests.filter(req => req.status === 'rejected').length;
  const totalDaysRequested = leaveRequests.reduce((sum, req) => sum + req.days, 0);

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
        <div className="flex justify-between items-center animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 text-gradient">Mis Solicitudes de Permiso</h1>
            <p className="text-gray-800 mt-2 font-semibold">Gestiona tu tiempo libre y solicitudes de permisos</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Solicitar Permiso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-gray-900">Enviar Solicitud de Permiso</DialogTitle>
                <DialogDescription className="text-gray-800 font-medium">
                  Completa el formulario para solicitar tiempo libre
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitRequest} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="leaveType" className="text-gray-900 font-semibold">Tipo de Permiso</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger className="border-gray-300 text-gray-900">
                      <SelectValue placeholder="Selecciona tipo de permiso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vacation">Vacaciones</SelectItem>
                      <SelectItem value="sick">Enfermedad</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="emergency">Emergencia</SelectItem>
                      <SelectItem value="maternity">Maternidad</SelectItem>
                      <SelectItem value="paternity">Paternidad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-gray-900 font-semibold">Fecha de Inicio</Label>
                    <Input 
                      id="startDate" 
                      type="date" 
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      required
                      className="border-gray-300 text-gray-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-gray-900 font-semibold">Fecha de Fin</Label>
                    <Input 
                      id="endDate" 
                      type="date" 
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      required
                      className="border-gray-300 text-gray-900"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-gray-900 font-semibold">Motivo</Label>
                  <Textarea 
                    id="reason" 
                    placeholder="Por favor proporciona un motivo para tu solicitud de permiso"
                    rows={3}
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    required
                    className="border-gray-300 text-gray-900"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gray-300 text-gray-800">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="btn-primary">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar Solicitud'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="card-interactive animate-scale-in stagger-1 hover-glow border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{pendingRequests}</div>
                  <p className="text-sm text-gray-800 font-semibold">Pendientes</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-full animate-float">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-interactive animate-scale-in stagger-2 hover-glow border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{approvedRequests}</div>
                  <p className="text-sm text-gray-800 font-semibold">Aprobados</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-full animate-float">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-interactive animate-scale-in stagger-3 hover-glow border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{rejectedRequests}</div>
                  <p className="text-sm text-gray-800 font-semibold">Rechazados</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full animate-float">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-interactive animate-scale-in stagger-4 hover-glow border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalDaysRequested}</div>
                  <p className="text-sm text-gray-800 font-semibold">Días Totales</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full animate-float">
                  <CalendarIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leave Requests Table */}
        <Card className="animate-slide-in-up card-glow border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Mi Historial de Permisos</span>
            </CardTitle>
            <CardDescription className="text-gray-800 font-medium">
              Todas tus solicitudes de permisos y su estado actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-900 font-semibold">Tipo</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Fechas</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Días</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Estado</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Aprobado Por</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Enviado</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium text-gray-900 capitalize">
                        {request.type === 'vacation' ? 'Vacaciones' :
                         request.type === 'sick' ? 'Enfermedad' :
                         request.type === 'personal' ? 'Personal' :
                         request.type === 'emergency' ? 'Emergencia' :
                         request.type === 'maternity' ? 'Maternidad' :
                         request.type === 'paternity' ? 'Paternidad' : request.type}
                      </TableCell>
                      <TableCell className="text-gray-800 font-medium">
                        {format(new Date(request.start_date), 'dd MMM')} - {format(new Date(request.end_date), 'dd MMM, yyyy')}
                      </TableCell>
                      <TableCell className="text-gray-800 font-medium">{request.days}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className={
                              request.status === 'approved' ? 'badge-approved' :
                              request.status === 'rejected' ? 'badge-rejected' : 'badge-pending'
                            }
                          >
                            {request.status === 'pending' ? 'Pendiente' :
                             request.status === 'approved' ? 'Aprobado' :
                             request.status === 'rejected' ? 'Rechazado' : request.status}
                          </Badge>
                          {/* NEW: Show comment indicator */}
                          {request.admin_comments && (
                            <MessageSquare className="h-4 w-4 text-blue-600" title="Tiene comentarios del administrador" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-800 font-medium">
                        {request.approver_first_name ? 
                          `${request.approver_first_name} ${request.approver_last_name}` : 
                          '-'
                        }
                      </TableCell>
                      <TableCell className="text-gray-800 font-medium">
                        {format(new Date(request.created_at), 'dd MMM, yyyy')}
                      </TableCell>
                      <TableCell>
                        {/* NEW: View comments button */}
                        {request.admin_comments && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewComments(request)}
                            className="hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                            title="Ver comentarios del administrador"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* NEW: Comments Dialog */}
        <Dialog open={isCommentsDialogOpen} onOpenChange={setIsCommentsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Comentarios del Administrador</DialogTitle>
              <DialogDescription className="text-gray-800 font-medium">
                {selectedLeaveRequest && (
                  <>
                    Comentarios sobre tu solicitud de{' '}
                    <strong>
                      {selectedLeaveRequest.type === 'vacation' ? 'vacaciones' :
                       selectedLeaveRequest.type === 'sick' ? 'enfermedad' :
                       selectedLeaveRequest.type === 'personal' ? 'permiso personal' :
                       selectedLeaveRequest.type === 'emergency' ? 'emergencia' :
                       selectedLeaveRequest.type === 'maternity' ? 'maternidad' :
                       selectedLeaveRequest.type === 'paternity' ? 'paternidad' : selectedLeaveRequest.type}
                    </strong>
                    {' '}del {format(new Date(selectedLeaveRequest.start_date), 'dd MMM')} al{' '}
                    {format(new Date(selectedLeaveRequest.end_date), 'dd MMM, yyyy')}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              {selectedLeaveRequest && (
                <div className="space-y-4">
                  {/* Request Status */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Estado de la Solicitud:</span>
                      <Badge 
                        className={
                          selectedLeaveRequest.status === 'approved' ? 'badge-approved' :
                          selectedLeaveRequest.status === 'rejected' ? 'badge-rejected' : 'badge-pending'
                        }
                      >
                        {selectedLeaveRequest.status === 'pending' ? 'Pendiente' :
                         selectedLeaveRequest.status === 'approved' ? 'Aprobado' :
                         selectedLeaveRequest.status === 'rejected' ? 'Rechazado' : selectedLeaveRequest.status}
                      </Badge>
                    </div>
                    {selectedLeaveRequest.approver_first_name && (
                      <p className="text-sm text-gray-600">
                        Por: {selectedLeaveRequest.approver_first_name} {selectedLeaveRequest.approver_last_name}
                      </p>
                    )}
                  </div>

                  {/* Admin Comments */}
                  <div className="space-y-2">
                    <Label className="text-gray-900 font-semibold">Comentarios:</Label>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-800 font-medium leading-relaxed">
                          {selectedLeaveRequest.admin_comments}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Detalles de la Solicitud:</h4>
                    <div className="space-y-1 text-sm">
                      <div><strong>Días solicitados:</strong> {selectedLeaveRequest.days}</div>
                      <div><strong>Motivo:</strong> {selectedLeaveRequest.reason}</div>
                      <div><strong>Fecha de solicitud:</strong> {format(new Date(selectedLeaveRequest.created_at), 'dd MMM, yyyy')}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={() => setIsCommentsDialogOpen(false)}
                className="btn-primary"
              >
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}