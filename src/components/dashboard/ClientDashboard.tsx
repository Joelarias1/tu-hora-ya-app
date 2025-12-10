import { useEffect, useState } from "react";
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
  History,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// 👇 ajusta la ruta según tu proyecto
import { useAuth } from "../../context/AuthContext";

// servicios
import { citaService, profesionalService } from "@/services/api";

interface Booking {
  id: string;
  professional: string;
  profession: string;
  date: string;
  time: string;
  location: string;
  status: "confirmada" | "pendiente" | "completada" | "cancelada";
  price: number;
  image?: string;
}

// lo que devuelve /bff/cita/cliente/{id}
interface CitaApi {
  id_cita: string;
  id_usuario_cliente: string;
  id_usuario_profesional: string;
  fecha: string; // ej: "2025-12-02"
  hora: string;  // "10:00"
  comentario: string;
  calificacion: string;
  id_tipo_cita: string | null;
  id_pago: string;
}

// lo que devuelve /bff/usuarioprofesional/{id}
interface UsuarioProfesionalApi {
  id_usuario_profesional: string;
  nombre?: string;
  apellido?: string;
  id_profesion?: string;
  ciudad?: string;
  pais?: string;
  foto_url?: string;
  precioHora?: number;
}

export const ClientDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth(); // 👈 de aquí sacamos el id del cliente

  const [loading, setLoading] = useState(true);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    upcoming: 0,
    completed: 0,
    cancelled: 0,
  });

  const getStatusBadge = (status: Booking["status"]) => {
    const variants: Record<
      Booking["status"],
      { variant: "default" | "secondary" | "destructive" | "outline"; label: string }
    > = {
      confirmada: { variant: "default", label: "Confirmada" },
      pendiente: { variant: "secondary", label: "Pendiente" },
      completada: { variant: "outline", label: "Completada" },
      cancelada: { variant: "destructive", label: "Cancelada" },
    };
    return variants[status];
  };

  useEffect(() => {
    const loadBookings = async () => {
      if (!user) {
        // si no hay usuario logueado, no hacemos nada
        setLoading(false);
        return;
      }

      // intenta resolver el id_cliente desde el objeto user
      const idCliente =
        (user as any).id_usuario_cliente ||
        (user as any).id_usuario ||
        (user as any).id ||
        null;

      if (!idCliente) {
        console.warn("No se encontró id de cliente en el user");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1) Traer citas del cliente
        const citas: CitaApi[] = await citaService.getByCliente(idCliente) as CitaApi[];

        if (!Array.isArray(citas) || citas.length === 0) {
          setUpcomingBookings([]);
          setPastBookings([]);
          setStats({ upcoming: 0, completed: 0, cancelled: 0 });
          setLoading(false);
          return;
        }

        // 2) Traer info de todos los profesionales involucrados (en paralelo)
        const profesionalIds = Array.from(
          new Set(citas.map((c) => c.id_usuario_profesional).filter(Boolean))
        );

        const profMap = new Map<string, UsuarioProfesionalApi>();

        await Promise.all(
          profesionalIds.map(async (idProf) => {
            try {
              const data: any = await profesionalService.get(idProf);
              profMap.set(idProf, data as UsuarioProfesionalApi);
            } catch (err) {
              console.error("Error cargando profesional", idProf, err);
            }
          })
        );

        const now = new Date();

        const upcoming: Booking[] = [];
        const past: Booking[] = [];

        for (const cita of citas) {
          const prof = profMap.get(cita.id_usuario_profesional);

          const professionalName = prof
            ? `${prof.nombre || ""} ${prof.apellido || ""}`.trim() || "Profesional"
            : "Profesional";

          const profession = prof?.id_profesion || "Profesional";

          const location =
            [prof?.ciudad, prof?.pais].filter(Boolean).join(", ") ||
            "Sin ubicación";

          const price = prof?.precioHora ?? 0;

          const image =
            prof?.foto_url ||
            (prof
              ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${prof.id_usuario_profesional}`
              : undefined);

          // parsear fecha/hora para ver si es futura o pasada
          let isFuture = true;
          try {
            const dateTime = new Date(`${cita.fecha}T${cita.hora}:00`);
            if (!isNaN(dateTime.getTime())) {
              isFuture = dateTime.getTime() >= now.getTime();
            }
          } catch {
            // si falla, la consideramos futura por defecto
            isFuture = true;
          }

          const status: Booking["status"] = isFuture ? "confirmada" : "completada";

          const booking: Booking = {
            id: cita.id_cita,
            professional: professionalName,
            profession,
            date: cita.fecha, // si quieres después lo formateamos bonito
            time: cita.hora,
            location,
            status,
            price,
            image,
          };

          if (isFuture) {
            upcoming.push(booking);
          } else {
            past.push(booking);
          }
        }

        // ordenar por fecha si quieres (más próximas primero)
        const sortByDate = (a: Booking, b: Booking) => {
          const d1 = new Date(`${a.date}T${a.time}:00`);
          const d2 = new Date(`${b.date}T${b.time}:00`);
          return d1.getTime() - d2.getTime();
        };

        upcoming.sort(sortByDate);
        past.sort(sortByDate).reverse(); // historial: últimas primero

        setUpcomingBookings(upcoming);
        setPastBookings(past);

        setStats({
          upcoming: upcoming.length,
          completed: past.length,
          cancelled: 0, // por ahora siempre 0 porque no hay campo en la BD
        });
      } catch (error: any) {
        console.error("Error cargando citas del cliente:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error?.message || "No se pudieron cargar tus reservas. Intenta más tarde.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [user, toast]);

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
                <p className="text-2xl font-bold">
                  {loading ? "…" : stats.upcoming}
                </p>
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
                <p className="text-2xl font-bold">
                  {loading ? "…" : stats.completed}
                </p>
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
                <p className="text-2xl font-bold">
                  {loading ? "…" : stats.cancelled}
                </p>
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
          {loading ? (
            <div className="text-muted-foreground py-8 text-center">
              Cargando tus citas...
            </div>
          ) : upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => {
                const statusInfo = getStatusBadge(booking.status);
                return (
                  <div
                    key={booking.id}
                    className="flex items-center gap-4 p-4 border rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    {booking.image && (
                      <img
                        src={booking.image}
                        alt={booking.professional}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold truncate">
                          {booking.professional}
                        </p>
                        <Badge variant={statusInfo.variant} className="text-xs">
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {booking.profession}
                      </p>
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
                      <p className="font-semibold">
                        ${booking.price.toLocaleString("es-CL")}
                      </p>
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
              <p className="text-muted-foreground mb-4">
                No tienes citas próximas
              </p>
              <Button onClick={() => navigate("/")}>
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
          {loading ? (
            <div className="text-muted-foreground py-6 text-center">
              Cargando historial...
            </div>
          ) : pastBookings.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aún no tienes citas completadas.
            </p>
          ) : (
            <>
              <div className="space-y-3">
                {pastBookings.map((booking) => {
                  const statusInfo = getStatusBadge(booking.status);
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center gap-4 p-3 border rounded-lg"
                    >
                      {booking.image && (
                        <img
                          src={booking.image}
                          alt={booking.professional}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {booking.professional}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {booking.profession} · {booking.date} · {booking.time}
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
            </>
          )}
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
                Explora nuestra red de profesionales verificados y agenda tu
                próxima cita
              </p>
            </div>
            <Button onClick={() => navigate("/")}>
              Buscar Ahora
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
