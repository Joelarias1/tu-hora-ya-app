import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  Edit2,
  Trash2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// hooks / servicios
import { useAuth } from "@/context/AuthContext";
import {
  citaService,
  profesionalService,
  usuarioService,
} from "@/services/api";

interface Appointment {
  id: string;
  client: string;
  service: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  duration: string;
  status: "confirmada" | "pendiente" | "completada" | "cancelada";
  price: number;
}

interface CitaApi {
  id_cita: string;
  id_usuario_cliente: string;
  id_usuario_profesional: string;
  fecha: string;
  hora: string;
  comentario: string;
  calificacion: string;
  id_tipo_cita: string | null;
  id_pago: string;
}

interface ClienteApi {
  id_usuario: string;
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
  // ✅ profesionalId para crear disponibilidad
  const [idProfesional, setIdProfesional] = useState<string | null>(null);
  type TimeRange = { enabled: boolean; start: string; end: string };
  // ✅ Modal disponibilidad
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
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

  // ✅ Guardamos las citas reales (raw) para poder editar con seguridad
  const [citaById, setCitaById] = useState<Record<string, CitaApi>>({});

  // ✅ Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    fecha: "",
    hora: "",
    comentario: "",
    id_tipo_cita: "",
  });
  const [actionLoading, setActionLoading] = useState(false);

  // ✅ Delete confirm state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [availabilityForm, setAvailabilityForm] = useState({
    dateFrom: "",
    dateTo: "",
    durationMin: 60,
    id_tipo_cita: "DISPONIBILIDAD",
    comentario: "Bloque disponible",
    ranges: [
      { enabled: true, start: "09:00", end: "12:00" },
      { enabled: true, start: "14:00", end: "18:00" },
      { enabled: false, start: "19:00", end: "21:00" },
    ] as TimeRange[],
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

  const resolvedUserId = useMemo(() => {
    if (!user) return null;
    return (user as any).id_usuario || (user as any).id || null;
  }, [user]);

  //helpers de fechas
  const timeToMinutes = (t: string) => {
    const [hh, mm] = t.split(":").map((x) => parseInt(x, 10));
    if (Number.isNaN(hh) || Number.isNaN(mm)) return NaN;
    return hh * 60 + mm;
  };

  const minutesToTime = (m: number) => {
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const dateRangeInclusive = (from: string, to: string) => {
    const start = new Date(`${from}T00:00:00`);
    const end = new Date(`${to}T00:00:00`);
    const out: string[] = [];
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return out;

    const cur = new Date(start);
    while (cur.getTime() <= end.getTime()) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, "0");
      const d = String(cur.getDate()).padStart(2, "0");
      out.push(`${y}-${m}-${d}`);
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  };

  const makeId = () => {
    // crypto.randomUUID en navegadores modernos
    // fallback simple por si acaso
    return (globalThis.crypto as any)?.randomUUID
      ? (globalThis.crypto as any).randomUUID()
      : `cita_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  };

  const createAvailability = async () => {
    if (!idProfesional) {
      toast({
        variant: "destructive",
        title: "No se encontró tu id profesional",
        description:
          "No se puede generar disponibilidad sin id_usuario_profesional.",
      });
      return;
    }

    const { dateFrom, dateTo, durationMin, ranges, id_tipo_cita, comentario } =
      availabilityForm;

    if (!dateFrom || !dateTo) {
      toast({
        variant: "destructive",
        title: "Completa fechas",
        description: "Selecciona desde y hasta.",
      });
      return;
    }

    const duration = Number(durationMin);
    if (!duration || duration <= 0) {
      toast({
        variant: "destructive",
        title: "Duración inválida",
        description: "Usa minutos > 0.",
      });
      return;
    }

    const enabledRanges = ranges.filter((r) => r.enabled);
    if (enabledRanges.length === 0) {
      toast({
        variant: "destructive",
        title: "Sin horarios",
        description: "Activa al menos un horario.",
      });
      return;
    }

    // Validar rangos
    for (const r of enabledRanges) {
      const s = timeToMinutes(r.start);
      const e = timeToMinutes(r.end);
      if (Number.isNaN(s) || Number.isNaN(e) || s >= e) {
        toast({
          variant: "destructive",
          title: "Horario inválido",
          description: `Revisa rango ${r.start} - ${r.end}`,
        });
        return;
      }
    }

    // Duplicados existentes: (fecha|hora)
    const existingKeys = new Set<string>();
    Object.values(citaById).forEach((c) => {
      if (c.id_usuario_profesional === idProfesional && c.fecha && c.hora) {
        existingKeys.add(`${c.fecha}|${c.hora}`);
      }
    });

    const days = dateRangeInclusive(dateFrom, dateTo);
    if (days.length === 0) {
      toast({
        variant: "destructive",
        title: "Fechas inválidas",
        description: "Revisa el rango de fechas.",
      });
      return;
    }

    // Generar slots
    const toCreate: Array<{ fecha: string; hora: string }> = [];

    for (const day of days) {
      for (const r of enabledRanges) {
        const startM = timeToMinutes(r.start);
        const endM = timeToMinutes(r.end);

        for (let t = startM; t + duration <= endM; t += duration) {
          const hora = minutesToTime(t);
          const key = `${day}|${hora}`;
          if (!existingKeys.has(key)) {
            toCreate.push({ fecha: day, hora });
          }
        }
      }
    }

    if (toCreate.length === 0) {
      toast({
        title: "Nada que crear",
        description: "No se generaron nuevas horas (puede que ya existan).",
      });
      return;
    }

    try {
      setActionLoading(true);

      // ✅ Crear en backend (secuencial para no saturar)
      let created = 0;
      for (const slot of toCreate) {
        const id = makeId();

        const payload: CitaApi = {
          id_cita: id,
          id_usuario_cliente: "", // ✅ disponible
          id_usuario_profesional: idProfesional,
          fecha: slot.fecha,
          hora: slot.hora,
          comentario: comentario || "",
          calificacion: "",
          id_tipo_cita: id_tipo_cita || "DISPONIBILIDAD",
          id_pago: "",
        };

        await citaService.create(id, payload);
        created++;
      }

      toast({
        title: "Disponibilidad generada",
        description: `Se crearon ${created} bloques de disponibilidad.`,
      });

      setAvailabilityOpen(false);
      await loadData();
    } catch (e: any) {
      console.error("Error creando disponibilidad:", e);
      toast({
        variant: "destructive",
        title: "No se pudo generar disponibilidad",
        description: e?.message || "Intenta nuevamente.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Cargador reutilizable (para recargar después de editar/eliminar)
  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (!resolvedUserId) {
      console.warn("No se encontró id_usuario en el user");
      setLoading(false);
      toast({
        variant: "destructive",
        title: "No se pudo cargar tu agenda",
        description: "No se encontró el identificador de usuario en tu sesión.",
      });
      return;
    }

    try {
      setLoading(true);

      // 1) Buscar registro en usuario_profesional vinculado a este usuario
      const profesionales =
        (await profesionalService.list()) as ProfesionalApi[];
      const profesionalActual = profesionales.find(
        (p) => p.id_usuario === resolvedUserId
      );

      if (!profesionalActual) {
        toast({
          variant: "destructive",
          title: "No se encontró tu perfil profesional",
          description:
            "Asegúrate de haber completado el onboarding como profesional.",
        });
        return;
      }

      const idProfesional = profesionalActual.id_usuario_profesional;
      setIdProfesional(idProfesional);
      // 2) Citas del profesional
      const citas = (await citaService.getByProfesional(
        idProfesional
      )) as CitaApi[];

      if (!Array.isArray(citas) || citas.length === 0) {
        setTodayAppointments([]);
        setPendingRequests([]);
        setCitaById({});
        setStats({
          totalBookings: 0,
          monthlyEarnings: 0,
          averageRating: 0,
          totalReviews: 0,
          pendingRequests: 0,
          completedThisMonth: 0,
        });
        return;
      }

      // ✅ guardar raw
      const rawMap: Record<string, CitaApi> = {};
      for (const c of citas) rawMap[c.id_cita] = c;
      setCitaById(rawMap);

      // 3) Precio base
      const precioBase = (profesionalActual.precioHora ??
        profesionalActual.precio_hora ??
        0) as number;

      // 4) Mapear clientes desde /usuario
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
        const isDisponible =
          !cita.id_usuario_cliente || cita.id_usuario_cliente.trim() === "";
        const clientName = isDisponible
          ? "Disponible"
          : cli && (cli.nombre || cli.apellido)
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
        if (isFuture) status = isToday ? "confirmada" : "pendiente";
        else status = "completada";

        if (cita.calificacion) {
          const v = parseFloat(cita.calificacion);
          if (!isNaN(v)) reviews.push(v);
        }

        allAppointments.push({
          id: cita.id_cita,
          client: clientName,
          service: cita.id_tipo_cita || "Sesión",
          date: cita.fecha,
          time: cita.hora,
          duration: "1 hora",
          status,
          price: precioBase,
        });
      }

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
        description: error?.message || "Intenta nuevamente en unos minutos.",
      });
    } finally {
      setLoading(false);
    }
  }, [user, resolvedUserId, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ✅ abrir edición
  const openEdit = (idCita: string) => {
    const raw = citaById[idCita];
    if (!raw) {
      toast({
        variant: "destructive",
        title: "No se pudo editar",
        description: "No se encontró el detalle de la cita.",
      });
      return;
    }

    setEditingId(idCita);
    setEditForm({
      fecha: raw.fecha ?? "",
      hora: raw.hora ?? "",
      comentario: raw.comentario ?? "",
      id_tipo_cita: raw.id_tipo_cita ?? "",
    });
    setEditOpen(true);
  };

  // ✅ guardar edición
  const saveEdit = async () => {
    if (!editingId) return;

    const raw = citaById[editingId];
    if (!raw) return;

    try {
      setActionLoading(true);

      const payload: CitaApi = {
        ...raw,
        fecha: editForm.fecha,
        hora: editForm.hora,
        comentario: editForm.comentario,
        id_tipo_cita: editForm.id_tipo_cita
          ? editForm.id_tipo_cita
          : raw.id_tipo_cita,
      };

      await citaService.update(editingId, payload);

      toast({
        title: "Cita actualizada",
        description: "Los cambios se guardaron correctamente.",
      });

      setEditOpen(false);
      setEditingId(null);

      await loadData();
    } catch (e: any) {
      console.error("Error editando cita:", e);
      toast({
        variant: "destructive",
        title: "No se pudo actualizar la cita",
        description: e?.message || "Intenta nuevamente.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ eliminar cita
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setActionLoading(true);

      await citaService.delete(deleteId);

      toast({
        title: "Cita eliminada",
        description: "La cita fue eliminada correctamente.",
      });

      setDeleteId(null);
      await loadData();
    } catch (e: any) {
      console.error("Error eliminando cita:", e);
      toast({
        variant: "destructive",
        title: "No se pudo eliminar la cita",
        description: e?.message || "Intenta nuevamente.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Mi Agenda</h1>
          <p className="text-muted-foreground">
            Gestiona tus citas y servicios profesionales
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/perfil")}>
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </Button>
          <Button onClick={() => setAvailabilityOpen(true)}>
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

                    {/* ✅ Acciones */}
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon">
                        <MessageSquare className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(apt.id)}
                        disabled={actionLoading}
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(apt.id)}
                        disabled={actionLoading}
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
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

                    {/* ✅ Acciones editar / eliminar */}
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => openEdit(req.id)}
                        disabled={actionLoading}
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setDeleteId(req.id)}
                        disabled={actionLoading}
                      >
                        <Trash2 className="w-3 h-3 mr-1 text-destructive" />
                        Eliminar
                      </Button>
                    </div>

                    {/* (por ahora dejas aceptar/rechazar deshabilitado como lo tenías) */}
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
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setAvailabilityOpen(true)}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-sm">Disponibilidad</span>
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
                Este panel ya está leyendo tus citas reales. Más adelante podrás
                gestionar estados (aceptar / rechazar), ver estadísticas
                avanzadas y responder a clientes desde aquí.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ MODAL EDITAR */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar cita</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={editForm.fecha}
                  onChange={(e) =>
                    setEditForm((s) => ({ ...s, fecha: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Hora</Label>
                <Input
                  type="time"
                  value={editForm.hora}
                  onChange={(e) =>
                    setEditForm((s) => ({ ...s, hora: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Tipo de cita (id_tipo_cita)</Label>
              <Input
                placeholder="Ej: 1, 2, KINESIO, etc."
                value={editForm.id_tipo_cita}
                onChange={(e) =>
                  setEditForm((s) => ({ ...s, id_tipo_cita: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Comentario</Label>
              <Textarea
                rows={4}
                value={editForm.comentario}
                onChange={(e) =>
                  setEditForm((s) => ({ ...s, comentario: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={actionLoading}
            >
              Cancelar
            </Button>
            <Button onClick={saveEdit} disabled={actionLoading}>
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* ✅ MODAL DISPONIBILIDAD */}
      <Dialog open={availabilityOpen} onOpenChange={setAvailabilityOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Generar disponibilidad</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Desde</Label>
                <Input
                  type="date"
                  value={availabilityForm.dateFrom}
                  onChange={(e) =>
                    setAvailabilityForm((s) => ({
                      ...s,
                      dateFrom: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1">
                <Label>Hasta</Label>
                <Input
                  type="date"
                  value={availabilityForm.dateTo}
                  onChange={(e) =>
                    setAvailabilityForm((s) => ({
                      ...s,
                      dateTo: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Duración por cita (min)</Label>
                <Input
                  type="number"
                  min={5}
                  step={5}
                  value={availabilityForm.durationMin}
                  onChange={(e) =>
                    setAvailabilityForm((s) => ({
                      ...s,
                      durationMin: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="space-y-1">
                <Label>Tipo</Label>
                <Input
                  value={availabilityForm.id_tipo_cita}
                  onChange={(e) =>
                    setAvailabilityForm((s) => ({
                      ...s,
                      id_tipo_cita: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Horarios (hasta 3 por día)</Label>

              {availabilityForm.ranges.map((r, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-center border rounded-lg p-3"
                >
                  <div className="col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={r.enabled}
                      onChange={(e) =>
                        setAvailabilityForm((s) => {
                          const copy = [...s.ranges];
                          copy[idx] = {
                            ...copy[idx],
                            enabled: e.target.checked,
                          };
                          return { ...s, ranges: copy };
                        })
                      }
                    />
                    <span className="text-sm font-medium">#{idx + 1}</span>
                  </div>

                  <div className="col-span-5 space-y-1">
                    <Label className="text-xs">Inicio</Label>
                    <Input
                      type="time"
                      value={r.start}
                      onChange={(e) =>
                        setAvailabilityForm((s) => {
                          const copy = [...s.ranges];
                          copy[idx] = { ...copy[idx], start: e.target.value };
                          return { ...s, ranges: copy };
                        })
                      }
                      disabled={!r.enabled}
                    />
                  </div>

                  <div className="col-span-5 space-y-1">
                    <Label className="text-xs">Fin</Label>
                    <Input
                      type="time"
                      value={r.end}
                      onChange={(e) =>
                        setAvailabilityForm((s) => {
                          const copy = [...s.ranges];
                          copy[idx] = { ...copy[idx], end: e.target.value };
                          return { ...s, ranges: copy };
                        })
                      }
                      disabled={!r.enabled}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <Label>Comentario (opcional)</Label>
              <Textarea
                rows={3}
                value={availabilityForm.comentario}
                onChange={(e) =>
                  setAvailabilityForm((s) => ({
                    ...s,
                    comentario: e.target.value,
                  }))
                }
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Esto creará “citas disponibles” (sin cliente) por cada día y cada
              rango, según la duración.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setAvailabilityOpen(false)}
              disabled={actionLoading}
            >
              Cancelar
            </Button>
            <Button onClick={createAvailability} disabled={actionLoading}>
              Generar disponibilidad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ CONFIRM ELIMINAR */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cita?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la cita
              seleccionada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={actionLoading}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
