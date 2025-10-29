import { useState } from "react";
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
import { professionals } from "@/data/mockData";
import { Calendar, Clock, User, CalendarIcon, CheckCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const BookingImproved = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const professional = professionals.find((p) => p.id === id);
  
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  if (!professional) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Profesional no encontrado</h1>
          <Button onClick={() => navigate("/profesionales")}>
            Volver a la Búsqueda
          </Button>
        </div>
      </div>
    );
  }

  // Get available time slots (simulated - in real app would come from API)
  const availableSlots = [
    "09:00", "10:00", "11:00", "12:00",
    "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  const handleContinueToPayment = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Error",
        description: "Por favor selecciona fecha y hora",
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

    // Navigate to payment page with booking data
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
        selectedDate: format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es }),
        selectedTime: selectedTime,
        customerData: formData,
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(`/profesional/${id}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Perfil
        </Button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Reserva tu Hora</h1>
          <p className="text-muted-foreground mb-8">Selecciona fecha, hora y completa tus datos</p>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Professional Info */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <img
                      src={professional.image}
                      alt={professional.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-lg">{professional.name}</h3>
                      <p className="text-sm text-muted-foreground">{professional.profession}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {professional.location}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Date & Time Selection */}
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
                            setSelectedTime(""); // Reset time when date changes
                          }}
                          disabled={(date) => date < new Date() || date > new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)}
                          initialFocus
                          className="pointer-events-auto"
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Time Selection */}
                  {selectedDate && (
                    <div className="space-y-2">
                      <Label>Hora Disponible</Label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availableSlots.map((slot) => (
                          <Button
                            key={slot}
                            variant={selectedTime === slot ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTime(slot)}
                            className="h-10"
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Form */}
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

            {/* Summary Sidebar */}
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
                        ${professional.pricePerHour.toLocaleString('es-CL')}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-accent">
                        ${professional.pricePerHour.toLocaleString('es-CL')}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    variant="accent"
                    className="w-full"
                    onClick={handleContinueToPayment}
                    disabled={!selectedDate || !selectedTime || !formData.name || !formData.email || !formData.phone}
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
