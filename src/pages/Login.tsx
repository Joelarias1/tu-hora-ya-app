import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement authentication system
    console.log("Login attempt:", email);
    navigate("/dashboard");
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
                Ingresa tus credenciales para continuar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.cl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Ingresar
                </Button>
              </form>

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
                <p className="font-medium mb-1">Nota de Desarrollo:</p>
                <p>La autenticación completa se implementará en la próxima fase.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
