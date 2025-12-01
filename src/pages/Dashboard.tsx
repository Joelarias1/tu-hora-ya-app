import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { ClientDashboard } from "@/components/dashboard/ClientDashboard";
import { ProfessionalDashboard } from "@/components/dashboard/ProfessionalDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserData {
  userType?: 'cliente' | 'profesional' | null;
}

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Obtener tipo de usuario
  const userType = user && 'userType' in user ? (user as UserData).userType : null;

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
              <Button onClick={() => navigate('/login')}>
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
        {userType === 'profesional' ? (
          <ProfessionalDashboard />
        ) : (
          <ClientDashboard />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
