import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getInitials, getAvatarColor, isValidImageUrl } from "@/lib/utils/avatar";

interface ProfessionalCardProps {
  id: string;
  name: string;
  profession: string;
  image?: string;
  rating: number;
  reviewCount: number;
  pricePerHour: number;
  location: string;
  variant?: 'grid' | 'list';
  isCurrentUser?: boolean;
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
  isCurrentUser = false,
}: ProfessionalCardProps) => {
  const navigate = useNavigate();
  const isValidImage = isValidImageUrl(image);
  const displayName = isCurrentUser ? `${name} (Tú)` : name;

  if (variant === 'list') {
    return (
      <Card
        className={`overflow-hidden transition-all duration-200 hover:shadow-md hover:border-accent/30 cursor-pointer group ${isCurrentUser ? 'ring-2 ring-accent border-accent' : ''}`}
        onClick={() => navigate(`/profesional/${id}`)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {isCurrentUser && (
                <Badge className="absolute -top-1 -right-1 z-10 bg-accent text-accent-foreground text-xs px-1.5 py-0.5">
                  Tú
                </Badge>
              )}
              <Avatar className="h-16 w-16 ring-2 ring-background">
              {isValidImage && <AvatarImage src={image} alt={name} className="object-cover" />}
              <AvatarFallback className={`${getAvatarColor(name)} text-white text-lg font-semibold`}>
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-base line-clamp-1 group-hover:text-accent transition-colors">
                    {displayName}
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

            <div className="text-right shrink-0">
              <div className="text-lg font-semibold">
                ${pricePerHour.toLocaleString('es-CL')}
                <span className="text-sm font-normal text-muted-foreground">/consulta</span>
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

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-accent/30 cursor-pointer group ${isCurrentUser ? 'ring-2 ring-accent border-accent' : ''}`}
      onClick={() => navigate(`/profesional/${id}`)}
    >
      <div className="relative h-48 overflow-hidden bg-muted">
        {isCurrentUser && (
          <Badge className="absolute top-3 left-3 z-10 bg-accent text-accent-foreground">
            Tu perfil
          </Badge>
        )}
        {isValidImage ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${getAvatarColor(name)} transition-transform duration-300 group-hover:scale-105`}>
            <span className="text-5xl font-bold text-white/90">
              {getInitials(name)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <Badge className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm text-foreground hover:bg-background/90">
          <Star className="w-3 h-3 fill-accent text-accent mr-1" />
          {rating}
        </Badge>

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-semibold text-lg text-white line-clamp-1">{displayName}</h3>
          <p className="text-sm text-white/80">{profession}</p>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            {location}
          </span>
          <span className="text-muted-foreground">
            {reviewCount} reseñas
          </span>
        </div>

        <div className="border-t" />

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-foreground">
              ${pricePerHour.toLocaleString('es-CL')}
            </span>
            <span className="text-sm text-muted-foreground"> / consulta</span>
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
