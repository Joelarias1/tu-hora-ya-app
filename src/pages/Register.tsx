import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    userType: "cliente",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement registration system
    console.log("Registration attempt:", formData);
    navigate(formData.userType === "profesional" ? "/dashboard" : "/profesionales");
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
                Completa tus datos para comenzar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    placeholder="Juan Pérez"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                <Button type="submit" className="w-full" size="lg" variant="accent">
                  Crear Cuenta
                </Button>
              </form>

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

              <div className="mt-4 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
                <p className="font-medium mb-1">Nota de Desarrollo:</p>
                <p>El registro completo se implementará en la próxima fase.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
