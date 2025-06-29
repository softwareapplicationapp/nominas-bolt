'use client';

import { useState, useEffect } from 'react';
import { Building2, Users, BarChart3, Shield, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [industry, setIndustry] = useState('');
  const [userType, setUserType] = useState<'manager' | 'employee'>('manager');
  const router = useRouter();
  const { user, loading, login, register } = useAuth();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (!loading && user) {
      // Redirect based on user role
      if (user.role === 'admin' || user.role === 'hr_manager') {
        router.push('/dashboard');
      } else {
        router.push('/employee/dashboard');
      }
    }
  }, [loading, user, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await login(email, password);
      toast.success('Welcome back to ArcusHR!');
      
      // Redirect based on user type selection
      if (userType === 'manager') {
        router.push('/dashboard');
      } else {
        router.push('/employee/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('admin-email') as string;
    const password = formData.get('admin-password') as string;
    const companyName = formData.get('company') as string;

    try {
      await register(email, password, companyName, industry);
      toast.success('Company registered successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="bg-gradient-primary p-4 rounded-2xl mx-auto mb-6 w-fit animate-pulse-glow">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-3 text-gradient">ArcusHR</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render auth forms if user is authenticated
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gradient-primary p-4 rounded-2xl mr-4 animate-float">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-slate-800 text-gradient">ArcusHR</h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Complete Human Resource Management platform for modern businesses
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Features Section */}
          <div className="space-y-8 animate-slide-in-left">
            <div>
              <h2 className="text-3xl font-semibold text-slate-800 mb-8">
                Why Choose ArcusHR?
              </h2>
              <div className="grid gap-8">
                <div className="flex items-start space-x-6 hover-lift p-6 bg-white/50 rounded-2xl glass">
                  <div className="bg-blue-100 p-3 rounded-xl animate-float">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg">Employee Management</h3>
                    <p className="text-slate-600 mt-2">Complete employee profiles, organizational structure, and role management</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6 hover-lift p-6 bg-white/50 rounded-2xl glass">
                  <div className="bg-green-100 p-3 rounded-xl animate-float">
                    <BarChart3 className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg">Analytics & Reports</h3>
                    <p className="text-slate-600 mt-2">Comprehensive reporting and analytics for data-driven decisions</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6 hover-lift p-6 bg-white/50 rounded-2xl glass">
                  <div className="bg-purple-100 p-3 rounded-xl animate-float">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg">Secure & Compliant</h3>
                    <p className="text-slate-600 mt-2">Enterprise-grade security with role-based access control</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Auth Forms */}
          <div className="lg:max-w-md animate-slide-in-right">
            <Card className="shadow-2xl border-0 glass hover-glow">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold text-slate-800 mb-2">Get Started</CardTitle>
                <CardDescription className="text-lg text-slate-700 font-medium">
                  Sign in to your account or create a new company
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signin" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100/50">
                    <TabsTrigger value="signin" className="data-[state=active]:bg-white data-[state=active]:shadow-md font-semibold">
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:shadow-md font-semibold">
                      Sign Up
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signin" className="space-y-6">
                    {/* User Type Selection */}
                    <div className="space-y-3">
                      <Label className="text-slate-700 font-medium">I am a:</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant={userType === 'manager' ? 'default' : 'outline'}
                          onClick={() => setUserType('manager')}
                          className="h-12 hover-scale font-medium"
                        >
                          <Building2 className="h-4 w-4 mr-2" />
                          Manager
                        </Button>
                        <Button
                          type="button"
                          variant={userType === 'employee' ? 'default' : 'outline'}
                          onClick={() => setUserType('employee')}
                          className="h-12 hover-scale font-medium"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Employee
                        </Button>
                      </div>
                    </div>

                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder={userType === 'manager' ? 'admin@company.com' : 'employee@company.com'}
                          required
                          className="h-12 hover-glow focus:scale-105 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          required
                          className="h-12 hover-glow focus:scale-105 transition-all duration-200"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full h-12 btn-primary text-lg font-semibold" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Signing in...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="space-y-6">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-slate-700 font-medium">Company Name</Label>
                        <Input
                          id="company"
                          name="company"
                          placeholder="Acme Corporation"
                          required
                          className="h-12 hover-glow focus:scale-105 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industry" className="text-slate-700 font-medium">Industry</Label>
                        <Select value={industry} onValueChange={setIndustry}>
                          <SelectTrigger className="h-12 hover-glow">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-email" className="text-slate-700 font-medium">Admin Email</Label>
                        <Input
                          id="admin-email"
                          name="admin-email"
                          type="email"
                          placeholder="admin@company.com"
                          required
                          className="h-12 hover-glow focus:scale-105 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-password" className="text-slate-700 font-medium">Password</Label>
                        <Input
                          id="admin-password"
                          name="admin-password"
                          type="password"
                          placeholder="••••••••"
                          required
                          className="h-12 hover-glow focus:scale-105 transition-all duration-200"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full h-12 btn-success text-lg font-semibold" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Creating Company...
                          </>
                        ) : (
                          'Create Company'
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}