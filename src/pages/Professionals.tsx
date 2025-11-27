import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { HeroBanner } from "@/components/professionals/HeroBanner";
import { SearchFilters } from "@/components/professionals/SearchFilters";
import { HowItWorks } from "@/components/HowItWorks";
import { Button } from "@/components/ui/button";
import { profesionalService, rubroService } from "@/services/api";
import { Loader2, Users, SearchX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Rubro {
  id_rubro: string;
  nombre: string;
  descripcion?: string;
}

const Professionals = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("rating");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [rubros, setRubros] = useState<Rubro[]>([]);

  // Cargar profesionales y rubros desde el backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Cargar rubros y profesionales en paralelo
        const [rubrosData, professionalsData]: [any, any] = await Promise.all([
          rubroService.list(),
          profesionalService.list(),
        ]);

        // Procesar rubros
        if (rubrosData && rubrosData.length > 0) {
          setRubros(rubrosData);
          console.log(`Cargados ${rubrosData.length} rubros desde la BD`);
        }

        if (!professionalsData || professionalsData.length === 0) {
          console.log('No hay profesionales en la BD');
          setProfessionals([]);
        } else {
          // Crear mapa de rubros para lookup rápido
          const rubrosMap = new Map(rubrosData?.map((r: Rubro) => [r.id_rubro, r.nombre]) || []);

          // El backend retorna los datos completos en un solo request
          const enrichedProfessionals = professionalsData.map((prof: any) => {
            return {
              id: prof.id_usuario_profesional,
              name: `${prof.nombre} ${prof.apellido}`,
              profession: prof.id_profesion,
              image: prof.foto_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + prof.id_usuario,
              rating: 5.0,
              reviewCount: 0,
              pricePerHour: 30000,
              location: 'Santiago, Chile',
              category: prof.id_rubro,
              categoryName: rubrosMap.get(prof.id_rubro) || prof.id_rubro,
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
      filtered = filtered.filter(
        (prof) =>
          prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prof.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prof.location.toLowerCase().includes(searchTerm.toLowerCase())
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
          onSearchChange={setSearchTerm}
          resultsCount={filteredAndSortedProfessionals.length}
          loading={loading}
        />

        <HowItWorks />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <SearchFilters
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
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
