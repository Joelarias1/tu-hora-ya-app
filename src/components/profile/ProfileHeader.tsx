import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Edit2, Briefcase } from 'lucide-react';

interface ProfileHeaderProps {
  nombre: string;
  apellido: string;
  correo: string;
  fotoUrl: string;
  profesion?: string;
  isProfesional: boolean;
  isEditing: boolean;
  onEdit: () => void;
}

export const ProfileHeader = ({
  nombre,
  apellido,
  correo,
  fotoUrl,
  profesion,
  isProfesional,
  isEditing,
  onEdit,
}: ProfileHeaderProps) => {
  const initials = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();

  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-2 border-primary">
            {fotoUrl && <AvatarImage src={fotoUrl} alt={nombre} />}
            <AvatarFallback className="text-xl bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">
              {nombre} {apellido}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Mail className="h-4 w-4" />
              {correo}
            </CardDescription>
            {isProfesional && profesion && (
              <Badge variant="secondary" className="mt-2">
                <Briefcase className="h-3 w-3 mr-1" />
                {profesion}
              </Badge>
            )}
          </div>
        </div>

        {!isEditing && (
          <Button onClick={onEdit} variant="outline" size="sm">
            <Edit2 className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </div>
    </CardHeader>
  );
};
