import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { ClientDashboard } from "@/components/dashboard/ClientDashboard";
import { ProfessionalDashboard } from "@/components/dashboard/ProfessionalDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserData {
  userType?: "cliente" | "profesional" | null;
  user_type?: "cliente" | "profesional" | null;
  id_rol?: string;
}

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const resolveUserType = (u: any): "cliente" | "profesional" | null => {
    if (!u) return null;

    // 1) Si ya viene mapeado a camelCase
    if (u.userType === "cliente" || u.userType === "profesional") {
      return u.userType;
    }

    // 2) Si viene como user_type desde el backend
    if (u.user_type === "cliente" || u.user_type === "profesional") {
      return u.user_type;
    }

    // 3) Inferir desde el rol
    if (u.id_rol === "ROL_PROFESIONAL") return "profesional";
    if (u.id_rol === "ROL_CLIENTE") return "cliente";

    return null;
  };

  const userType = resolveUserType(user as UserData);

  // Si no está autenticado, mostrar mensaje
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <LogIn className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Inicia Sesión</h2>
              <p className="text-muted-foreground mb-6">
                Debes iniciar sesión para acceder a tu panel de control
              </p>
              <Button onClick={() => navigate("/login")}>
                Iniciar Sesión
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {userType === "profesional" ? (
          <ProfessionalDashboard />
        ) : (
          <ClientDashboard />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
