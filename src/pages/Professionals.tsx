import { useState, useMemo, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { HeroBanner } from "@/components/professionals/HeroBanner";
import { SearchFilters } from "@/components/professionals/SearchFilters";
import { HowItWorks } from "@/components/HowItWorks";
import { Button } from "@/components/ui/button";
import { profesionalService, rubroService } from "@/services/api";
import { Loader2, Users, SearchX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface Rubro {
  id_rubro: string;
  nombre: string;
  descripcion?: string;
}

const Professionals = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("rating");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [rubros, setRubros] = useState<Rubro[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Función para hacer scroll a los resultados
  const scrollToResults = () => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Mapeo de profesiones a rubros para sincronización
  const professionToRubroMap: Record<string, string> = {
    'Psicólogo': 'Salud',
    'Dentista': 'Salud',
    'Masajista': 'Salud',
    'Abogado': 'Legal',
    'Programador': 'Tecnología',
    'Diseñador': 'Tecnología',
    'Electricista': 'Construcción',
    'Plomero': 'Construcción',
    'Carpintero': 'Construcción',
    'Pintor': 'Construcción',
    'Arquitecto': 'Construcción',
    'Chef': 'Gastronomía',
    'Fotógrafo': 'Arte',
    'Profesor': 'Educación',
    'Mecánico': 'Automotriz',
    'Jardinero': 'Servicios',
  };

  // Handler para búsqueda con scroll y sincronización de rubro
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    // Si el valor coincide con una profesión conocida, seleccionar el rubro correspondiente
    const matchedRubro = professionToRubroMap[value];
    if (matchedRubro) {
      setSelectedCategory(matchedRubro);
    }

    if (value) {
      scrollToResults();
    }
  };

  // Handler para cambio de categoría con scroll y limpiar búsqueda
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    // Limpiar búsqueda de texto cuando se selecciona un rubro específico
    if (value !== "all") {
      setSearchTerm("");
      scrollToResults();
    }
  };

  // Generar rating y reviews variados para demo
  const getRandomRating = (seed: string): { rating: number; reviews: number } => {
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rating = 4.0 + (hash % 10) / 10; // Entre 4.0 y 4.9
    const reviews = 5 + (hash % 95); // Entre 5 y 99
    return { rating: Math.round(rating * 10) / 10, reviews };
  };

  // Cargar profesionales y rubros desde el backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Cargar rubros y profesionales en paralelo
        const [rubrosData, professionalsData]: [any, any] = await Promise.all([
          rubroService.list().catch(() => []),
          profesionalService.list(),
        ]);

        if (!professionalsData || professionalsData.length === 0) {
          console.log('No hay profesionales en la BD');
          setProfessionals([]);
          setRubros([]);
        } else {
          // Extraer rubros únicos de los profesionales si no hay rubros en la BD
          const uniqueRubros = new Map<string, string>();
          professionalsData.forEach((prof: any) => {
            if (prof.id_rubro && !uniqueRubros.has(prof.id_rubro)) {
              uniqueRubros.set(prof.id_rubro, prof.id_rubro);
            }
          });

          // Si hay rubros del backend, usarlos; si no, usar los extraídos
          if (rubrosData && rubrosData.length > 0) {
            setRubros(rubrosData);
          } else {
            // Crear rubros desde los profesionales
            const extractedRubros: Rubro[] = Array.from(uniqueRubros.keys()).map(rubro => ({
              id_rubro: rubro,
              nombre: rubro,
            }));
            setRubros(extractedRubros);
            console.log(`Extraídos ${extractedRubros.length} rubros de los profesionales`);
          }

          // El backend retorna los datos completos en un solo request
          const enrichedProfessionals = professionalsData.map((prof: any) => {
            const { rating, reviews } = getRandomRating(prof.id_usuario_profesional);
            const locationParts = [prof.ciudad, prof.pais].filter(Boolean);
            const location = locationParts.length > 0 ? locationParts.join(', ') : 'Sin ubicación';
            return {
              id: prof.id_usuario_profesional,
              userId: prof.id_usuario, // Para identificar si es el usuario actual
              name: `${prof.nombre} ${prof.apellido}`,
              profession: prof.id_profesion,
              image: prof.foto_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + prof.id_usuario,
              rating,
              reviewCount: reviews,
              pricePerHour: prof.precioHora || 0,
              location,
              category: prof.id_rubro,
              categoryName: prof.id_rubro,
            };
          });

          setProfessionals(enrichedProfessionals);
          console.log(`Cargados ${enrichedProfessionals.length} profesionales desde la BD`);
        }
      } catch (error: any) {
        console.error('Error cargando datos:', error);
        toast({
          variant: 'destructive',
          title: 'Error al cargar datos',
          description: error.message || 'No se pudo conectar con el servidor',
        });
        setProfessionals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const filteredAndSortedProfessionals = useMemo(() => {
    let filtered = professionals;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (prof) =>
          (prof.name || '').toLowerCase().includes(term) ||
          (prof.profession || '').toLowerCase().includes(term) ||
          (prof.location || '').toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((prof) => prof.category === selectedCategory);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "price-low":
          return a.pricePerHour - b.pricePerHour;
        case "price-high":
          return b.pricePerHour - a.pricePerHour;
        case "reviews":
          return b.reviewCount - a.reviewCount;
        default:
          return 0;
      }
    });

    return sorted;
  }, [searchTerm, selectedCategory, sortBy, professionals]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
  };

  const hasActiveFilters = searchTerm !== "" || selectedCategory !== "all";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner with Search */}
      {/* Hero & How It Works Section */}
      <div className="relative overflow-hidden bg-background">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/20 via-background to-background opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/10 via-background to-background opacity-70" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

        <HeroBanner
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          resultsCount={filteredAndSortedProfessionals.length}
          loading={loading}
        />

        <HowItWorks />
      </div>

      {/* Main Content - Results Section */}
      <div ref={resultsRef} className="container mx-auto px-4 py-8 scroll-mt-20">
        {/* Filters */}
        <SearchFilters
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onClearFilters={clearFilters}
          loading={loading}
          hasActiveFilters={hasActiveFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          rubros={rubros}
        />

        {/* Results */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
            <p className="text-muted-foreground">Cargando profesionales...</p>
          </div>
        ) : filteredAndSortedProfessionals.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {filteredAndSortedProfessionals.map((professional) => (
              <ProfessionalCard
                key={professional.id}
                id={professional.id}
                name={professional.name}
                profession={professional.profession}
                image={professional.image}
                rating={professional.rating}
                reviewCount={professional.reviewCount}
                pricePerHour={professional.pricePerHour}
                location={professional.location}
                variant={viewMode}
                isCurrentUser={user && (user as any).id_usuario === professional.userId}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              {hasActiveFilters ? (
                <SearchX className="w-8 h-8 text-muted-foreground" />
              ) : (
                <Users className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {hasActiveFilters
                ? "No se encontraron resultados"
                : "No hay profesionales disponibles"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {hasActiveFilters
                ? "Intenta con otros términos de búsqueda o limpia los filtros"
                : "Aún no hay profesionales registrados en la plataforma"}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar Filtros
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Professionals;
