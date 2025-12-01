import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface HeroBannerProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  resultsCount: number;
  loading: boolean;
}

export const HeroBanner = ({
  searchTerm,
  onSearchChange,
  resultsCount,
  loading,
}: HeroBannerProps) => {
  return (
    <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
      <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium backdrop-blur-sm animate-fade-in-up">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
            </span>
            {loading ? 'Cargando profesionales...' : `${resultsCount} profesionales disponibles hoy`}
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground animate-fade-in-up delay-100">
            Encuentra tu{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-600">
              Profesional Ideal
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            Conecta con expertos verificados en salud, bienestar y servicios. 
            <br className="hidden md:block" />
            Agenda tu cita en minutos, sin complicaciones.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto pt-8 animate-fade-in-up delay-300">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="relative flex items-center">
                <Search className="absolute left-6 text-muted-foreground w-6 h-6 z-10" />
                <Input
                  placeholder="¿Qué servicio estás buscando?"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-16 pr-6 h-16 text-lg rounded-xl border-2 border-border bg-background/90 backdrop-blur-xl focus:border-accent focus:ring-0 transition-all shadow-xl"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Quick Tags - Profesiones reales del sistema */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {['Psicólogo', 'Dentista', 'Abogado', 'Programador', 'Electricista', 'Chef'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => onSearchChange(tag)}
                  className="px-4 py-1.5 text-sm font-medium rounded-full bg-secondary/50 hover:bg-accent hover:text-white border border-border hover:border-accent transition-all duration-300"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
      </div>
    </div>
  );
};
