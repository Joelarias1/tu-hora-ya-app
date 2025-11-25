import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

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

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calendar className="w-10 h-10 text-primary" />
              <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Tu Hora Ya!
              </span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Iniciar Sesión</h1>
            <p className="text-muted-foreground">
              Accede a tu cuenta para gestionar tus reservas
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bienvenido de vuelta</CardTitle>
              <CardDescription>
                Inicia sesión con tu cuenta de Microsoft
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={handleAzureLogin}
                  className="w-full"
                  size="lg"
                  disabled={isLoggingIn || loading}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
                      Iniciar sesión con Microsoft
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                  ¿No tienes cuenta?{" "}
                  <button
                    onClick={() => navigate("/registro")}
                    className="text-primary font-medium hover:underline"
                  >
                    Regístrate aquí
                  </button>
                </p>
              </div>

              <div className="mt-4 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
                <p className="font-medium mb-1">Autenticación segura:</p>
                <p>Usamos Azure Active Directory para proteger tu cuenta</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
