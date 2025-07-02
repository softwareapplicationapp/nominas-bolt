'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Check, 
  X, 
  Plus, 
  User,
  FileText,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';

interface LeaveRequest {
  id: number;
  employee_id: number;
  first_name: string;
  last_name: string;
  department: string;
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

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  department: string;
}

export default function LeavesPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // NEW: Approval dialog state
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [adminComments, setAdminComments] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    employeeId: '',
    type: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leavesData, employeesData] = await Promise.all([
        apiClient.getLeaves(),
        apiClient.getEmployees()
      ]);
      setLeaveRequests(leavesData);
      setEmployees(employeesData);
    } catch (error: any) {
      toast.error('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Handle approval with comments
  const handleApprovalAction = (request: LeaveRequest, action: 'approve' | 'reject') => {
    setSelectedLeaveRequest(request);
    setApprovalAction(action);
    setAdminComments('');
    setIsApprovalDialogOpen(true);
  };

  // NEW: Submit approval with comments
  const handleSubmitApproval = async () => {
    if (!selectedLeaveRequest) return;

    setIsSubmitting(true);
    try {
      await apiClient.approveLeave(selectedLeaveRequest.id, approvalAction, adminComments);
      
      const actionText = approvalAction === 'approve' ? 'approved' : 'rejected';
      toast.success(`Leave request ${actionText} successfully!`);
      
      setIsApprovalDialogOpen(false);
      setSelectedLeaveRequest(null);
      setAdminComments('');
      loadData();
    } catch (error: any) {
      toast.error(`Failed to ${approvalAction} leave: ` + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiClient.createLeave({
        employeeId: parseInt(formData.employeeId),
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason
      });
      
      toast.success('Leave request submitted successfully!');
      setIsDialogOpen(false);
      setFormData({
        employeeId: '',
        type: '',
        startDate: '',
        endDate: '',
        reason: ''
      });
      loadData();
    } catch (error: any) {
      toast.error('Failed to submit leave request: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingRequests = leaveRequests.filter(req => req.status === 'pending').length;
  const approvedThisMonth = leaveRequests.filter(req => {
    const createdDate = new Date(req.created_at);
    const currentMonth = new Date();
    return req.status === 'approved' && 
           createdDate.getMonth() === currentMonth.getMonth() && 
           createdDate.getFullYear() === currentMonth.getFullYear();
  }).length;
  const rejectedThisMonth = leaveRequests.filter(req => {
    const createdDate = new Date(req.created_at);
    const currentMonth = new Date();
    return req.status === 'rejected' && 
           createdDate.getMonth() === currentMonth.getMonth() && 
           createdDate.getFullYear() === currentMonth.getFullYear();
  }).length;
  const totalDaysOff = leaveRequests.filter(req => req.status === 'approved').reduce((sum, req) => sum + req.days, 0);

  // Get leaves for selected date
  const leavesForSelectedDate = selectedDate ? leaveRequests.filter(req => {
    const startDate = new Date(req.start_date);
    const endDate = new Date(req.end_date);
    return selectedDate >= startDate && selectedDate <= endDate && req.status === 'approved';
  }) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600 mt-2">Manage employee leave requests and approvals</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Leave Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Submit Leave Request</DialogTitle>
              <DialogDescription>
                Fill out the form to request time off
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitRequest} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="employee">Employee</Label>
                <Select value={formData.employeeId} onValueChange={(value) => setFormData({...formData, employeeId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {emp.first_name} {emp.last_name} - {emp.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">Vacation</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="maternity">Maternity</SelectItem>
                    <SelectItem value="paternity">Paternity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input 
                    id="startDate" 
                    type="date" 
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input 
                    id="endDate" 
                    type="date" 
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea 
                  id="reason" 
                  placeholder="Please provide a reason for your leave request"
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{pendingRequests}</div>
                <p className="text-sm text-gray-600">Pending Requests</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{approvedThisMonth}</div>
                <p className="text-sm text-gray-600">Approved This Month</p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{rejectedThisMonth}</div>
                <p className="text-sm text-gray-600">Rejected This Month</p>
              </div>
              <X className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{totalDaysOff}</div>
                <p className="text-sm text-gray-600">Total Days Off</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="requests">Leave Requests</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
              <CardDescription>
                Review and manage employee leave requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          {request.first_name} {request.last_name}
                        </TableCell>
                        <TableCell>{request.department}</TableCell>
                        <TableCell className="capitalize">{request.type}</TableCell>
                        <TableCell>
                          {format(new Date(request.start_date), 'MMM dd')} - {format(new Date(request.end_date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>{request.days}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={
                                request.status === 'approved' ? 'default' :
                                request.status === 'rejected' ? 'destructive' : 'secondary'
                              }
                            >
                              {request.status}
                            </Badge>
                            {/* NEW: Show comment indicator */}
                            {request.admin_comments && (
                              <MessageSquare className="h-4 w-4 text-blue-600" title="Has admin comments" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {request.status === 'pending' && (
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => handleApprovalAction(request, 'approve')}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleApprovalAction(request, 'reject')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {request.status !== 'pending' && (
                            <div className="text-sm text-gray-500">
                              <div>
                                {request.status === 'approved' ? 'Approved' : 'Rejected'}
                                {request.approver_first_name && (
                                  <> by {request.approver_first_name} {request.approver_last_name}</>
                                )}
                              </div>
                              {/* NEW: Show admin comments if available */}
                              {request.admin_comments && (
                                <div className="mt-1 p-2 bg-gray-50 rounded text-xs">
                                  <strong>Comment:</strong> {request.admin_comments}
                                </div>
                              )}
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
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
                <CardDescription>
                  Choose a date to view leave details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  Leave Schedule for {selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : 'Select a date'}
                </CardTitle>
                <CardDescription>
                  Employees on leave for the selected date
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  <div className="space-y-4">
                    {leavesForSelectedDate.length > 0 ? (
                      leavesForSelectedDate.map((leave) => (
                        <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <User className="h-8 w-8 text-gray-400" />
                            <div>
                              <p className="font-medium">{leave.first_name} {leave.last_name}</p>
                              <p className="text-sm text-gray-500">{leave.department}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="capitalize">{leave.type}</Badge>
                            <p className="text-sm text-gray-500 mt-1">{leave.days} days off</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No employees on leave for this date</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Please select a date to view leave details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* NEW: Approval Dialog with Comments */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Approve' : 'Reject'} Leave Request
            </DialogTitle>
            <DialogDescription>
              {selectedLeaveRequest && (
                <>
                  {approvalAction === 'approve' ? 'Approve' : 'Reject'} leave request for{' '}
                  <strong>{selectedLeaveRequest.first_name} {selectedLeaveRequest.last_name}</strong>
                  {' '}from {format(new Date(selectedLeaveRequest.start_date), 'MMM dd')} to{' '}
                  {format(new Date(selectedLeaveRequest.end_date), 'MMM dd, yyyy')}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedLeaveRequest && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div><strong>Type:</strong> <span className="capitalize">{selectedLeaveRequest.type}</span></div>
                  <div><strong>Days:</strong> {selectedLeaveRequest.days}</div>
                  <div><strong>Reason:</strong> {selectedLeaveRequest.reason}</div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="adminComments">
                Comments <span className="text-gray-500">(Optional)</span>
              </Label>
              <Textarea
                id="adminComments"
                placeholder={`Add a comment about this ${approvalAction === 'approve' ? 'approval' : 'rejection'}...`}
                value={adminComments}
                onChange={(e) => setAdminComments(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                This comment will be visible to the employee.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsApprovalDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitApproval}
              disabled={isSubmitting}
              variant={approvalAction === 'approve' ? 'default' : 'destructive'}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {approvalAction === 'approve' ? 'Approving...' : 'Rejecting...'}
                </>
              ) : (
                <>
                  {approvalAction === 'approve' ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  {approvalAction === 'approve' ? 'Approve' : 'Reject'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}