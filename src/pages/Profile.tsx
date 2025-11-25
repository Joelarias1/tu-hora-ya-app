import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { User, Mail, Phone, Save, X, Edit2 } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface UserData {
  id_usuario: string;
  nombre: string;
  apellido: string;
  correo: string;
  foto_url: string | null;
  telefono?: string | null;
}

export default function Profile() {
  const { user, updateUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    foto_url: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: (user as UserData).nombre || '',
        apellido: (user as UserData).apellido || '',
        telefono: (user as UserData).telefono || '',
        foto_url: (user as UserData).foto_url || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      toast.error('Nombre y apellido son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const userId = (user as UserData).id_usuario;
      const response = await authService.completeOnboarding(userId, {
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono || undefined,
        foto_url: formData.foto_url,
      });

      if (response.success) {
        updateUserData({
          id_usuario: response.id_usuario,
          nombre: response.nombre,
          apellido: response.apellido,
          correo: response.correo,
          foto_url: response.foto_url,
          id_rol: response.id_rol,
        });

        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          localStorage.setItem(
            'user',
            JSON.stringify({
              ...userData,
              nombre: response.nombre,
              apellido: response.apellido,
              telefono: formData.telefono,
              foto_url: response.foto_url,
            })
          );
        }

        toast.success('Perfil actualizado exitosamente');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        nombre: (user as UserData).nombre || '',
        apellido: (user as UserData).apellido || '',
        telefono: (user as UserData).telefono || '',
        foto_url: (user as UserData).foto_url || '',
      });
    }
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

  const userData = user as UserData;
  const initials = `${formData.nombre.charAt(0)}${formData.apellido.charAt(
    0
  )}`.toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona tu información personal y preferencias
          </p>
        </div>

        <div className="grid gap-6">
          {/* Información Personal Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border-2 border-primary">
                    {formData.foto_url && (
                      <AvatarImage
                        src={formData.foto_url}
                        alt={formData.nombre}
                      />
                    )}
                    <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">
                      {formData.nombre} {formData.apellido}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4" />
                      {userData.correo}
                    </CardDescription>
                  </div>
                </div>

                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Nombre
                  </Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Tu nombre"
                    className={!isEditing ? 'bg-muted' : ''}
                  />
                </div>

                {/* Apellido */}
                <div className="space-y-2">
                  <Label htmlFor="apellido" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Apellido
                  </Label>
                  <Input
                    id="apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Tu apellido"
                    className={!isEditing ? 'bg-muted' : ''}
                  />
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                  <Label htmlFor="telefono" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Teléfono
                  </Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="+56 9 1234 5678"
                    className={!isEditing ? 'bg-muted' : ''}
                  />
                </div>

                {/* Correo (no editable) */}
                <div className="space-y-2">
                  <Label htmlFor="correo" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Correo Electrónico
                  </Label>
                  <Input
                    id="correo"
                    value={userData.correo}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                </div>

                {/* URL de foto */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="foto_url">URL de Foto de Perfil</Label>
                  <Input
                    id="foto_url"
                    name="foto_url"
                    value={formData.foto_url}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="https://ejemplo.com/mi-foto.jpg"
                    className={!isEditing ? 'bg-muted' : ''}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ingresa la URL de una imagen para tu foto de perfil
                  </p>
                </div>
              </div>

              {/* Botones de acción */}
              {isEditing && (
                <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6 pt-6 border-t">
                  <Button
                    onClick={handleCancel}
                    disabled={loading}
                    variant="outline"
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
