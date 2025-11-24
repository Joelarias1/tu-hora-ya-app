import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user, loading: authLoading } = useAuth();
  const { usuarios, clientes, profesionales } = useApi();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    foto_url: "",
    userType: "cliente",
  });

  /**
   * Paso 1: Login con Azure AD
   */
  const handleAzureLogin = async () => {
    try {
      setLoading(true);
      await login();

      toast({
        title: '¡Bienvenido!',
        description: 'Has iniciado sesión con Azure AD correctamente',
      });
    } catch (error: any) {
      console.error('Error en login:', error);
      toast({
        variant: 'destructive',
        title: 'Error al iniciar sesión',
        description: error.message || 'No se pudo conectar con Azure AD',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Paso 2: Registro en el backend
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Debes iniciar sesión con Azure AD primero',
      });
      return;
    }

    try {
      setLoading(true);

      // Generar IDs únicos
      const userId = crypto.randomUUID();
      const tipoUsuarioId = crypto.randomUUID();

      // Separar nombre y apellido
      const [nombre, ...apellidoParts] = formData.nombre.split(' ');
      const apellido = apellidoParts.join(' ') || formData.apellido;

      // Crear usuario
      const usuarioData = {
        id_usuario: userId,
        nombre: nombre || formData.nombre,
        apellido: apellido,
        correo: formData.email,
        clave: 'AZURE_AD', // No se usa clave porque usamos Azure AD
        id_rol: '1', // Rol por defecto
        foto_url: formData.foto_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + userId, // Avatar por defecto
      };

      console.log('Creando usuario:', usuarioData);
      await usuarios.create(userId, usuarioData);

      // Crear cliente o profesional según el tipo
      if (formData.userType === 'cliente') {
        const clienteData = {
          id_usuario_cliente: tipoUsuarioId,
          id_usuario: userId,
        };
        console.log('Creando cliente:', clienteData);
        await clientes.create(tipoUsuarioId, clienteData);
      } else {
        const profesionalData = {
          id_usuario_profesional: tipoUsuarioId,
          id_usuario: userId,
          id_profesion: '1', // TODO: Seleccionar profesión
          id_servicio_profesional: '1',
          id_rubro: '1',
        };
        console.log('Creando profesional:', profesionalData);
        await profesionales.create(tipoUsuarioId, profesionalData);
      }

      toast({
        title: '¡Registro exitoso!',
        description: 'Tu cuenta ha sido creada correctamente',
      });

      // Redirigir según tipo de usuario
      navigate(formData.userType === "profesional" ? "/dashboard" : "/profesionales");

    } catch (error: any) {
      console.error('Error en registro:', error);
      toast({
        variant: 'destructive',
        title: 'Error al registrar',
        description: error.message || 'No se pudo crear tu cuenta',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calendar className="w-10 h-10 text-primary" />
              <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Tu Hora Ya!
              </span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Crear Cuenta</h1>
            <p className="text-muted-foreground">
              Únete a la comunidad de Tu Hora Ya!
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Regístrate gratis</CardTitle>
              <CardDescription>
                {!isAuthenticated ? 'Primero autentícate con tu cuenta Microsoft' : 'Completa tus datos para comenzar'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Paso 1: Login con Azure AD */}
              {!isAuthenticated ? (
                <div className="space-y-4">
                  <Button
                    onClick={handleAzureLogin}
                    disabled={loading || authLoading}
                    className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
                    size="lg"
                  >
                    {loading || authLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-5 w-5" viewBox="0 0 23 23">
                          <path fill="#f35325" d="M0 0h11v11H0z" />
                          <path fill="#81bc06" d="M12 0h11v11H12z" />
                          <path fill="#05a6f0" d="M0 12h11v11H0z" />
                          <path fill="#ffba08" d="M12 12h11v11H12z" />
                        </svg>
                        Iniciar sesión con Microsoft
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Usamos autenticación segura de Microsoft para proteger tu cuenta
                  </p>
                </div>
              ) : (
                <>
                  {/* Confirmación de autenticación */}
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md mb-4">
                    <p className="text-sm text-green-700">
                      ✓ Autenticado como <strong>{user?.username}</strong>
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input
                        id="nombre"
                        placeholder="Juan"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apellido">Apellido</Label>
                      <Input
                        id="apellido"
                        placeholder="Pérez"
                        value={formData.apellido}
                        onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.cl"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                <div className="space-y-2">
                  <Label htmlFor="userType">Me registro como</Label>
                  <Select
                    value={formData.userType}
                    onValueChange={(value) => setFormData({ ...formData, userType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cliente">Cliente (buscar profesionales)</SelectItem>
                      <SelectItem value="profesional">Profesional (ofrecer servicios)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                    <Button type="submit" disabled={loading} className="w-full" size="lg" variant="accent">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registrando...
                        </>
                      ) : (
                        'Crear Cuenta'
                      )}
                    </Button>
                  </form>
                </>
              )}

              <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                  ¿Ya tienes cuenta?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="text-primary font-medium hover:underline"
                  >
                    Inicia sesión aquí
                  </button>
                </p>
              </div>

              {!isAuthenticated && (
                <div className="mt-4 p-3 bg-muted rounded-md text-sm text-muted-foreground">
                  <p className="text-center">
                    Autenticación segura con Microsoft Azure AD
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
