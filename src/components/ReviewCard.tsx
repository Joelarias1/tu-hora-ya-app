import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface ReviewCardProps {
  userName: string;
  userImage: string;
  rating: number;
  comment: string;
  date: string;
}

export const ReviewCard = ({ userName, userImage, rating, comment, date }: ReviewCardProps) => {
  const formattedDate = new Date(date).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start gap-4">
          <img
            src={userImage}
            alt={userName}
            className="w-12 h-12 rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold">{userName}</h4>
              <span className="text-sm text-muted-foreground">{formattedDate}</span>
            </div>
            <div className="flex gap-0.5 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < rating ? "fill-accent text-accent" : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-muted-foreground">{comment}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
