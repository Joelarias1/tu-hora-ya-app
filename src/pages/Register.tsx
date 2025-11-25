import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleAzureLogin = async () => {
    try {
      setLoading(true);
      await login();
      toast.success('¡Bienvenido! Completa tu perfil para continuar');
    } catch (error: any) {
      console.error('Error en login:', error);
      toast.error(error.message || 'No se pudo conectar con Azure AD');
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
                Inicia sesión con tu cuenta Microsoft para comenzar
              </CardDescription>
            </CardHeader>
            <CardContent>
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

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Proceso simple
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-primary">1.</span>
                    <p>Inicia sesión con tu cuenta Microsoft</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-primary">2.</span>
                    <p>Completa tu perfil con tus datos</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-primary">3.</span>
                    <p>¡Listo! Ya puedes usar Tu Hora Ya!</p>
                  </div>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Usamos autenticación segura de Microsoft para proteger tu cuenta
                </p>
              </div>

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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
