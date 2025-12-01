import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService, profesionService, rubroService, profesionalService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Save, X, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { ProfileHeader, PersonalInfoForm, ProfessionalInfoForm } from '@/components/profile';

interface UserData {
  id_usuario: string;
  nombre: string;
  apellido: string;
  correo: string;
  foto_url: string | null;
  id_rol?: string | null;
  telefono?: string | null;
  userType?: 'cliente' | 'profesional' | null;
  profesion?: string;
  rubro?: string;
  descripcion?: string;
  experiencia?: string;
  pais?: string;
  ciudad?: string;
  servicios?: string[];
}

interface Profesion {
  id_profesion: string;
  nombre: string;
}

interface Rubro {
  id_rubro: string;
  nombre: string;
}

export default function Profile() {
  const { user, updateUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [profesiones, setProfesiones] = useState<Profesion[]>([]);
  const [rubros, setRubros] = useState<Rubro[]>([]);
  const [newService, setNewService] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    foto_url: '',
    userType: 'cliente' as 'cliente' | 'profesional',
  });

  const [profesionalData, setProfesionalData] = useState({
    profesion: '',
    rubro: '',
    descripcion: '',
    experiencia: '',
    pais: 'Chile',
    ciudad: '',
    servicios: [] as string[],
    precioHora: 0,
  });

  // Cargar datos del usuario y datos profesionales desde el backend
  const loadUserData = useCallback(async () => {
    if (!user) {
      setInitialLoading(false);
      return;
    }

    const userData = user as UserData;

    // Establecer datos básicos del usuario desde el contexto
    setFormData({
      nombre: userData.nombre || '',
      apellido: userData.apellido || '',
      telefono: userData.telefono || '',
      foto_url: userData.foto_url || '',
      userType: userData.userType || 'cliente',
    });

    // Cargar datos profesionales desde el backend
    try {
      // Obtener lista de profesionales y buscar el que corresponde a este usuario
      const profesionales = await profesionalService.list() as any[];
      const miPerfil = profesionales.find((p: any) => p.id_usuario === userData.id_usuario);

      if (miPerfil) {
        // Parsear servicios (vienen como string separado por comas)
        const serviciosList = miPerfil.servicios
          ? miPerfil.servicios.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [];

        setProfesionalData({
          profesion: miPerfil.id_profesion || '',
          rubro: miPerfil.id_rubro || '',
          descripcion: miPerfil.descripcion || '',
          experiencia: miPerfil.experiencia || '',
          pais: miPerfil.pais || 'Chile',
          ciudad: miPerfil.ciudad || '',
          servicios: serviciosList,
          precioHora: miPerfil.precioHora || 0,
        });

        // Si encontramos datos profesionales, el usuario es profesional
        if (!userData.userType || userData.userType !== 'profesional') {
          setFormData(prev => ({ ...prev, userType: 'profesional' }));
        }
      } else {
        // Sin datos profesionales, usar datos del contexto/localStorage
        setProfesionalData({
          profesion: userData.profesion || '',
          rubro: userData.rubro || '',
          descripcion: userData.descripcion || '',
          experiencia: userData.experiencia || '',
          pais: userData.pais || 'Chile',
          ciudad: userData.ciudad || '',
          servicios: userData.servicios || [],
          precioHora: 0,
        });
      }
    } catch (error) {
      console.error('Error cargando datos profesionales:', error);
      // En caso de error, usar datos del contexto/localStorage
      setProfesionalData({
        profesion: userData.profesion || '',
        rubro: userData.rubro || '',
        descripcion: userData.descripcion || '',
        experiencia: userData.experiencia || '',
        pais: userData.pais || 'Chile',
        ciudad: userData.ciudad || '',
        servicios: userData.servicios || [],
        precioHora: 0,
      });
    } finally {
      setInitialLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [profesionesData, rubrosData] = await Promise.all([
          profesionService.list().catch(() => []),
          rubroService.list().catch(() => []),
        ]);
        setProfesiones(profesionesData as Profesion[]);
        setRubros(rubrosData as Rubro[]);
      } catch (error) {
        console.error('Error cargando opciones:', error);
      }
    };
    loadOptions();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfesionalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfesionalData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfesionalDataChange = (field: keyof typeof profesionalData, value: string) => {
    if (field === 'precioHora') {
      setProfesionalData((prev) => ({ ...prev, [field]: parseInt(value) || 0 }));
    } else {
      setProfesionalData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const addService = () => {
    if (newService.trim() && !profesionalData.servicios.includes(newService.trim())) {
      setProfesionalData((prev) => ({
        ...prev,
        servicios: [...prev.servicios, newService.trim()],
      }));
      setNewService('');
    }
  };

  const removeService = (service: string) => {
    setProfesionalData((prev) => ({
      ...prev,
      servicios: prev.servicios.filter((s) => s !== service),
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      toast.error('Nombre y apellido son obligatorios');
      return;
    }

    setLoading(true);
    const userData = user as UserData;

    try {
      const requestData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono || undefined,
        foto_url: formData.foto_url,
        userType: formData.userType,
        ...(formData.userType === 'profesional' && {
          id_profesion: profesionalData.profesion,
          id_rubro: profesionalData.rubro,
          descripcion: profesionalData.descripcion,
          experiencia: profesionalData.experiencia,
          pais: profesionalData.pais,
          ciudad: profesionalData.ciudad,
          servicios: profesionalData.servicios.join(', '),
          precioHora: profesionalData.precioHora,
        }),
      };

      console.log('=== ENVIANDO REQUEST ===');
      console.log('profesionalData.precioHora:', profesionalData.precioHora);
      console.log('requestData:', JSON.stringify(requestData, null, 2));
      console.log('========================');

      const response: any = await authService.completeOnboarding(userData.id_usuario, requestData);

      if (response.success) {
        // Actualizar con datos de la respuesta del servidor
        const serverUpdatedUser: UserData = {
          id_usuario: response.id_usuario || userData.id_usuario,
          nombre: response.nombre || formData.nombre,
          apellido: response.apellido || formData.apellido,
          correo: response.correo || userData.correo,
          foto_url: response.foto_url || formData.foto_url || null,
          id_rol: response.id_rol || userData.id_rol,
          userType: formData.userType,
          telefono: formData.telefono || null,
        };

        // Actualizar contexto de autenticación
        updateUserData(serverUpdatedUser);

        // Guardar solo datos básicos en localStorage (sin datos profesionales)
        localStorage.setItem('user', JSON.stringify(serverUpdatedUser));

        toast.success('Perfil actualizado exitosamente');
        setIsEditing(false);
      } else {
        toast.error('No se pudo actualizar el perfil en el servidor');
      }
    } catch (error) {
      console.error('Error al actualizar perfil en servidor:', error);
      toast.error('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Recargar datos del backend al cancelar
    loadUserData();
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Debes iniciar sesión para ver tu perfil
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const userData = user as UserData;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona tu información personal y preferencias
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <ProfileHeader
              nombre={formData.nombre}
              apellido={formData.apellido}
              correo={userData.correo}
              fotoUrl={formData.foto_url}
              profesion={profesionalData.profesion}
              isProfesional={formData.userType === 'profesional'}
              isEditing={isEditing}
              onEdit={() => setIsEditing(true)}
            />
            <Separator />
            <CardContent className="pt-6">
              <PersonalInfoForm
                formData={formData}
                correo={userData.correo}
                isEditing={isEditing}
                onChange={handleInputChange}
                onUserTypeChange={(value) => setFormData((prev) => ({ ...prev, userType: value }))}
              />
            </CardContent>
          </Card>

          {formData.userType === 'profesional' && (
            <ProfessionalInfoForm
              data={profesionalData}
              profesiones={profesiones}
              rubros={rubros}
              isEditing={isEditing}
              newService={newService}
              onDataChange={handleProfesionalDataChange}
              onInputChange={handleProfesionalInputChange}
              onNewServiceChange={setNewService}
              onAddService={addService}
              onRemoveService={removeService}
            />
          )}

          {isEditing && (
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button onClick={handleCancel} disabled={loading} variant="outline" className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={loading} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
