import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { professionals, categories } from "@/data/mockData";
import { Search, SlidersHorizontal } from "lucide-react";

const Professionals = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("rating");

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
  }, [searchTerm, selectedCategory, sortBy]);

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
            {filteredAndSortedProfessionals.length} profesionales disponibles
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
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
            <Select value={sortBy} onValueChange={setSortBy}>
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
            >
              Limpiar Filtros
            </Button>
          )}
        </div>

        {/* Results */}
        {filteredAndSortedProfessionals.length > 0 ? (
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
