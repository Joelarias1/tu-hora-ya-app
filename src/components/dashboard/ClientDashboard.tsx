import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Star,
  CalendarCheck,
  CalendarX,
  History
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Booking {
  id: string;
  professional: string;
  profession: string;
  date: string;
  time: string;
  location: string;
  status: 'confirmada' | 'pendiente' | 'completada' | 'cancelada';
  price: number;
  image?: string;
}

export const ClientDashboard = () => {
  const navigate = useNavigate();

  // Mock data - en producción vendría del backend
  const stats = {
    upcoming: 2,
    completed: 8,
    cancelled: 1,
  };

  const upcomingBookings: Booking[] = [
    {
      id: '1',
      professional: 'Valentina Morales',
      profession: 'Psicóloga',
      date: 'Lunes 2 Dic',
      time: '10:00',
      location: 'Online',
      status: 'confirmada',
      price: 45000,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    },
    {
      id: '2',
      professional: 'Gabriel Herrera',
      profession: 'Dentista',
      date: 'Miércoles 4 Dic',
      time: '15:30',
      location: 'Providencia, Santiago',
      status: 'pendiente',
      price: 50000,
      image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400',
    },
  ];

  const pastBookings: Booking[] = [
    {
      id: '3',
      professional: 'Laura Fernández',
      profession: 'Programadora',
      date: '15 Nov',
      time: '14:00',
      location: 'Online',
      status: 'completada',
      price: 40000,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    },
    {
      id: '4',
      professional: 'Isabella Rojas',
      profession: 'Abogada',
      date: '10 Nov',
      time: '11:00',
      location: 'Las Condes, Santiago',
      status: 'completada',
      price: 60000,
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    },
  ];

  const getStatusBadge = (status: Booking['status']) => {
    const variants: Record<Booking['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      confirmada: { variant: 'default', label: 'Confirmada' },
      pendiente: { variant: 'secondary', label: 'Pendiente' },
      completada: { variant: 'outline', label: 'Completada' },
      cancelada: { variant: 'destructive', label: 'Cancelada' },
    };
    return variants[status];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Mis Reservas
        </h1>
        <p className="text-muted-foreground">
          Gestiona tus citas y encuentra nuevos profesionales
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CalendarCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.upcoming}</p>
                <p className="text-xs text-muted-foreground">Próximas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <History className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <CalendarX className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.cancelled}</p>
                <p className="text-xs text-muted-foreground">Canceladas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximas Citas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Próximas Citas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => {
                const statusInfo = getStatusBadge(booking.status);
                return (
                  <div
                    key={booking.id}
                    className="flex items-center gap-4 p-4 border rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <img
                      src={booking.image}
                      alt={booking.professional}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold truncate">{booking.professional}</p>
                        <Badge variant={statusInfo.variant} className="text-xs">
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{booking.profession}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {booking.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {booking.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {booking.location}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${booking.price.toLocaleString('es-CL')}</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No tienes citas próximas</p>
              <Button onClick={() => navigate('/')}>
                <Search className="w-4 h-4 mr-2" />
                Buscar Profesionales
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Historial de Citas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pastBookings.map((booking) => {
              const statusInfo = getStatusBadge(booking.status);
              return (
                <div
                  key={booking.id}
                  className="flex items-center gap-4 p-3 border rounded-lg"
                >
                  <img
                    src={booking.image}
                    alt={booking.professional}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{booking.professional}</p>
                    <p className="text-xs text-muted-foreground">
                      {booking.profession} · {booking.date}
                    </p>
                  </div>
                  <Badge variant={statusInfo.variant} className="text-xs">
                    {statusInfo.label}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Star className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
          <Button variant="outline" className="w-full mt-4">
            Ver Todo el Historial
          </Button>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">¿Necesitas un profesional?</h3>
              <p className="text-sm text-muted-foreground">
                Explora nuestra red de profesionales verificados y agenda tu próxima cita
              </p>
            </div>
            <Button onClick={() => navigate('/')}>
              Buscar Ahora
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
