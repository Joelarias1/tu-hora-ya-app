import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/data/mockData";
import { profesionalService } from "@/services/api";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Professionals = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("rating");
  const [loading, setLoading] = useState(true);
  const [professionals, setProfessionals] = useState<any[]>([]);

  // Cargar profesionales desde el backend
  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        setLoading(true);

        // Obtener lista de profesionales con datos de usuario incluidos
        const professionalsData: any = await profesionalService.list();

        if (!professionalsData || professionalsData.length === 0) {
          console.log('No hay profesionales en la BD');
          setProfessionals([]);
          toast({
            variant: 'default',
            title: 'Sin datos',
            description: 'No hay profesionales registrados en el sistema',
          });
        } else {
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
            };
          });

          setProfessionals(enrichedProfessionals);
          console.log(`Cargados ${enrichedProfessionals.length} profesionales desde la BD`);
        }
      } catch (error: any) {
        console.error('Error cargando profesionales:', error);
        toast({
          variant: 'destructive',
          title: 'Error al cargar profesionales',
          description: error.message || 'No se pudo conectar con el servidor',
        });
        setProfessionals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionals();
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Encuentra tu Profesional Ideal
          </h1>
          <p className="text-muted-foreground">
            {loading ? 'Cargando...' : `${filteredAndSortedProfessionals.length} profesionales disponibles`}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Buscar profesional por nombre, profesión o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 text-base rounded-full border-2 focus:border-accent"
              disabled={loading}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg border p-6 mb-8 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium mb-4">
            <SlidersHorizontal className="w-4 h-4" />
            Filtros Adicionales
          </div>

          <div className="grid md:grid-cols-2 gap-4">

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Mejor Valorados</SelectItem>
                <SelectItem value="reviews">Más Reseñas</SelectItem>
                <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
                <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchTerm || selectedCategory !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              disabled={loading}
            >
              Limpiar Filtros
            </Button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredAndSortedProfessionals.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground mb-4">
              No se encontraron profesionales con esos criterios
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
            >
              Ver Todos
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Professionals;
