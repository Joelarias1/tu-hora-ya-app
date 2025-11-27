import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal, X, LayoutGrid, List } from "lucide-react";

interface Rubro {
  id_rubro: string;
  nombre: string;
  descripcion?: string;
}

interface SearchFiltersProps {
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
  loading: boolean;
  hasActiveFilters: boolean;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  rubros: Rubro[];
}

export const SearchFilters = ({
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  onClearFilters,
  loading,
  hasActiveFilters,
  viewMode,
  onViewModeChange,
  rubros,
}: SearchFiltersProps) => {
  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-4 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left - Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Select
              value={selectedCategory}
              onValueChange={onCategoryChange}
              disabled={loading}
            >
              <SelectTrigger className="w-[180px] h-9 text-sm">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los rubros</SelectItem>
                {rubros.map((rubro) => (
                  <SelectItem key={rubro.id_rubro} value={rubro.id_rubro}>
                    {rubro.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={onSortChange} disabled={loading}>
              <SelectTrigger className="w-[180px] h-9 text-sm">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Mejor Valorados</SelectItem>
                <SelectItem value="reviews">Más Reseñas</SelectItem>
                <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
                <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                disabled={loading}
                className="h-9 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Limpiar
              </Button>
            )}
          </div>
        </div>

        {/* Right - View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => onViewModeChange('grid')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => onViewModeChange('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
