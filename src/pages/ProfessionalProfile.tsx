import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ReviewCard } from "@/components/ReviewCard";
import { profesionalService, citaService, comentariosService, usuarioService  } from "@/services/api";
import { Star, MapPin, Calendar, DollarSign, Briefcase, Award, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getInitials, getAvatarColor, isValidImageUrl } from "@/lib/utils/avatar";
import { useAuth } from "../context/AuthContext";

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
  estado?: string;
}

interface ComentarioApi {
  id_comentario: string;
  id_usuario_profesional: string;
  id_usuario_cliente: string;
  calificacion: string;
  comentario: string;
}

type ReviewView = {
  id: string;
  userName: string;
  userImage: string | null;
  rating: number;
  comment: string;
  date: string;
};

const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const clampRating = (n: number) => Math.max(1, Math.min(5, n));

const avg = (nums: number[]) => (nums.length ? Number((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1)) : 0);

const ProfessionalProfile = () => {
  const { id } = useParams(); // id_usuario_profesional
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [professional, setProfessional] = useState<any>(null);

  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [professionalReviews, setProfessionalReviews] = useState<ReviewView[]>([]);
  const [rawComentarios, setRawComentarios] = useState<ComentarioApi[]>([]);

  const [myRating, setMyRating] = useState<number>(5);
  const [myComment, setMyComment] = useState<string>("");
  const [savingReview, setSavingReview] = useState(false);

  const [citasProfesional, setCitasProfesional] = useState<CitaApi[]>([]);
type UsuarioApi = {
  id_usuario: string;
  nombre?: string;
  apellido?: string;
  foto_url?: string | null;
};


  // En tu BD, cita.id_usuario_cliente parece ser el id de "usuario" (a8a5...) y no el id_usuario_cliente (5f9d...)
  const idCliente = useMemo(() => {
    if (!user) return null;
    return (
      (user as any).id_usuario_cliente || // si lo guardas así
      (user as any).id_usuario ||         // ✅ en tu caso coincide con lo que hay en tabla cita
      (user as any).id ||
      null
    );
  }, [user]);

  const userType = useMemo(() => {
    if (!user) return null;
    return (user as any).user_type || (user as any).userType || (user as any).tipo || null;
  }, [user]);

  const isClientUser = useMemo(() => {
    if (!user) return false;
    if (userType) return String(userType).toUpperCase().includes("CLIENT");
    const rol = (user as any).id_rol || (user as any).rol;
    if (rol) return String(rol).toUpperCase().includes("CLIENTE");
    return false;
  }, [user, userType]);

  const hasPastBookingWithThisPro = useMemo(() => {
    if (!idCliente || !professional?.id) return false;
    const now = Date.now();

    return (citasProfesional || []).some((c) => {
      if (!c.id_usuario_cliente) return false;
      if (String(c.id_usuario_cliente) !== String(idCliente)) return false;
      if (String(c.id_usuario_profesional) !== String(professional.id)) return false;

      const dt = new Date(`${c.fecha}T${c.hora}:00`).getTime();
      return !isNaN(dt) && dt <= now; // ✅ cita ya ocurrió
    });
  }, [idCliente, professional?.id, citasProfesional]);

  const alreadyReviewedStrict = useMemo(() => {
    if (!idCliente || !professional?.id) return false;
    return rawComentarios.some(
      (c) =>
        String(c.id_usuario_cliente) === String(idCliente) &&
        String(c.id_usuario_profesional) === String(professional.id)
    );
  }, [idCliente, rawComentarios, professional?.id]);

  const canWriteReview = isClientUser && !!idCliente && hasPastBookingWithThisPro && !alreadyReviewedStrict;

const fetchReviews = async (idProfesional: string) => {
  try {
    setReviewsLoading(true);

    const comentarios = (await comentariosService.getByProfesional(idProfesional)) as ComentarioApi[];
    const list = Array.isArray(comentarios) ? comentarios : [];

    setRawComentarios(list);

    // 1) ids únicos de usuarios (clientes) que comentaron
    const userIds = Array.from(new Set(list.map(c => c.id_usuario_cliente).filter(Boolean)));

    // 2) traer usuarios en paralelo
    const userMap = new Map<string, UsuarioApi>();

    await Promise.all(
      userIds.map(async (uid) => {
        try {
          const u = (await usuarioService.get(uid)) as any;
          // según tu apiClient, puede venir directo o en u.data
          const userObj: UsuarioApi = u?.data ?? u;
          if (userObj) userMap.set(uid, userObj);
        } catch {
          // si falla, lo dejamos sin nombre
        }
      })
    );

    // 3) mapear a ReviewView con nombre real
    const mapped: ReviewView[] = list
      .map((c) => {
        const rating = clampRating(parseFloat(c.calificacion || "0"));

        const u = userMap.get(c.id_usuario_cliente);
        const fullName =
          u ? `${u.nombre || ""} ${u.apellido || ""}`.trim() : "";

        return {
          id: c.id_comentario,
          userName: fullName || `Cliente ${(c.id_usuario_cliente || "").slice(0, 6)}`,
          userImage: u?.foto_url || null,
          rating,
          comment: c.comentario || "",
          date: "", // lo arreglamos abajo (invalid date)
        };
      })
      .reverse();

    setProfessionalReviews(mapped);
    return list;
  } catch (e) {
    console.error("Error cargando reseñas:", e);
    setRawComentarios([]);
    setProfessionalReviews([]);
    return [];
  } finally {
    setReviewsLoading(false);
  }
};
  useEffect(() => {
    const fetchProfessional = async () => {
      try {
        setLoading(true);

        const data: any = await profesionalService.get(id!);
        if (!data) {
          setProfessional(null);
          return;
        }

        const citas = (await citaService.getByProfesional(data.id_usuario_profesional)) as CitaApi[];
        const citasList = Array.isArray(citas) ? citas : [];
        setCitasProfesional(citasList);

        const now = new Date();

        const serviciosList = data.servicios
          ? data.servicios.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [data.id_servicio_profesional].filter(Boolean);

        const locationParts = [data.ciudad, data.pais].filter(Boolean);
        const location = locationParts.length > 0 ? locationParts.join(", ") : "Sin ubicación";

        const disponibles = citasList
          .filter((c) => !c.id_usuario_cliente || c.id_usuario_cliente.trim() === "")
          .filter((c) => {
            const dt = new Date(`${c.fecha}T${c.hora}:00`);
            return !isNaN(dt.getTime()) && dt.getTime() >= now.getTime();
          })
          .sort((a, b) => new Date(`${a.fecha}T${a.hora}:00`).getTime() - new Date(`${b.fecha}T${b.hora}:00`).getTime());

        const byDate = new Map<string, string[]>();
        for (const c of disponibles) {
          const list = byDate.get(c.fecha) ?? [];
          if (!list.includes(c.hora)) list.push(c.hora);
          byDate.set(c.fecha, list);
        }
        for (const [k, v] of byDate.entries()) {
          v.sort();
          byDate.set(k, v);
        }

        const availability = Array.from(byDate.entries()).slice(0, 3).map(([fecha, slots]) => {
          const d = new Date(`${fecha}T00:00:00`);
          const label = new Intl.DateTimeFormat("es-CL", { weekday: "long", day: "2-digit", month: "short" }).format(d);
          const day = label.charAt(0).toUpperCase() + label.slice(1);
          return { day, slots };
        });

        // ✅ reseñas reales
        const comentariosList = await fetchReviews(data.id_usuario_profesional);
        const ratings = comentariosList.map((c) => parseFloat(c.calificacion)).filter((n) => !isNaN(n));
        const avgRating = avg(ratings);

        setProfessional({
          id: data.id_usuario_profesional,
          usuarioId: data.id_usuario,
          name: `${data.nombre || ""} ${data.apellido || ""}`.trim(),
          profession: data.id_profesion || "Profesional",
          rubro: data.id_rubro,
          image: data.foto_url || null,
          rating: avgRating,
          reviewCount: ratings.length,
          pricePerHour: data.precioHora || data.precio_hora || 0,
          location,
          experience: data.experiencia || "Sin especificar",
          description: data.descripcion || "Este profesional aún no ha agregado una descripción.",
          services: serviciosList.length > 0 ? serviciosList : ["Sin servicios especificados"],
          availability,
        });
      } catch (error: any) {
        console.error("Error cargando profesional:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo cargar la información del profesional" });
        setProfessional(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProfessional();
  }, [id, toast]);

  const handleSubmitReview = async () => {
    if (!professional?.id) return;

    if (!user || !idCliente) {
      toast({ variant: "destructive", title: "No autenticado", description: "Debes iniciar sesión como cliente para dejar una reseña." });
      return;
    }

    if (!canWriteReview) {
      toast({
        variant: "destructive",
        title: "No permitido",
        description: "Solo puedes reseñar si ya tuviste una cita (ya pasada) con este profesional y aún no lo reseñas.",
      });
      return;
    }

    if (!myComment.trim()) {
      toast({ variant: "destructive", title: "Comentario requerido", description: "Escribe un comentario para tu reseña." });
      return;
    }

    const idComentario = generateId();

    try {
      setSavingReview(true);

      await comentariosService.create(idComentario, {
        id_comentario: idComentario,
        id_usuario_profesional: professional.id,
        id_usuario_cliente: idCliente,
        calificacion: String(clampRating(myRating)),
        comentario: myComment.trim(),
      });

      toast({ title: "¡Reseña publicada! ✓", description: "Gracias por tu evaluación." });

      setMyRating(5);
      setMyComment("");

      const comentariosList = await fetchReviews(professional.id);
      const ratings = comentariosList.map((c) => parseFloat(c.calificacion)).filter((n) => !isNaN(n));
      const avgRating = avg(ratings);

      setProfessional((prev: any) => ({ ...prev, rating: avgRating, reviewCount: ratings.length }));
    } catch (e: any) {
      console.error("Error creando reseña:", e);
      toast({ variant: "destructive", title: "Error", description: e?.message || "No se pudo guardar tu reseña." });
    } finally {
      setSavingReview(false);
    }
  };

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
          <Button onClick={() => navigate("/profesionales")}>Volver a la Búsqueda</Button>
        </div>
      </div>
    );
  }

  const isValidImage = isValidImageUrl(professional.image);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/profesionales")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a la Búsqueda
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {isValidImage ? (
                    <img src={professional.image} alt={professional.name} className="w-full md:w-48 h-48 object-cover rounded-lg" />
                  ) : (
                    <div className={`w-full md:w-48 h-48 rounded-lg flex items-center justify-center ${getAvatarColor(professional.name)}`}>
                      <span className="text-5xl font-bold text-white">{getInitials(professional.name)}</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{professional.name}</h1>
                      <p className="text-xl text-primary font-medium mb-3">{professional.profession}</p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-accent text-accent" />
                          <span className="font-bold">{professional.rating}</span>
                          <span className="text-muted-foreground">({professional.reviewCount} reseñas)</span>
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
                      {professional.services.slice(0, 4).map((service: string) => (
                        <Badge key={service} variant="secondary">{service}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Sobre Mí</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground leading-relaxed">{professional.description}</p></CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Servicios que Ofrezco</CardTitle></CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {professional.services.map((service: string) => (
                    <div key={service} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Award className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Deja tu Reseña</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {!user ? (
                  <p className="text-sm text-muted-foreground">Inicia sesión como cliente para dejar una reseña.</p>
                ) : !isClientUser ? (
                  <p className="text-sm text-muted-foreground">Solo los clientes pueden dejar reseñas.</p>
                ) : !hasPastBookingWithThisPro ? (
                  <p className="text-sm text-muted-foreground">Podrás dejar una reseña después de tener al menos una cita ya realizada con este profesional.</p>
                ) : alreadyReviewedStrict ? (
                  <p className="text-sm text-muted-foreground">Ya dejaste una reseña para este profesional.</p>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Calificación</Label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button key={n} type="button" onClick={() => setMyRating(n)} className="p-1" aria-label={`Calificar ${n} estrellas`}>
                            <Star className={`w-6 h-6 ${n <= myRating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-muted-foreground">{myRating}/5</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Comentario</Label>
                      <Textarea value={myComment} onChange={(e) => setMyComment(e.target.value)} placeholder="Cuenta tu experiencia..." rows={4} />
                    </div>

                    <Button variant="accent" onClick={handleSubmitReview} disabled={savingReview || !myComment.trim()}>
                      {savingReview ? "Publicando..." : "Publicar Reseña"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Reseñas de Clientes</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {reviewsLoading ? (
                  <div className="text-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Cargando reseñas...</p>
                  </div>
                ) : professionalReviews.length > 0 ? (
                  professionalReviews.map((review) => (
                    <ReviewCard key={review.id} userName={review.userName} userImage={review.userImage} rating={review.rating} comment={review.comment} date={review.date} />
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">Aún no hay reseñas para este profesional</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader><CardTitle>Reservar Hora</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <div className="flex items-baseline gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span className="text-3xl font-bold text-primary">${Number(professional.pricePerHour).toLocaleString("es-CL")}</span>
                    <span className="text-muted-foreground">/ consulta</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Próximas Disponibilidades
                  </h4>
                  <div className="space-y-2">
                    {professional.availability.slice(0, 3).map((day: any) => (
                      <div key={day.day} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="font-medium text-sm mb-1">{day.day}</div>
                        <div className="flex flex-wrap gap-1">
                          {day.slots.slice(0, 4).map((slot: string) => (
                            <Badge key={slot} variant="outline" className="text-xs">{slot}</Badge>
                          ))}
                          {day.slots.length > 4 && <Badge variant="outline" className="text-xs">+{day.slots.length - 4}</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button size="lg" className="w-full" variant="accent" onClick={() => navigate(`/reservar/${professional.id}`)}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Reservar Ahora
                </Button>

                <p className="text-xs text-center text-muted-foreground">Pago seguro · Confirmación instantánea</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalProfile;
