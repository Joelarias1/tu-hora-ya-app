import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, Clock, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleAzureLogin = async () => {
    try {
      setIsLoggingIn(true);
      await login();

      toast({
        title: "Login exitoso",
        description: "Bienvenido de vuelta",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error en login:", error);
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: "No se pudo iniciar sesión con Azure AD",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
          {/* Left Side - Branding & Benefits */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Gestiona tus citas de forma{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-600">
                  inteligente
                </span>
              </h2>
              <p className="text-xl text-foreground/70">
                Accede a tu panel de control y administra todas tus reservas en un solo lugar.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent/10 mt-1">
                  <CheckCircle className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Reservas instantáneas</h3>
                  <p className="text-sm text-foreground/60">
                    Agenda y gestiona citas en tiempo real
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent/10 mt-1">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Disponibilidad 24/7</h3>
                  <p className="text-sm text-foreground/60">
                    Accede a tu cuenta cuando lo necesites
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent/10 mt-1">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Seguridad garantizada</h3>
                  <p className="text-sm text-foreground/60">
                    Protegemos tu información con Azure AD
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="text-center lg:text-left mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Iniciar Sesión</h1>
              <p className="text-foreground/60">
                Bienvenido de vuelta
              </p>
            </div>

            <Card className="border-2 shadow-xl">
              <CardContent className="pt-8 pb-8">
                <div className="space-y-4">
                  {/* Microsoft Login Button */}
                  <Button
                    onClick={handleAzureLogin}
                    className="w-full h-14 text-base font-medium"
                    size="lg"
                    disabled={isLoggingIn || loading}
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 21 21" fill="none">
                          <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                          <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                          <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                          <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                        </svg>
                        Continuar con Microsoft
                      </>
                    )}
                  </Button>
                </div>

                {/* Security Note */}
                <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-xl">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-accent flex-shrink-0" />
                    <p className="text-foreground/70">
                      Autenticación segura con Azure AD
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help Text */}
            <div className="text-center mt-6 space-y-2">
              <p className="text-sm text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <button 
                  onClick={() => navigate("/registro")}
                  className="text-accent hover:underline font-medium"
                >
                  Regístrate aquí
                </button>
              </p>
              <p className="text-sm text-muted-foreground">
                ¿Problemas para iniciar sesión?{" "}
                <button className="text-accent hover:underline font-medium">
                  Contáctanos
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
