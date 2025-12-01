import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  DollarSign,
  Star,
  Users,
  TrendingUp,
  Settings,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Appointment {
  id: string;
  client: string;
  service: string;
  date: string;
  time: string;
  duration: string;
  status: 'confirmada' | 'pendiente' | 'completada' | 'cancelada';
  price: number;
}

export const ProfessionalDashboard = () => {
  const navigate = useNavigate();

  // Mock data - en producción vendría del backend
  const stats = {
    totalBookings: 127,
    monthlyEarnings: 3450000,
    averageRating: 4.9,
    totalReviews: 89,
    pendingRequests: 3,
    completedThisMonth: 24,
  };

  const todayAppointments: Appointment[] = [
    {
      id: '1',
      client: 'Andrea López',
      service: 'Consulta inicial',
      date: 'Hoy',
      time: '09:00',
      duration: '1 hora',
      status: 'confirmada',
      price: 45000,
    },
    {
      id: '2',
      client: 'Roberto Guzmán',
      service: 'Seguimiento',
      date: 'Hoy',
      time: '11:00',
      duration: '45 min',
      status: 'confirmada',
      price: 35000,
    },
    {
      id: '3',
      client: 'Carolina Flores',
      service: 'Consulta inicial',
      date: 'Hoy',
      time: '15:00',
      duration: '1 hora',
      status: 'pendiente',
      price: 45000,
    },
  ];

  const pendingRequests: Appointment[] = [
    {
      id: '4',
      client: 'Martín Soto',
      service: 'Consulta inicial',
      date: 'Mañana',
      time: '10:00',
      duration: '1 hora',
      status: 'pendiente',
      price: 45000,
    },
    {
      id: '5',
      client: 'Fernanda Díaz',
      service: 'Seguimiento',
      date: 'Viernes 6 Dic',
      time: '16:00',
      duration: '45 min',
      status: 'pendiente',
      price: 35000,
    },
  ];

  const getStatusIcon = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmada':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pendiente':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'completada':
        return <CheckCircle className="w-4 h-4 text-muted-foreground" />;
      case 'cancelada':
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Mi Agenda
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus citas y servicios profesionales
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/perfil')}>
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </Button>
          <Button>
            <Calendar className="w-4 h-4 mr-2" />
            Gestionar Disponibilidad
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos del Mes</p>
                <p className="text-2xl font-bold">
                  ${stats.monthlyEarnings.toLocaleString('es-CL')}
                </p>
                <p className="text-xs text-green-500 mt-1">+12% vs mes anterior</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Citas Completadas</p>
                <p className="text-2xl font-bold">{stats.completedThisMonth}</p>
                <p className="text-xs text-muted-foreground mt-1">Este mes</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valoración</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  {stats.averageRating}
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </p>
                <p className="text-xs text-muted-foreground mt-1">{stats.totalReviews} reseñas</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Solicitudes</p>
                <p className="text-2xl font-bold">{stats.pendingRequests}</p>
                <p className="text-xs text-yellow-500 mt-1">Pendientes</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Users className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Citas de Hoy */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Citas de Hoy
              </CardTitle>
              <Badge variant="secondary">
                {todayAppointments.length} citas
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center gap-4 p-4 border rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-[80px]">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">{apt.time}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{apt.client}</p>
                      {getStatusIcon(apt.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {apt.service} · {apt.duration}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${apt.price.toLocaleString('es-CL')}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Solicitudes Pendientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Solicitudes Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div key={req.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{req.client}</p>
                    <Badge variant="outline" className="text-xs">
                      {req.date}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {req.service} · {req.time}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" className="flex-1">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Aceptar
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <XCircle className="w-3 h-3 mr-1" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">Disponibilidad</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm">Precios</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Star className="w-5 h-5" />
              <span className="text-sm">Reseñas</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm">Estadísticas</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10 flex-shrink-0">
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
  );
};
