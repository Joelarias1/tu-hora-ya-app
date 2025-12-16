import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { profesionalService, citaService } from "@/services/api";
import {
  Calendar,
  Clock,
  User,
  CalendarIcon,
  CheckCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ProfessionalView {
  id: string;
  name: string;
  profession: string;
  image: string | null;
  pricePerHour: number;
  location: string;
}

interface CitaApi {
  id_cita: string;
  id_usuario_cliente: string;
  id_usuario_profesional: string;
  fecha: string; // yyyy-MM-dd
  hora: string; // HH:mm
  comentario: string;
  calificacion: string;
  id_tipo_cita: string | null;
  id_pago: string;
}

type Slot = { id_cita: string; hora: string };

const BookingImproved = () => {
  const { id } = useParams<{ id: string }>(); // id_usuario_profesional
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [professional, setProfessional] = useState<ProfessionalView | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedCitaId, setSelectedCitaId] = useState(""); // ✅ NUEVO

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  // ✅ Disponibilidad REAL: Record<yyyy-MM-dd, Slot[]>
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, Slot[]>>({});

  // ✅ cargar disponibilidad real
  useEffect(() => {
    const loadAvailability = async () => {
      if (!id) return;

      try {
        const citas = (await citaService.getByProfesional(id)) as CitaApi[];
        const now = new Date();

        const map: Record<string, Slot[]> = {};

        (Array.isArray(citas) ? citas : [])
          // solo “disponibles”: sin cliente asignado
          .filter((c) => !c.id_usuario_cliente || c.id_usuario_cliente.trim() === "")
          // solo futuras
          .filter((c) => {
            const dt = new Date(`${c.fecha}T${c.hora}:00`);
            return !isNaN(dt.getTime()) && dt.getTime() >= now.getTime();
          })
          .forEach((c) => {
            map[c.fecha] = map[c.fecha] ?? [];
            if (!map[c.fecha].some((x) => x.hora === c.hora)) {
              map[c.fecha].push({ id_cita: c.id_cita, hora: c.hora });
            }
          });

        Object.keys(map).forEach((k) =>
          map[k].sort((a, b) => a.hora.localeCompare(b.hora))
        );

        setAvailabilityMap(map);
      } catch (e) {
        console.error("Error cargando disponibilidades:", e);
        setAvailabilityMap({});
      }
    };

    loadAvailability();
  }, [id]);

  // ✅ Cargar profesional desde backend
  useEffect(() => {
    const loadProfessional = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data: any = await profesionalService.get(id);

        if (!data) {
          setProfessional(null);
          return;
        }

        const locationParts = [data.ciudad, data.pais].filter(Boolean);
        const location =
          locationParts.length > 0 ? locationParts.join(", ") : "Sin ubicación";

        const mapped: ProfessionalView = {
          id: data.id_usuario_profesional,
          name: `${data.nombre || ""} ${data.apellido || ""}`.trim() || "Profesional",
          profession: data.id_profesion || "Profesional",
          image:
            data.foto_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.id_usuario}`,
          pricePerHour: data.precioHora || 0,
          location,
        };

        setProfessional(mapped);
      } catch (error: any) {
        console.error("Error cargando profesional para reserva:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar la información del profesional",
        });
        setProfessional(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfessional();
  }, [id, toast]);

  const handleContinueToPayment = () => {
    if (!professional) return;

    if (!selectedDate || !selectedTime || !selectedCitaId) {
      toast({
        title: "Error",
        description: "Por favor selecciona fecha y hora disponible",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    const prettyDate = format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es });
    const dateISO = format(selectedDate, "yyyy-MM-dd");

    navigate("/pago", {
      state: {
        professional: {
          id: professional.id,
          name: professional.name,
          profession: professional.profession,
          image: professional.image,
          pricePerHour: professional.pricePerHour,
          location: professional.location,
        },
        selectedDate: prettyDate,
        selectedTime,
        selectedCitaId, // ✅ MUY IMPORTANTE (para update en Payment)
        customerData: formData,
        meta: { dateISO },
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Cargando profesional...</p>
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Profesional no encontrado</h1>
          <Button onClick={() => navigate("/profesionales")}>Volver a la Búsqueda</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(`/profesional/${professional.id}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Perfil
        </Button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Reserva tu Hora</h1>
          <p className="text-muted-foreground mb-8">
            Selecciona fecha, hora y completa tus datos
          </p>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Formulario principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Info del profesional */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <img
                      src={professional.image || ""}
                      alt={professional.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-lg">{professional.name}</h3>
                      <p className="text-sm text-muted-foreground">{professional.profession}</p>
                      <p className="text-sm text-muted-foreground mt-1">{professional.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fecha y hora */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Selecciona Fecha y Hora
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Date Picker */}
                  <div className="space-y-2">
                    <Label>Selecciona una Fecha</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-12",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? (
                            format(selectedDate, "PPP", { locale: es })
                          ) : (
                            <span>Elige un día disponible</span>
                          )}
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="w-auto p-0 z-50" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            setSelectedTime("");
                            setSelectedCitaId("");
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);

                            const max = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                            max.setHours(0, 0, 0, 0);

                            const d = new Date(date);
                            d.setHours(0, 0, 0, 0);

                            const dateISO = format(d, "yyyy-MM-dd");
                            const hasSlots = (availabilityMap[dateISO]?.length ?? 0) > 0;

                            return d < today || d > max || !hasSlots;
                          }}
                          modifiers={{
                            available: (date) => {
                              const d = new Date(date);
                              d.setHours(0, 0, 0, 0);
                              const iso = format(d, "yyyy-MM-dd");
                              return (availabilityMap[iso]?.length ?? 0) > 0;
                            },
                          }}
                          modifiersClassNames={{
                            available: "border border-primary/40",
                          }}
                          initialFocus
                          className="pointer-events-auto"
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Time slots */}
                  {selectedDate && (
                    <div className="space-y-2">
                      <Label>Hora Disponible</Label>

                      {(() => {
                        const dateISO = format(selectedDate, "yyyy-MM-dd");
                        const slots = availabilityMap[dateISO] ?? [];

                        if (slots.length === 0) {
                          return (
                            <p className="text-sm text-muted-foreground">
                              No hay horarios disponibles para este día.
                            </p>
                          );
                        }

                        return (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {slots.map((slot) => (
                              <Button
                                key={slot.id_cita}
                                variant={selectedCitaId === slot.id_cita ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  setSelectedTime(slot.hora);
                                  setSelectedCitaId(slot.id_cita);
                                }}
                                className="h-10"
                              >
                                {slot.hora}
                              </Button>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Datos del cliente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Tus Datos
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="juan@ejemplo.cl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+56 9 1234 5678"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas Adicionales (Opcional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="¿Algo que el profesional deba saber?"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar de resumen */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Resumen</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {selectedDate && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-accent mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Fecha</p>
                        <p className="text-sm text-muted-foreground">
                          {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedTime && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-accent mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Hora</p>
                        <p className="text-sm text-muted-foreground">{selectedTime}</p>
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sesión (1 hora)</span>
                      <span className="font-medium">
                        ${professional.pricePerHour.toLocaleString("es-CL")}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-accent">
                        ${professional.pricePerHour.toLocaleString("es-CL")}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    variant="accent"
                    className="w-full"
                    onClick={handleContinueToPayment}
                    disabled={
                      !selectedDate ||
                      !selectedTime ||
                      !selectedCitaId ||
                      !formData.name ||
                      !formData.email ||
                      !formData.phone
                    }
                  >
                    Continuar al Pago
                  </Button>

                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <p>Recibirás confirmación por email después del pago</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingImproved;
