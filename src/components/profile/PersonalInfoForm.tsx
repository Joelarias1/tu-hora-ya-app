import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Mail, Phone, Briefcase, Users } from 'lucide-react';

interface PersonalInfoFormProps {
  formData: {
    nombre: string;
    apellido: string;
    telefono: string;
    foto_url: string;
    userType: 'cliente' | 'profesional';
  };
  correo: string;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUserTypeChange: (value: 'cliente' | 'profesional') => void;
}

export const PersonalInfoForm = ({
  formData,
  correo,
  isEditing,
  onChange,
  onUserTypeChange,
}: PersonalInfoFormProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="nombre" className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          Nombre
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={onChange}
          disabled={!isEditing}
          placeholder="Tu nombre"
          className={!isEditing ? 'bg-muted' : ''}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="apellido" className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          Apellido
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="apellido"
          name="apellido"
          value={formData.apellido}
          onChange={onChange}
          disabled={!isEditing}
          placeholder="Tu apellido"
          className={!isEditing ? 'bg-muted' : ''}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefono" className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          Teléfono
        </Label>
        <Input
          id="telefono"
          name="telefono"
          value={formData.telefono}
          onChange={onChange}
          disabled={!isEditing}
          placeholder="+56 9 1234 5678"
          className={!isEditing ? 'bg-muted' : ''}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="userType" className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          Tipo de Cuenta
          <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.userType}
          onValueChange={onUserTypeChange}
          disabled={!isEditing}
        >
          <SelectTrigger className={!isEditing ? 'bg-muted' : ''}>
            <SelectValue placeholder="Selecciona tu tipo de cuenta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cliente">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Cliente</span>
              </div>
            </SelectItem>
            <SelectItem value="profesional">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>Profesional</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="correo" className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          Correo Electrónico
        </Label>
        <Input
          id="correo"
          value={correo}
          disabled
          className="bg-muted cursor-not-allowed"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="foto_url">URL de Foto de Perfil</Label>
        <Input
          id="foto_url"
          name="foto_url"
          value={formData.foto_url}
          onChange={onChange}
          disabled={!isEditing}
          placeholder="https://ejemplo.com/mi-foto.jpg"
          className={!isEditing ? 'bg-muted' : ''}
        />
      </div>
    </div>
  );
};
