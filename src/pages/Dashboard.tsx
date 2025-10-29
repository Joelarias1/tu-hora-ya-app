import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Users, Star, TrendingUp, Clock } from "lucide-react";

const Dashboard = () => {
  // Mock data for professional dashboard
  const stats = {
    totalBookings: 127,
    monthlyEarnings: 3450000,
    averageRating: 4.9,
    completedSessions: 98,
  };

  const upcomingBookings = [
    { id: 1, client: "Andrea López", date: "Lunes 27 Ene", time: "09:00", service: "Terapia individual" },
    { id: 2, client: "Roberto Guzmán", date: "Lunes 27 Ene", time: "10:00", service: "Terapia de pareja" },
    { id: 3, client: "Carolina Flores", date: "Martes 28 Ene", time: "09:00", service: "Manejo del estrés" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Panel de Control
          </h1>
          <p className="text-muted-foreground">
            Bienvenido a tu espacio profesional
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Reservas
              </CardTitle>
              <Calendar className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-secondary">+12%</span> vs mes anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ingresos del Mes
              </CardTitle>
              <DollarSign className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.monthlyEarnings.toLocaleString('es-CL')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-secondary">+8%</span> vs mes anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valoración Promedio
              </CardTitle>
              <Star className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating}</div>
              <p className="text-xs text-muted-foreground mt-1">
                De 127 reseñas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sesiones Completadas
              </CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedSessions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Este mes
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming Bookings */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Próximas Reservas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{booking.client}</p>
                        <p className="text-sm text-muted-foreground">{booking.service}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{booking.date}</p>
                      <p className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        {booking.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Ver Todas las Reservas
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Gestionar Disponibilidad
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <DollarSign className="w-4 h-4 mr-2" />
                Actualizar Precios
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Star className="w-4 h-4 mr-2" />
                Ver Reseñas
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Ver Estadísticas
              </Button>
              <Button className="w-full justify-start" variant="default">
                <Users className="w-4 h-4 mr-2" />
                Editar Mi Perfil
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Funcionalidades Completas Próximamente</h3>
                <p className="text-sm text-muted-foreground">
                  Este panel será completamente funcional en la próxima fase. Podrás gestionar tu calendario,
                  ver estadísticas detalladas, responder a clientes y mucho más. Por ahora, esta es una vista previa
                  de las funcionalidades que estarán disponibles.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
