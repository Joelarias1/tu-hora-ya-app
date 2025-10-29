import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";
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
}: ProfessionalCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer group border">
      <div className="relative h-56 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      
      <CardContent className="pt-4 pb-3 space-y-2">
        <h3 className="font-semibold text-base line-clamp-1">{name}</h3>
        <p className="text-sm text-muted-foreground">{profession}</p>
        
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 fill-accent text-accent" />
          <span className="font-semibold text-sm">{rating}</span>
          <span className="text-xs text-muted-foreground">({reviewCount} reseñas)</span>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 mr-1" />
          {location}
        </div>
        
        <div className="pt-2 border-t">
          <span className="text-xl font-semibold text-foreground">
            ${pricePerHour.toLocaleString('es-CL')}
          </span>
          <span className="text-sm text-muted-foreground"> / hora</span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          className="w-full" 
          onClick={() => navigate(`/profesional/${id}`)}
          variant="default"
        >
          Ver Perfil
        </Button>
      </CardFooter>
    </Card>
  );
};
