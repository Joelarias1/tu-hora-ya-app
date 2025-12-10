import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReviewCard } from "@/components/ReviewCard";
import { profesionalService } from "@/services/api";
import { Star, MapPin, Calendar, DollarSign, Briefcase, Award, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getInitials, getAvatarColor, isValidImageUrl } from "@/lib/utils/avatar";

const ProfessionalProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [professional, setProfessional] = useState<any>(null);
  const professionalReviews: any[] = [];

  useEffect(() => {
    const fetchProfessional = async () => {
      try {
        setLoading(true);
        const data: any = await profesionalService.get(id!);

        if (data) {
          const serviciosList = data.servicios
            ? data.servicios.split(',').map((s: string) => s.trim()).filter(Boolean)
            : [data.id_servicio_profesional].filter(Boolean);

          const locationParts = [data.ciudad, data.pais].filter(Boolean);
          const location = locationParts.length > 0 ? locationParts.join(', ') : 'Sin ubicación';

          setProfessional({
            id: data.id_usuario_profesional,
            usuarioId: data.id_usuario, 
            name: `${data.nombre || ''} ${data.apellido || ''}`.trim(),
            profession: data.id_profesion || 'Profesional',
            rubro: data.id_rubro,
            image: data.foto_url || null,
            rating: 5.0,
            reviewCount: 0,
            pricePerHour: data.precioHora || 0,
            location,
            experience: data.experiencia || 'Sin especificar',
            description: data.descripcion || 'Este profesional aún no ha agregado una descripción.',
            services: serviciosList.length > 0 ? serviciosList : ['Sin servicios especificados'],
            availability: [
              { day: 'Lunes', slots: ['09:00', '10:00', '14:00', '15:00'] },
              { day: 'Martes', slots: ['09:00', '10:00', '14:00', '15:00'] },
              { day: 'Miércoles', slots: ['09:00', '10:00', '14:00', '15:00'] }
            ]
          });
        }
      } catch (error: any) {
        console.error('Error cargando profesional:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo cargar la información del profesional',
        });
        setProfessional(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfessional();
    }
  }, [id, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Cargando...</p>
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
          <Button onClick={() => navigate("/profesionales")}>
            Volver a la Búsqueda
          </Button>
        </div>
      </div>
    );
  }

  const isValidImage = isValidImageUrl(professional.image);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/profesionales")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a la Búsqueda
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {isValidImage ? (
                    <img
                      src={professional.image}
                      alt={professional.name}
                      className="w-full md:w-48 h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <div className={`w-full md:w-48 h-48 rounded-lg flex items-center justify-center ${getAvatarColor(professional.name)}`}>
                      <span className="text-5xl font-bold text-white">
                        {getInitials(professional.name)}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 space-y-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{professional.name}</h1>
                      <p className="text-xl text-primary font-medium mb-3">
                        {professional.profession}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-accent text-accent" />
                          <span className="font-bold">{professional.rating}</span>
                          <span className="text-muted-foreground">
                            ({professional.reviewCount} reseñas)
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {professional.location}
                        </div>

                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Briefcase className="w-4 h-4" />
                          {professional.experience}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {professional.services.slice(0, 4).map((service) => (
                        <Badge key={service} variant="secondary">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sobre Mí</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {professional.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Servicios que Ofrezco</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {professional.services.map((service) => (
                    <div
                      key={service}
                      className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg"
                    >
                      <Award className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reseñas de Clientes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {professionalReviews.length > 0 ? (
                  professionalReviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      userName={review.userName}
                      userImage={review.userImage}
                      rating={review.rating}
                      comment={review.comment}
                      date={review.date}
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Aún no hay reseñas para este profesional
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Reservar Hora</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <div className="flex items-baseline gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span className="text-3xl font-bold text-primary">
                      ${professional.pricePerHour.toLocaleString('es-CL')}
                    </span>
                    <span className="text-muted-foreground">/ consulta</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Próximas Disponibilidades
                  </h4>
                  <div className="space-y-2">
                    {professional.availability.slice(0, 3).map((day) => (
                      <div
                        key={day.day}
                        className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="font-medium text-sm mb-1">{day.day}</div>
                        <div className="flex flex-wrap gap-1">
                          {day.slots.slice(0, 4).map((slot) => (
                            <Badge key={slot} variant="outline" className="text-xs">
                              {slot}
                            </Badge>
                          ))}
                          {day.slots.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{day.slots.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  variant="accent"
                    onClick={() => navigate(`/reservar/${professional.id}`)} 
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Reservar Ahora
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Pago seguro · Confirmación instantánea
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalProfile;
