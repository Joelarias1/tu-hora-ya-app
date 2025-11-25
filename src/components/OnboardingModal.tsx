import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserCircle, Camera, Users, Briefcase } from 'lucide-react';

export const OnboardingModal = () => {
  const { needsOnboarding, user, updateUserData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    foto_url: '',
    userType: 'cliente' as 'cliente' | 'profesional',
  });

  useEffect(() => {
    if (needsOnboarding && user) {
      setOpen(true);
      // Pre-llenar con datos de Azure AD si están disponibles
      if ('username' in user) {
        const nameParts = user.name?.split(' ') || [];
        setFormData({
          nombre: nameParts[0] || '',
          apellido: nameParts.slice(1).join(' ') || '',
          telefono: '',
          foto_url: '',
        });
      }
    } else {
      setOpen(false);
    }
  }, [needsOnboarding, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !('id_usuario' in user)) {
      toast({
        title: 'Error',
        description: 'No se pudo identificar el usuario',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      // Llamar al backend para completar onboarding
      const response: any = await authService.completeOnboarding(
        user.id_usuario,
        {
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono || undefined,
          foto_url: formData.foto_url || undefined,
          userType: formData.userType,
        }
      );

      if (response.success) {
        // Actualizar datos del usuario en el contexto
        updateUserData({
          id_usuario: response.id_usuario,
          nombre: response.nombre,
          apellido: response.apellido,
          correo: response.correo,
          foto_url: response.foto_url,
          id_rol: response.id_rol,
        });

        toast({
          title: '¡Perfil completado!',
          description: 'Tus datos han sido guardados exitosamente',
        });

        setOpen(false);
        navigate('/dashboard');
      } else {
        throw new Error(response.message || 'Error al completar onboarding');
      }
    } catch (error: any) {
      console.error('Error al completar onboarding:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar tu perfil. Intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Permitir que el usuario continue sin completar el onboarding
    setOpen(false);
    navigate('/');
  };

  if (!needsOnboarding || !user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <UserCircle className="w-8 h-8 text-primary" />
            ¡Bienvenido a Tu Hora Ya!
          </DialogTitle>
          <DialogDescription className="text-base">
            Completa tu perfil para comenzar a usar la plataforma
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Foto de perfil */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {formData.foto_url ? (
                  <img
                    src={formData.foto_url}
                    alt="Perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCircle className="w-16 h-16 text-muted-foreground" />
                )}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90"
                onClick={() => {
                  // TODO: Implementar subida de foto
                  console.log('Subir foto');
                }}
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Tu nombre"
              required
            />
          </div>

          {/* Apellido */}
          <div className="space-y-2">
            <Label htmlFor="apellido">
              Apellido <span className="text-red-500">*</span>
            </Label>
            <Input
              id="apellido"
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              placeholder="Tu apellido"
              required
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono (opcional)</Label>
            <Input
              id="telefono"
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="+56 9 1234 5678"
            />
          </div>

          {/* Email (solo lectura) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={'correo' in user ? user.correo : user.username}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Tipo de Usuario */}
          <div className="space-y-3">
            <Label>
              Tipo de cuenta <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={formData.userType}
              onValueChange={(value) => setFormData({ ...formData, userType: value as 'cliente' | 'profesional' })}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="cliente"
                  id="cliente"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="cliente"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Users className="mb-3 h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Cliente</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Buscar y reservar servicios
                    </div>
                  </div>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="profesional"
                  id="profesional"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="profesional"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Briefcase className="mb-3 h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Profesional</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Ofrecer mis servicios
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleSkip}
              disabled={submitting}
            >
              Completar después
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!formData.nombre || !formData.apellido || submitting}
            >
              {submitting ? 'Guardando...' : 'Guardar y continuar'}
            </Button>
          </div>
        </form>

        {/* Indicador de progreso */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Paso 1 de 1: Información básica
        </div>
      </DialogContent>
    </Dialog>
  );
};
