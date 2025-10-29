import { Card, CardContent } from "@/components/ui/card";
import { Heart, Sparkles, Smile, GraduationCap, Dumbbell, Wrench } from "lucide-react";

const iconMap = {
  Heart,
  Sparkles,
  Smile,
  GraduationCap,
  Dumbbell,
  Wrench,
};

interface CategoryCardProps {
  name: string;
  icon: string;
  count: number;
  onClick?: () => void;
}

export const CategoryCard = ({ name, icon, count, onClick }: CategoryCardProps) => {
  const Icon = iconMap[icon as keyof typeof iconMap];

  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-md border hover:border-foreground/20 group"
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
        <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center group-hover:bg-secondary/80 transition-colors">
          {Icon && <Icon className="w-7 h-7 text-foreground" />}
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-base">{name}</h3>
          <p className="text-xs text-muted-foreground">{count} profesionales</p>
        </div>
      </CardContent>
    </Card>
  );
};
