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
import { useLanguage } from '@/contexts/language-context';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [industry, setIndustry] = useState('');
  const [userType, setUserType] = useState<'manager' | 'employee'>('manager');
  const router = useRouter();
  const { user, loading, login, register } = useAuth();
  const { t } = useLanguage();

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
      toast.success(t('loginSuccess'));
      
      // Redirect based on user type selection
      if (userType === 'manager') {
        router.push('/dashboard');
      } else {
        router.push('/employee/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || t('loginError'));
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
      toast.success(t('createSuccess'));
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="bg-gradient-primary p-4 rounded-2xl mx-auto mb-6 w-fit">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3 text-gradient">ArcusHR</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto"></div>
          <p className="text-gray-800 mt-4 font-medium">{t('loading')}...</p>
        </div>
      </div>
    );
  }

  // Don't render auth forms if user is authenticated
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gradient-primary p-4 rounded-2xl mr-4 shadow-lg">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 text-gradient">ArcusHR</h1>
          </div>
          <p className="text-xl text-gray-800 max-w-2xl mx-auto font-medium">
            Complete Human Resource Management platform for modern businesses
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Features Section */}
          <div className="space-y-8 animate-slide-in-left">
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-8">
                Why Choose ArcusHR?
              </h2>
              <div className="grid gap-8">
                <div className="flex items-start space-x-6 hover-lift p-6 bg-white/80 rounded-2xl shadow-lg border border-blue-100">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Users className="h-8 w-8 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{t('employeeManagement')}</h3>
                    <p className="text-gray-800 mt-2 font-medium">Complete employee profiles, organizational structure, and role management</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6 hover-lift p-6 bg-white/80 rounded-2xl shadow-lg border border-emerald-100">
                  <div className="bg-emerald-100 p-3 rounded-xl">
                    <BarChart3 className="h-8 w-8 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Analytics & {t('reports')}</h3>
                    <p className="text-gray-800 mt-2 font-medium">Comprehensive reporting and analytics for data-driven decisions</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6 hover-lift p-6 bg-white/80 rounded-2xl shadow-lg border border-gray-200">
                  <div className="bg-gray-100 p-3 rounded-xl">
                    <Shield className="h-8 w-8 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Secure & Compliant</h3>
                    <p className="text-gray-800 mt-2 font-medium">Enterprise-grade security with role-based access control</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Auth Forms */}
          <div className="lg:max-w-md animate-slide-in-right">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm hover-glow">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Get Started</CardTitle>
                <CardDescription className="text-lg text-gray-800 font-semibold">
                  {t('signInToAccount')} or create a new company
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signin" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2 bg-blue-50">
                    <TabsTrigger value="signin" className="data-[state=active]:bg-white data-[state=active]:shadow-md font-semibold text-gray-900">
                      {t('signIn')}
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:shadow-md font-semibold text-gray-900">
                      {t('signUp')}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signin" className="space-y-6">
                    {/* User Type Selection */}
                    <div className="space-y-3">
                      <Label className="text-gray-900 font-semibold">I am a:</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant={userType === 'manager' ? 'default' : 'outline'}
                          onClick={() => setUserType('manager')}
                          className="h-12 hover-scale font-semibold"
                        >
                          <Building2 className="h-4 w-4 mr-2" />
                          Manager
                        </Button>
                        <Button
                          type="button"
                          variant={userType === 'employee' ? 'default' : 'outline'}
                          onClick={() => setUserType('employee')}
                          className="h-12 hover-scale font-semibold"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Employee
                        </Button>
                      </div>
                    </div>

                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-900 font-semibold">{t('email')}</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder={userType === 'manager' ? 'admin@company.com' : 'employee@company.com'}
                          required
                          className="h-12 hover-glow focus:scale-105 transition-all duration-200 border-gray-300 text-gray-900 placeholder:text-gray-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-900 font-semibold">{t('password')}</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          required
                          className="h-12 hover-glow focus:scale-105 transition-all duration-200 border-gray-300 text-gray-900 placeholder:text-gray-600"
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
                          t('signIn')
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="space-y-6">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-gray-900 font-semibold">{t('companyName')}</Label>
                        <Input
                          id="company"
                          name="company"
                          placeholder="Acme Corporation"
                          required
                          className="h-12 hover-glow focus:scale-105 transition-all duration-200 border-gray-300 text-gray-900 placeholder:text-gray-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industry" className="text-gray-900 font-semibold">{t('industry')}</Label>
                        <Select value={industry} onValueChange={setIndustry}>
                          <SelectTrigger className="h-12 hover-glow border-gray-300 text-gray-900">
                            <SelectValue placeholder={t('selectOption')} />
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
                        <Label htmlFor="admin-email" className="text-gray-900 font-semibold">Admin {t('email')}</Label>
                        <Input
                          id="admin-email"
                          name="admin-email"
                          type="email"
                          placeholder="admin@company.com"
                          required
                          className="h-12 hover-glow focus:scale-105 transition-all duration-200 border-gray-300 text-gray-900 placeholder:text-gray-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-password" className="text-gray-900 font-semibold">{t('password')}</Label>
                        <Input
                          id="admin-password"
                          name="admin-password"
                          type="password"
                          placeholder="••••••••"
                          required
                          className="h-12 hover-glow focus:scale-105 transition-all duration-200 border-gray-300 text-gray-900 placeholder:text-gray-600"
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
                          t('createCompany')
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