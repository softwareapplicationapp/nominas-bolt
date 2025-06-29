'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar,
  Building,
  Edit,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/language-context';

interface EmployeeProfile {
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
  salary?: number;
  status: string;
  role: string;
}

export default function EmployeeProfilePage() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employees/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (!response.ok) throw new Error('Error al cargar perfil');
      
      const data = await response.json();
      setProfile(data);
      setFormData({
        firstName: data.first_name,
        lastName: data.last_name,
        phone: data.phone || '',
        location: data.location || ''
      });
    } catch (error: any) {
      toast.error('Error al cargar perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/employees/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar perfil');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setEditing(false);
      toast.success('¡Perfil actualizado con éxito!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile.phone || '',
        location: profile.location || ''
      });
    }
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-700 font-semibold">Perfil no encontrado</p>
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
            <h1 className="text-3xl font-bold text-gray-900 text-gradient">Mi Perfil</h1>
            <p className="text-gray-800 mt-2 font-semibold">Ver y actualizar tu información personal</p>
          </div>
          
          <div className="flex space-x-2">
            {editing ? (
              <>
                <Button variant="outline" onClick={handleCancel} className="border-gray-300 text-gray-800 hover:text-gray-900 font-semibold">
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving} className="btn-success">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)} className="btn-primary">
                <Edit className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <Card className="lg:col-span-1 animate-scale-in card-glow border-gray-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
                {profile.first_name[0]}{profile.last_name[0]}
              </div>
              <CardTitle className="text-xl text-gray-900">
                {profile.first_name} {profile.last_name}
              </CardTitle>
              <CardDescription className="text-lg text-gray-800 font-medium">
                {profile.position}
              </CardDescription>
              <Badge variant="default" className="w-fit mx-auto bg-blue-600 text-white font-semibold">
                {profile.employee_id}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover-scale border border-blue-200">
                <Building className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-700 font-semibold">Departamento</p>
                  <p className="font-bold text-gray-900">{profile.department}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg hover-scale border border-emerald-200">
                <Calendar className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm text-gray-700 font-semibold">Fecha de Inicio</p>
                  <p className="font-bold text-gray-900">{format(new Date(profile.start_date), 'dd MMM, yyyy', { locale: language === 'es' ? es : undefined })}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg hover-scale border border-amber-200">
                <User className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm text-gray-700 font-semibold">Estado</p>
                  <Badge variant={profile.status === 'active' ? 'default' : 'secondary'} className={profile.status === 'active' ? 'badge-active' : 'badge-inactive'}>
                    {profile.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="lg:col-span-2 animate-slide-in-right card-glow border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <User className="h-5 w-5 text-blue-600" />
                <span>Información Personal</span>
              </CardTitle>
              <CardDescription className="text-gray-800 font-medium">
                {editing ? 'Actualiza tus datos personales' : 'Tu información personal actual'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-900 font-semibold">Nombre</Label>
                  {editing ? (
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="border-gray-300 text-gray-900"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-900 font-medium">{profile.first_name}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-900 font-semibold">Apellido</Label>
                  {editing ? (
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="border-gray-300 text-gray-900"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-900 font-medium">{profile.last_name}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900 font-semibold">Correo</Label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <Mail className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-800 font-medium">{profile.email}</span>
                    <Badge variant="outline" className="ml-auto border-gray-300 text-gray-700">Solo Lectura</Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-900 font-semibold">Teléfono</Label>
                  {editing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="Ingresa número de teléfono"
                      className="border-gray-300 text-gray-900"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <Phone className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-900 font-medium">{profile.phone || 'No proporcionado'}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="position" className="text-gray-900 font-semibold">Cargo</Label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <Briefcase className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-800 font-medium">{profile.position}</span>
                    <Badge variant="outline" className="ml-auto border-gray-300 text-gray-700">Solo Lectura</Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-900 font-semibold">Ubicación</Label>
                  {editing ? (
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Ingresa ubicación"
                      className="border-gray-300 text-gray-900"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <MapPin className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-900 font-medium">{profile.location || 'No proporcionada'}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <Card className="animate-slide-in-up card-glow border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Detalles de Empleo</CardTitle>
            <CardDescription className="text-gray-800 font-medium">
              Tu información laboral y detalles de la empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover-scale border border-blue-200">
                <User className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-700 font-semibold">ID de Empleado</p>
                  <p className="font-bold text-blue-900">{profile.employee_id}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-lg hover-scale border border-emerald-200">
                <Building className="h-6 w-6 text-emerald-600" />
                <div>
                  <p className="text-sm text-emerald-700 font-semibold">Departamento</p>
                  <p className="font-bold text-emerald-900">{profile.department}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover-scale border border-purple-200">
                <Calendar className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-700 font-semibold">Años de Servicio</p>
                  <p className="font-bold text-purple-900">
                    {Math.floor((new Date().getTime() - new Date(profile.start_date).getTime()) / (1000 * 60 * 60 * 24 * 365))} años
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}