import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfessionalCardProps {
  id: string;
  name: string;
  profession: string;
  image: string;
  rating: number;
  reviewCount: number;
  pricePerHour: number;
  location: string;
  variant?: 'grid' | 'list';
}

export const ProfessionalCard = ({
  id,
  name,
  profession,
  image,
  rating,
  reviewCount,
  pricePerHour,
  location,
  variant = 'grid',
}: ProfessionalCardProps) => {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (variant === 'list') {
    return (
      <Card
        className="overflow-hidden transition-all duration-200 hover:shadow-md hover:border-accent/30 cursor-pointer group"
        onClick={() => navigate(`/profesional/${id}`)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <Avatar className="h-16 w-16 ring-2 ring-background">
              <AvatarImage src={image} alt={name} className="object-cover" />
              <AvatarFallback className="bg-accent/10 text-accent text-lg">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-base line-clamp-1 group-hover:text-accent transition-colors">
                    {name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{profession}</p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  <Star className="w-3 h-3 fill-accent text-accent mr-1" />
                  {rating}
                </Badge>
              </div>

              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Disponible
                </span>
              </div>
            </div>

            {/* Price & Action */}
            <div className="text-right shrink-0">
              <div className="text-lg font-semibold">
                ${pricePerHour.toLocaleString('es-CL')}
                <span className="text-sm font-normal text-muted-foreground">/hr</span>
              </div>
              <Button size="sm" className="mt-2 group-hover:bg-accent">
                Ver Perfil
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid variant (default)
  return (
    <Card
      className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-accent/30 cursor-pointer group"
      onClick={() => navigate(`/profesional/${id}`)}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Rating Badge */}
        <Badge className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm text-foreground hover:bg-background/90">
          <Star className="w-3 h-3 fill-accent text-accent mr-1" />
          {rating}
        </Badge>

        {/* Name overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-semibold text-lg text-white line-clamp-1">{name}</h3>
          <p className="text-sm text-white/80">{profession}</p>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Location & Reviews */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            {location}
          </span>
          <span className="text-muted-foreground">
            {reviewCount} reseñas
          </span>
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Price & CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-foreground">
              ${pricePerHour.toLocaleString('es-CL')}
            </span>
            <span className="text-sm text-muted-foreground"> / hora</span>
          </div>
          <Button
            size="sm"
            className="group-hover:bg-accent group-hover:text-accent-foreground transition-colors"
          >
            Reservar
            <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
