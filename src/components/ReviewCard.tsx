import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface ReviewCardProps {
  userName: string;
  userImage?: string | null;   // ✅ nullable
  rating: number;
  comment: string;
  date?: string | null;        // ✅ nullable
}

const safeFormatDate = (date?: string | null) => {
  if (!date) return ""; // o "Sin fecha"

  // Si viene "YYYY-MM-DD", lo hacemos ISO para evitar timezone raro
  const iso = date.includes("T") ? date : `${date}T00:00:00`;
  const d = new Date(iso);

  if (isNaN(d.getTime())) return ""; // o "Sin fecha"

  return new Intl.DateTimeFormat("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
};

export const ReviewCard = ({ userName, userImage, rating, comment, date }: ReviewCardProps) => {
  const formattedDate = safeFormatDate(date);

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start gap-4">
          <img
            src={userImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`} // ✅ fallback
            alt={userName}
            className="w-12 h-12 rounded-full object-cover"
          />

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold">{userName}</h4>

              {/* ✅ si no hay fecha, no mostramos nada */}
              {formattedDate ? (
                <span className="text-sm text-muted-foreground">{formattedDate}</span>
              ) : null}
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
