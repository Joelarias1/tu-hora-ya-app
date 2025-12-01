import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Briefcase, MapPin, Clock, FileText, Plus, X, DollarSign } from 'lucide-react';

interface Profesion {
  id_profesion: string;
  nombre: string;
}

interface Rubro {
  id_rubro: string;
  nombre: string;
}

interface ProfesionalData {
  profesion: string;
  rubro: string;
  descripcion: string;
  experiencia: string;
  pais: string;
  ciudad: string;
  servicios: string[];
  precioHora: number;
}

interface ProfessionalInfoFormProps {
  data: ProfesionalData;
  profesiones: Profesion[];
  rubros: Rubro[];
  isEditing: boolean;
  newService: string;
  onDataChange: (field: keyof ProfesionalData, value: string) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onNewServiceChange: (value: string) => void;
  onAddService: () => void;
  onRemoveService: (service: string) => void;
}

const DEFAULT_PROFESIONES = [
  'Psicólogo', 'Dentista', 'Abogado', 'Programador', 'Diseñador',
  'Electricista', 'Plomero', 'Chef', 'Profesor', 'Mecánico'
];

const DEFAULT_RUBROS = [
  'Salud', 'Legal', 'Tecnología', 'Construcción',
  'Gastronomía', 'Educación', 'Arte', 'Automotriz'
];

const PAISES = ['Chile', 'Argentina', 'Perú', 'Colombia', 'México', 'España'];

const EXPERIENCIA_OPTIONS = [
  'Menos de 1 año', '1-2 años', '3-5 años', '5-10 años', 'Más de 10 años'
];

export const ProfessionalInfoForm = ({
  data,
  profesiones,
  rubros,
  isEditing,
  newService,
  onDataChange,
  onInputChange,
  onNewServiceChange,
  onAddService,
  onRemoveService,
}: ProfessionalInfoFormProps) => {
  const profesionOptions = profesiones.length > 0
    ? profesiones.map(p => p.nombre)
    : DEFAULT_PROFESIONES;

  const rubroOptions = rubros.length > 0
    ? rubros.map(r => r.nombre)
    : DEFAULT_RUBROS;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Información Profesional
        </CardTitle>
        <CardDescription>
          Completa tu perfil profesional para aparecer en las búsquedas.
          <span className="text-destructive ml-1">*</span> Campos requeridos
        </CardDescription>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              Profesión
              <span className="text-destructive">*</span>
            </Label>
            <Select
              value={data.profesion}
              onValueChange={(value) => onDataChange('profesion', value)}
              disabled={!isEditing}
            >
              <SelectTrigger className={!isEditing ? 'bg-muted' : ''}>
                <SelectValue placeholder="Selecciona tu profesión" />
              </SelectTrigger>
              <SelectContent>
                {profesionOptions.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              Rubro / Categoría
              <span className="text-destructive">*</span>
            </Label>
            <Select
              value={data.rubro}
              onValueChange={(value) => onDataChange('rubro', value)}
              disabled={!isEditing}
            >
              <SelectTrigger className={!isEditing ? 'bg-muted' : ''}>
                <SelectValue placeholder="Selecciona tu rubro" />
              </SelectTrigger>
              <SelectContent>
                {rubroOptions.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              País
            </Label>
            <Select
              value={data.pais}
              onValueChange={(value) => onDataChange('pais', value)}
              disabled={!isEditing}
            >
              <SelectTrigger className={!isEditing ? 'bg-muted' : ''}>
                <SelectValue placeholder="Selecciona tu país" />
              </SelectTrigger>
              <SelectContent>
                {PAISES.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ciudad" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Ciudad
            </Label>
            <Input
              id="ciudad"
              name="ciudad"
              value={data.ciudad}
              onChange={onInputChange}
              disabled={!isEditing}
              placeholder="Ej: Santiago"
              className={!isEditing ? 'bg-muted' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Experiencia
            </Label>
            <Select
              value={data.experiencia}
              onValueChange={(value) => onDataChange('experiencia', value)}
              disabled={!isEditing}
            >
              <SelectTrigger className={!isEditing ? 'bg-muted' : ''}>
                <SelectValue placeholder="Años de experiencia" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCIA_OPTIONS.map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="precioHora" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Precio por consulta (CLP)
              <span className="text-destructive">*</span>
            </Label>
            {isEditing ? (
              <Input
                id="precioHora"
                name="precioHora"
                type="number"
                min="0"
                step="1000"
                value={data.precioHora || 0}
                onChange={(e) => onDataChange('precioHora', e.target.value)}
                placeholder="Ej: 25000"
              />
            ) : (
              <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                ${(data.precioHora || 0).toLocaleString('es-CL')}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Define cuánto cobras por cada consulta
            </p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="descripcion" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Sobre mí
            </Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              value={data.descripcion}
              onChange={onInputChange}
              disabled={!isEditing}
              placeholder="Cuéntanos sobre ti, tu experiencia y lo que te hace único..."
              className={`min-h-[120px] ${!isEditing ? 'bg-muted' : ''}`}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              Servicios que ofreces
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {data.servicios.map((service) => (
                <Badge key={service} variant="secondary" className="gap-1">
                  {service}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => onRemoveService(service)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {data.servicios.length === 0 && !isEditing && (
                <span className="text-sm text-muted-foreground">
                  No hay servicios agregados
                </span>
              )}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  value={newService}
                  onChange={(e) => onNewServiceChange(e.target.value)}
                  placeholder="Ej: Consulta inicial, Asesoría legal..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAddService())}
                />
                <Button type="button" variant="outline" onClick={onAddService}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
