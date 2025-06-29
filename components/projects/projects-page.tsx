'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Plus, 
  Calendar, 
  Users, 
  Clock, 
  Target,
  FolderKanban,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

const projects = [
  {
    id: 1,
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website with modern design',
    status: 'In Progress',
    priority: 'High',
    progress: 75,
    startDate: '2024-01-01',
    endDate: '2024-03-15',
    team: ['Sarah Wilson', 'Emily Chen', 'John Doe'],
    budget: 50000,
    spent: 37500
  },
  {
    id: 2,
    name: 'Mobile App Development',
    description: 'Native mobile application for iOS and Android platforms',
    status: 'Planning',
    priority: 'Medium',
    progress: 15,
    startDate: '2024-02-01',
    endDate: '2024-08-30',
    team: ['Sarah Wilson', 'Michael Brown'],
    budget: 120000,
    spent: 18000
  },
  {
    id: 3,
    name: 'HR System Integration',
    description: 'Integration of new HR management system with existing tools',
    status: 'Completed',
    priority: 'High',
    progress: 100,
    startDate: '2023-10-01',
    endDate: '2024-01-15',
    team: ['Emily Chen', 'John Doe'],
    budget: 75000,
    spent: 72000
  },
];

const tasks = [
  {
    id: 1,
    title: 'Design Homepage Mockup',
    project: 'Website Redesign',
    assignee: 'Emily Chen',
    status: 'Completed',
    priority: 'High',
    dueDate: '2024-01-20'
  },
  {
    id: 2,
    title: 'Implement User Authentication',
    project: 'Mobile App Development',
    assignee: 'Sarah Wilson',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2024-02-15'
  },
  {
    id: 3,
    title: 'Database Migration',
    project: 'HR System Integration',
    assignee: 'John Doe',
    status: 'Completed',
    priority: 'Medium',
    dueDate: '2024-01-10'
  },
];

export default function ProjectsPage() {
  const [selectedTab, setSelectedTab] = useState('projects');

  const handleCreateProject = () => {
    toast.success('Project created successfully!');
  };

  const activeProjects = projects.filter(p => p.status === 'In Progress' || p.status === 'Planning').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">Manage projects and track team progress</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Set up a new project with team assignments and timeline
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input id="projectName" placeholder="Website Redesign" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe the project objectives and scope"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Input id="budget" type="number" placeholder="50000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamLead">Team Lead</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team lead" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sarah">Sarah Wilson</SelectItem>
                    <SelectItem value="john">John Doe</SelectItem>
                    <SelectItem value="emily">Emily Chen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleCreateProject}>Create Project</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{activeProjects}</div>
                <p className="text-sm text-gray-600">Active Projects</p>
              </div>
              <FolderKanban className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{completedProjects}</div>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  ${totalBudget.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Total Budget</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  ${totalSpent.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {project.description}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={
                        project.status === 'Completed' ? 'default' :
                        project.status === 'In Progress' ? 'secondary' : 'outline'
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Priority</p>
                      <Badge 
                        variant={
                          project.priority === 'High' ? 'destructive' :
                          project.priority === 'Medium' ? 'secondary' : 'outline'
                        }
                        className="mt-1"
                      >
                        {project.priority}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-gray-500">Budget</p>
                      <p className="font-medium">${project.budget.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Team Members</p>
                    <div className="flex -space-x-2">
                      {project.team.map((member, index) => (
                        <Avatar key={index} className="w-8 h-8 border-2 border-white">
                          <AvatarFallback className="text-xs">
                            {member.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(project.endDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>
                Track individual tasks and assignments across all projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        task.status === 'Completed' ? 'bg-green-500' : 
                        task.status === 'In Progress' ? 'bg-blue-500' : 'bg-gray-300'
                      }`}></div>
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-gray-500">{task.project}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{task.assignee}</p>
                        <p className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                      </div>
                      <Badge 
                        variant={
                          task.status === 'Completed' ? 'default' :
                          task.status === 'In Progress' ? 'secondary' : 'outline'
                        }
                      >
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
              <CardDescription>
                Visual timeline of all projects and their milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {projects.map((project, index) => (
                  <div key={project.id} className="relative">
                    {index !== projects.length - 1 && (
                      <div className="absolute left-4 top-12 w-0.5 h-20 bg-gray-200"></div>
                    )}
                    <div className="flex items-start space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        project.status === 'Completed' ? 'bg-green-500' :
                        project.status === 'In Progress' ? 'bg-blue-500' : 'bg-gray-300'
                      }`}>
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{project.name}</h3>
                          <Badge variant="outline">
                            {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mt-1">{project.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant={
                            project.status === 'Completed' ? 'default' :
                            project.status === 'In Progress' ? 'secondary' : 'outline'
                          }>
                            {project.status}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Team: {project.team.length} members
                          </span>
                          <span className="text-sm text-gray-500">
                            Budget: ${project.budget.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}