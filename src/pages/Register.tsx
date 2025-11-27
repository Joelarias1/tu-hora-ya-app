import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, UserPlus, CheckCircle, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";

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

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
          {/* Left Side - Branding & Benefits */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Únete a la comunidad de{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-600">
                  profesionales
                </span>
              </h2>
              <p className="text-xl text-foreground/70">
                Crea tu cuenta en segundos y comienza a gestionar tus citas de forma inteligente.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent/10 mt-1">
                  <CheckCircle className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Registro rápido</h3>
                  <p className="text-sm text-foreground/60">
                    Solo necesitas tu cuenta de Microsoft
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent/10 mt-1">
                  <UserPlus className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Perfil personalizado</h3>
                  <p className="text-sm text-foreground/60">
                    Configura tu perfil como cliente o profesional
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent/10 mt-1">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">100% seguro</h3>
                  <p className="text-sm text-foreground/60">
                    Tus datos protegidos con Azure AD
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="text-center lg:text-left mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Regístrate</h1>
              <p className="text-foreground/60">
                Crea tu cuenta en segundos
              </p>
            </div>

            <Card className="border-2 shadow-xl">
              <CardContent className="pt-8 pb-8">
                <div className="space-y-4">
                  {/* Microsoft Register Button */}
                  <Button
                    onClick={handleAzureLogin}
                    disabled={loading || authLoading}
                    className="w-full h-14 text-base font-medium"
                    size="lg"
                  >
                    {loading || authLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 21 21" fill="none">
                          <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                          <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                          <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                          <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                        </svg>
                        Registrarse con Microsoft
                      </>
                    )}
                  </Button>

                  {/* Process Steps */}
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-3 text-muted-foreground font-medium">
                        Proceso simple
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex-shrink-0">
                        1
                      </span>
                      <p className="text-sm text-foreground/80">
                        Inicia sesión con Microsoft
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex-shrink-0">
                        2
                      </span>
                      <p className="text-sm text-foreground/80">
                        Completa tu perfil
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex-shrink-0">
                        3
                      </span>
                      <p className="text-sm text-foreground/80">
                        ¡Comienza a usar la plataforma!
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-3 text-muted-foreground font-medium">
                        o
                      </span>
                    </div>
                  </div>

                  {/* Login Button */}
                  <Button
                    variant="outline"
                    className="w-full h-14 text-base font-medium border-2"
                    onClick={() => navigate("/login")}
                  >
                    Ya tengo cuenta
                  </Button>
                </div>

                {/* Security Note */}
                <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-xl">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-accent flex-shrink-0" />
                    <p className="text-foreground/70">
                      Registro seguro con Azure AD
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
