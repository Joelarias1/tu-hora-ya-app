import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  User,
  CreditCard,
  CheckCircle,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// 👇 ajusta la ruta de AuthContext según tu proyecto
import { useAuth } from "../context/AuthContext";

// 👇 servicios
import {
  citaService,
  pagosService,
  historialService,
} from "@/services/api";

interface BookingData {
  professional: {
    id: string;
    name: string;
    profession: string;
    image: string;
    pricePerHour: number;
    location: string;
  };
  selectedDate: string;     // texto bonito "Lunes 2 de diciembre..."
  selectedTime: string;
  customerData: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  };
  meta?: {
    dateISO: string;        // "2025-12-02"
  };
}

// helper para generar IDs si crypto.randomUUID no está
const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth(); // 👈 asumimos que aquí viene el usuario logueado

  const bookingData = location.state as BookingData | undefined;

  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [processing, setProcessing] = useState(false);
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">No hay datos de reserva</h1>
          <Button onClick={() => navigate("/profesionales")}>
            Volver a la Búsqueda
          </Button>
        </div>
      </div>
    );
  }

  const { professional, selectedDate, selectedTime, customerData, meta } =
    bookingData;
  const total = professional.pricePerHour;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        variant: "destructive",
        title: "No autenticado",
        description: "Debes iniciar sesión para confirmar la cita.",
      });
      return;
    }

    setProcessing(true);

    // fecha para la BD
    const fechaBD = meta?.dateISO || selectedDate; // idealmente viene en yyyy-MM-dd

    // último 4 dígitos simulados
    const cardLast4 = cardData.number.replace(/\s+/g, "").slice(-4) || "0000";

    // ajusta según tu modelo de usuario 👇
    const idCliente =
      (user as any).id_usuario_cliente ||
      (user as any).id_usuario ||
      (user as any).id ||
      "cliente-demo";

    const idProfesional = professional.id;

    const pagoId = generateId();
    const citaId = generateId();
    const historialId = generateId();

    try {
      // 1) Crear pago (simulado como PAGADO)
      await pagosService.create(pagoId, {
        id_pago: pagoId,
        estado_pago: "PAGADO",
      });

      // 2) Crear cita vinculada al pago
      await citaService.create(citaId, {
        id_cita: citaId,
        id_usuario_cliente: idCliente,
        id_usuario_profesional: idProfesional,
        fecha: fechaBD,           // ej: "2025-12-02"
        hora: selectedTime,       // "10:00"
        comentario: customerData.notes || "",
        calificacion: "",         // vacío por ahora
        id_tipo_cita: null,       // o un id_tipo_cita válido si ya tienes
        id_pago: pagoId,
      });

      // 3) Registrar historial
      await historialService.create(historialId, {
        id_historial: historialId,
        comentario: `Cita creada y pagada con tarjeta **** **** **** ${cardLast4}`,
        id_cita: citaId,
      });

      setProcessing(false);

      toast({
        title: "¡Pago Exitoso! ✓",
        description: `Tu reserva con ${professional.name} ha sido confirmada para el ${selectedDate} a las ${selectedTime}.`,
      });

      // redirigir al dashboard de cliente, donde verás la cita real
      setTimeout(() => {
        navigate("/dashboard"); // ajusta la ruta que uses para ClientDashboard
      }, 1500);
    } catch (error: any) {
      console.error("Error en flujo de pago/cita/historial:", error);
      setProcessing(false);
      toast({
        variant: "destructive",
        title: "Error al registrar la reserva",
        description:
          error?.message ||
          "Ocurrió un error al crear la cita. Intenta nuevamente.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Confirmar y Pagar</h1>
          <p className="text-muted-foreground mb-8">
            Estás a un paso de confirmar tu reserva
          </p>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Info Review */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Tus Datos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nombre:</span>
                    <span className="font-medium">{customerData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{customerData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Teléfono:</span>
                    <span className="font-medium">{customerData.phone}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Método de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="credit-card" id="credit-card" />
                      <Label
                        htmlFor="credit-card"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">
                          Tarjeta de Crédito/Débito
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Visa, Mastercard, etc.
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 opacity-50">
                      <RadioGroupItem
                        value="mercadopago"
                        id="mercadopago"
                        disabled
                      />
                      <Label
                        htmlFor="mercadopago"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">MercadoPago</div>
                        <div className="text-sm text-muted-foreground">
                          Próximamente
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 opacity-50">
                      <RadioGroupItem value="webpay" id="webpay" disabled />
                      <Label
                        htmlFor="webpay"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">WebPay</div>
                        <div className="text-sm text-muted-foreground">
                          Próximamente
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "credit-card" && (
                    <form onSubmit={handlePayment} className="mt-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Número de Tarjeta</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardData.number}
                          onChange={(e) =>
                            setCardData({
                              ...cardData,
                              number: e.target.value,
                            })
                          }
                          maxLength={19}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardName">Nombre en la Tarjeta</Label>
                        <Input
                          id="cardName"
                          placeholder="JUAN PÉREZ"
                          value={cardData.name}
                          onChange={(e) =>
                            setCardData({
                              ...cardData,
                              name: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">
                            Fecha de Vencimiento
                          </Label>
                          <Input
                            id="expiry"
                            placeholder="MM/AA"
                            value={cardData.expiry}
                            onChange={(e) =>
                              setCardData({
                                ...cardData,
                                expiry: e.target.value,
                              })
                            }
                            maxLength={5}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={cardData.cvv}
                            onChange={(e) =>
                              setCardData({
                                ...cardData,
                                cvv: e.target.value,
                              })
                            }
                            maxLength={4}
                            type="password"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-start gap-2 p-4 bg-muted/50 rounded-lg text-sm">
                        <Lock className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                        <p className="text-muted-foreground">
                          Este es un pago simulado. En producción se integrará
                          con pasarelas de pago reales como Stripe o
                          MercadoPago.
                        </p>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Resumen de Reserva</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Professional Info */}
                  <div className="flex gap-3">
                    <img
                      src={professional.image}
                      alt={professional.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">
                        {professional.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {professional.profession}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {professional.location}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Booking Details */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-accent mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Fecha</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-accent mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Hora</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedTime}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Sesión (1 hora)
                      </span>
                      <span>
                        ${total.toLocaleString("es-CL")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Comisión de servicio
                      </span>
                      <span className="text-green-600">$0</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span className="text-accent">
                      ${total.toLocaleString("es-CL")}
                    </span>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    variant="accent"
                    className="w-full"
                    onClick={handlePayment}
                    disabled={processing || paymentMethod !== "credit-card"}
                  >
                    {processing ? (
                      <>Procesando...</>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirmar y Pagar
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Al confirmar aceptas los términos y condiciones
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
