import { useEffect, useState } from "react";
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
import { useToast } from "@/hooks/use-toast";

// hooks / servicios
import { useAuth } from "@/context/AuthContext";
import {
  citaService,
  profesionalService,
  usuarioService,          // 👈 usamos usuarioService, no clienteService
} from "@/services/api";

interface Appointment {
  id: string;
  client: string;
  service: string;
  date: string;      // yyyy-MM-dd
  time: string;      // HH:mm
  duration: string;
  status: "confirmada" | "pendiente" | "completada" | "cancelada";
  price: number;
}

interface CitaApi {
  id_cita: string;
  id_usuario_cliente: string;        // guarda id_usuario
  id_usuario_profesional: string;
  fecha: string;
  hora: string;
  comentario: string;
  calificacion: string;
  id_tipo_cita: string | null;
  id_pago: string;
}

interface ClienteApi {
  id_usuario: string;                // 👈 viene de /usuario
  nombre?: string;
  apellido?: string;
}

interface ProfesionalApi {
  id_usuario_profesional: string;
  id_usuario: string;
  precioHora?: number;
  precio_hora?: number;
}

export const ProfessionalDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    monthlyEarnings: 0,
    averageRating: 0,
    totalReviews: 0,
    pendingRequests: 0,
    completedThisMonth: 0,
  });

  const getStatusIcon = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmada":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pendiente":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "completada":
        return <CheckCircle className="w-4 h-4 text-muted-foreground" />;
      case "cancelada":
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // 1) id_usuario del usuario logueado
      const userId =
        (user as any).id_usuario ||
        (user as any).id ||
        null;

      if (!userId) {
        console.warn("No se encontró id_usuario en el user");
        setLoading(false);
        toast({
          variant: "destructive",
          title: "No se pudo cargar tu agenda",
          description:
            "No se encontró el identificador de usuario en tu sesión.",
        });
        return;
      }

      try {
        setLoading(true);

        // 2) Buscar registro en usuario_profesional vinculado a este usuario
        const profesionales = (await profesionalService.list()) as ProfesionalApi[];

        const profesionalActual = profesionales.find(
          (p) => p.id_usuario === userId
        );

        if (!profesionalActual) {
          console.warn(
            "No se encontró registro en usuario_profesional para el usuario",
            userId
          );
          setLoading(false);
          toast({
            variant: "destructive",
            title: "No se encontró tu perfil profesional",
            description:
              "Asegúrate de haber completado el onboarding como profesional.",
          });
          return;
        }

        const idProfesional = profesionalActual.id_usuario_profesional;
        console.log("👨‍⚕️ id_usuario_profesional detectado:", idProfesional);

        // 3) Citas del profesional usando id_usuario_profesional
        const citas = (await citaService.getByProfesional(
          idProfesional
        )) as CitaApi[];

        if (!Array.isArray(citas) || citas.length === 0) {
          setTodayAppointments([]);
          setPendingRequests([]);
          setStats({
            totalBookings: 0,
            monthlyEarnings: 0,
            averageRating: 0,
            totalReviews: 0,
            pendingRequests: 0,
            completedThisMonth: 0,
          });
          setLoading(false);
          return;
        }

        // 4) Precio base desde usuario_profesional
        let precioBase = 0;
        try {
          precioBase =
            (profesionalActual.precioHora ??
              profesionalActual.precio_hora ??
              0) as number;
        } catch (e) {
          console.warn("No se pudo determinar precio_hora, usando 0");
        }

        // 5) Mapear clientes — OJO: usamos /usuario, no /usuariocliente
        const clienteIds = Array.from(
          new Set(citas.map((c) => c.id_usuario_cliente).filter(Boolean))
        );
        const clienteMap = new Map<string, ClienteApi>();

        await Promise.all(
          clienteIds.map(async (idCli) => {
            try {
              const cli = (await usuarioService.get(idCli)) as ClienteApi;
              clienteMap.set(idCli, cli);
            } catch (err) {
              console.error("Error cargando cliente (usuario)", idCli, err);
              // si falla, simplemente usaremos el id como nombre
            }
          })
        );

        const now = new Date();
        const todayY = now.getFullYear();
        const todayM = now.getMonth();
        const todayD = now.getDate();

        const currentMonth = todayM;
        const currentYear = todayY;

        const allAppointments: Appointment[] = [];
        const reviews: number[] = [];

        for (const cita of citas) {
          const cli = clienteMap.get(cita.id_usuario_cliente);

          const clientName =
            cli && (cli.nombre || cli.apellido)
              ? `${cli.nombre ?? ""} ${cli.apellido ?? ""}`.trim()
              : cita.id_usuario_cliente || "Cliente";

          const dateTime = new Date(`${cita.fecha}T${cita.hora}:00`);

          let isToday = false;
          let isFuture = true;
          if (!isNaN(dateTime.getTime())) {
            isToday =
              dateTime.getFullYear() === todayY &&
              dateTime.getMonth() === todayM &&
              dateTime.getDate() === todayD;
            isFuture = dateTime.getTime() >= now.getTime();
          }

          let status: Appointment["status"];
          if (isFuture) {
            status = isToday ? "confirmada" : "pendiente";
          } else {
            status = "completada";
          }

          if (cita.calificacion) {
            const v = parseFloat(cita.calificacion);
            if (!isNaN(v)) {
              reviews.push(v);
            }
          }

          const appointment: Appointment = {
            id: cita.id_cita,
            client: clientName,
            service: cita.id_tipo_cita || "Sesión",
            date: cita.fecha,
            time: cita.hora,
            duration: "1 hora",
            status,
            price: precioBase,
          };

          allAppointments.push(appointment);
        }

        // 6) separar citas de hoy y pendientes
        const todayList = allAppointments.filter((a) => {
          const d = new Date(`${a.date}T${a.time}:00`);
          return (
            !isNaN(d.getTime()) &&
            d.getFullYear() === todayY &&
            d.getMonth() === todayM &&
            d.getDate() === todayD
          );
        });

        const pendingList = allAppointments.filter((a) => {
          const d = new Date(`${a.date}T${a.time}:00`);
          return !isNaN(d.getTime()) && d.getTime() > now.getTime();
        });

        // 7) stats
        const totalBookings = allAppointments.length;

        const completedThisMonth = allAppointments.filter((a) => {
          const d = new Date(`${a.date}T${a.time}:00`);
          return (
            !isNaN(d.getTime()) &&
            d.getFullYear() === currentYear &&
            d.getMonth() === currentMonth &&
            a.status === "completada"
          );
        }).length;

        const monthlyEarnings = completedThisMonth * precioBase;

        let averageRating = 0;
        let totalReviews = 0;
        if (reviews.length > 0) {
          const sum = reviews.reduce((acc, v) => acc + v, 0);
          averageRating = Number((sum / reviews.length).toFixed(1));
          totalReviews = reviews.length;
        }

        setTodayAppointments(todayList);
        setPendingRequests(pendingList);
        setStats({
          totalBookings,
          monthlyEarnings,
          averageRating,
          totalReviews,
          pendingRequests: pendingList.length,
          completedThisMonth,
        });
      } catch (error: any) {
        console.error("Error cargando agenda del profesional:", error);
        toast({
          variant: "destructive",
          title: "Error al cargar tu agenda",
          description:
            error?.message || "Intenta nuevamente en unos minutos.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, toast]);

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
          <Button variant="outline" onClick={() => navigate("/perfil")}>
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
                <p className="text-sm text-muted-foreground">
                  Ingresos del Mes
                </p>
                <p className="text-2xl font-bold">
                  {loading
                    ? "…"
                    : `$${stats.monthlyEarnings.toLocaleString("es-CL")}`}
                </p>
                <p className="text-xs text-green-500 mt-1">
                  +0% vs mes anterior
                </p>
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
                <p className="text-sm text-muted-foreground">
                  Citas Completadas
                </p>
                <p className="text-2xl font-bold">
                  {loading ? "…" : stats.completedThisMonth}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Este mes
                </p>
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
                  {loading ? "…" : stats.averageRating}
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {loading ? "…" : `${stats.totalReviews} reseñas`}
                </p>
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
                <p className="text-2xl font-bold">
                  {loading ? "…" : stats.pendingRequests}
                </p>
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
                {loading ? "…" : `${todayAppointments.length} citas`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-muted-foreground py-6 text-center">
                Cargando citas de hoy...
              </div>
            ) : todayAppointments.length === 0 ? (
              <div className="text-muted-foreground py-6 text-center">
                No tienes citas agendadas para hoy.
              </div>
            ) : (
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
                      <p className="font-semibold">
                        ${apt.price.toLocaleString("es-CL")}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            {loading ? (
              <div className="text-muted-foreground py-4 text-center">
                Cargando solicitudes...
              </div>
            ) : pendingRequests.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No tienes solicitudes pendientes en este momento.
              </p>
            ) : (
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
                      <Button size="sm" className="flex-1" disabled>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Aceptar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        disabled
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              <h3 className="font-semibold mb-2">
                Funcionalidades Completas Próximamente
              </h3>
              <p className="text-sm text-muted-foreground">
                Este panel ya está leyendo tus citas reales. Más adelante podrás gestionar estados
                (aceptar / rechazar), ver estadísticas avanzadas y responder a clientes desde aquí.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
