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
  const { t, language } = useLanguage();

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
      toast.success(language === 'es' ? '¡Bienvenido de nuevo a ArcusHR!' : 'Welcome back to ArcusHR!');
      
      // Redirect based on user type selection
      if (userType === 'manager') {
        router.push('/dashboard');
      } else {
        router.push('/employee/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || (language === 'es' ? 'Error al iniciar sesión' : 'Login failed'));
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
      toast.success(language === 'es' ? '¡Empresa registrada con éxito!' : 'Company registered successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || (language === 'es' ? 'Error al registrarse' : 'Registration failed'));
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
          <p className="text-gray-800 mt-4 font-medium">{language === 'es' ? 'Cargando...' : 'Loading...'}</p>
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
            {language === 'es' 
              ? 'Plataforma completa de Gestión de Recursos Humanos para empresas modernas'
              : 'Complete Human Resource Management platform for modern businesses'}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Features Section */}
          <div className="space-y-8 animate-slide-in-left">
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-8">
                {language === 'es' ? '¿Por qué elegir ArcusHR?' : 'Why Choose ArcusHR?'}
              </h2>
              <div className="grid gap-8">
                <div className="flex items-start space-x-6 hover-lift p-6 bg-white/80 rounded-2xl shadow-lg border border-blue-100">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Users className="h-8 w-8 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{language === 'es' ? 'Gestión de Empleados' : 'Employee Management'}</h3>
                    <p className="text-gray-800 mt-2 font-medium">{language === 'es' 
                      ? 'Perfiles completos de empleados, estructura organizativa y gestión de roles'
                      : 'Complete employee profiles, organizational structure, and role management'}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6 hover-lift p-6 bg-white/80 rounded-2xl shadow-lg border border-emerald-100">
                  <div className="bg-emerald-100 p-3 rounded-xl">
                    <BarChart3 className="h-8 w-8 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{language === 'es' ? 'Análisis y Reportes' : 'Analytics & Reports'}</h3>
                    <p className="text-gray-800 mt-2 font-medium">{language === 'es'
                      ? 'Informes completos y análisis para decisiones basadas en datos'
                      : 'Comprehensive reporting and analytics for data-driven decisions'}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6 hover-lift p-6 bg-white/80 rounded-2xl shadow-lg border border-gray-200">
                  <div className="bg-gray-100 p-3 rounded-xl">
                    <Shield className="h-8 w-8 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{language === 'es' ? 'Seguro y Conforme' : 'Secure & Compliant'}</h3>
                    <p className="text-gray-800 mt-2 font-medium">{language === 'es'
                      ? 'Seguridad de nivel empresarial con control de acceso basado en roles'
                      : 'Enterprise-grade security with role-based access control'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Auth Forms */}
          <div className="lg:max-w-md animate-slide-in-right">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm hover-glow">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">{language === 'es' ? 'Comenzar' : 'Get Started'}</CardTitle>
                <CardDescription className="text-lg text-gray-800 font-semibold">
                  {language === 'es' 
                    ? 'Inicia sesión en tu cuenta o crea una nueva empresa'
                    : 'Sign in to your account or create a new company'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signin" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2 bg-blue-50">
                    <TabsTrigger value="signin" className="data-[state=active]:bg-white data-[state=active]:shadow-md font-semibold text-gray-900">
                      {language === 'es' ? 'Iniciar Sesión' : 'Sign In'}
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:shadow-md font-semibold text-gray-900">
                      {language === 'es' ? 'Registrarse' : 'Sign Up'}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signin" className="space-y-6">
                    {/* User Type Selection */}
                    <div className="space-y-3">
                      <Label className="text-gray-900 font-semibold">{language === 'es' ? 'Soy un:' : 'I am a:'}</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant={userType === 'manager' ? 'default' : 'outline'}
                          onClick={() => setUserType('manager')}
                          className="h-12 hover-scale font-semibold"
                        >
                          <Building2 className="h-4 w-4 mr-2" />
                          {language === 'es' ? 'Gerente' : 'Manager'}
                        </Button>
                        <Button
                          type="button"
                          variant={userType === 'employee' ? 'default' : 'outline'}
                          onClick={() => setUserType('employee')}
                          className="h-12 hover-scale font-semibold"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          {language === 'es' ? 'Empleado' : 'Employee'}
                        </Button>
                      </div>
                    </div>

                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-900 font-semibold">{language === 'es' ? 'Correo' : 'Email'}</Label>
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
                        <Label htmlFor="password" className="text-gray-900 font-semibold">{language === 'es' ? 'Contraseña' : 'Password'}</Label>
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
                            {language === 'es' ? 'Iniciando sesión...' : 'Signing in...'}
                          </>
                        ) : (
                          language === 'es' ? 'Iniciar Sesión' : 'Sign In'
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="space-y-6">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-gray-900 font-semibold">{language === 'es' ? 'Nombre de la Empresa' : 'Company Name'}</Label>
                        <Input
                          id="company"
                          name="company"
                          placeholder="Acme Corporation"
                          required
                          className="h-12 hover-glow focus:scale-105 transition-all duration-200 border-gray-300 text-gray-900 placeholder:text-gray-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industry" className="text-gray-900 font-semibold">{language === 'es' ? 'Industria' : 'Industry'}</Label>
                        <Select value={industry} onValueChange={setIndustry}>
                          <SelectTrigger className="h-12 hover-glow border-gray-300 text-gray-900">
                            <SelectValue placeholder={language === 'es' ? 'Selecciona una opción' : 'Select industry'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technology">{language === 'es' ? 'Tecnología' : 'Technology'}</SelectItem>
                            <SelectItem value="finance">{language === 'es' ? 'Finanzas' : 'Finance'}</SelectItem>
                            <SelectItem value="healthcare">{language === 'es' ? 'Salud' : 'Healthcare'}</SelectItem>
                            <SelectItem value="manufacturing">{language === 'es' ? 'Manufactura' : 'Manufacturing'}</SelectItem>
                            <SelectItem value="retail">{language === 'es' ? 'Comercio' : 'Retail'}</SelectItem>
                            <SelectItem value="other">{language === 'es' ? 'Otra' : 'Other'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-email" className="text-gray-900 font-semibold">{language === 'es' ? 'Correo del Administrador' : 'Admin Email'}</Label>
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
                        <Label htmlFor="admin-password" className="text-gray-900 font-semibold">{language === 'es' ? 'Contraseña' : 'Password'}</Label>
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
                            {language === 'es' ? 'Creando Empresa...' : 'Creating Company...'}
                          </>
                        ) : (
                          language === 'es' ? 'Crear Empresa' : 'Create Company'
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