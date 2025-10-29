# Tu Hora Ya! - Plataforma de Reservas Online

## Descripción del Proyecto

**Tu Hora Ya!** es una plataforma web que permite a los usuarios reservar citas con profesionales de diferentes áreas en Chile. La aplicación facilita la búsqueda, selección y reserva de servicios profesionales de manera rápida y segura.

## Características Principales

- **Búsqueda de Profesionales**: Encuentra profesionales por categoría, ubicación y disponibilidad
- **Sistema de Reservas**: Agenda citas de forma fácil e intuitiva
- **Perfiles Detallados**: Información completa de cada profesional incluyendo reseñas
- **Pago Seguro**: Sistema de pago integrado para confirmar reservas
- **Dashboard**: Panel de control para gestionar reservas y perfil
- **Autenticación**: Sistema de login y registro para usuarios

## Tecnologías Utilizadas

Este proyecto está construido con:

- **Vite** - Herramienta de construcción rápida
- **TypeScript** - Lenguaje de programación tipado
- **React** - Biblioteca de interfaz de usuario
- **React Router** - Enrutamiento del lado del cliente
- **shadcn/ui** - Componentes de interfaz de usuario
- **Tailwind CSS** - Framework de CSS utilitario
- **Lucide React** - Iconos
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas

## Instalación y Configuración

### Requisitos Previos

- Node.js (versión 18 o superior)
- Bun (recomendado) o npm

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>

# 2. Navegar al directorio del proyecto
cd tu-hora-ya

# 3. Instalar las dependencias (con Bun - recomendado)
bun install

# O con npm
npm install

# 4. Iniciar el servidor de desarrollo
bun run dev
# O con npm
npm run dev
```

### Scripts Disponibles

- `bun run dev` / `npm run dev` - Inicia el servidor de desarrollo
- `bun run build` / `npm run build` - Construye la aplicación para producción
- `bun run preview` / `npm run preview` - Previsualiza la construcción de producción
- `bun run lint` / `npm run lint` - Ejecuta el linter de código

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes de interfaz (shadcn/ui)
│   ├── CategoryCard.tsx
│   ├── Navbar.tsx
│   ├── ProfessionalCard.tsx
│   └── ReviewCard.tsx
├── pages/              # Páginas de la aplicación
│   ├── Landing.tsx
│   ├── Professionals.tsx
│   ├── ProfessionalProfile.tsx
│   ├── BookingImproved.tsx
│   ├── Payment.tsx
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   └── Register.tsx
├── data/               # Datos mock y configuración
├── hooks/              # Hooks personalizados
├── lib/                # Utilidades y configuraciones
└── main.tsx           # Punto de entrada de la aplicación
```

## Funcionalidades

### Para Usuarios
- Registro e inicio de sesión
- Búsqueda de profesionales por categoría
- Visualización de perfiles detallados
- Reserva de citas con calendario
- Sistema de pago
- Dashboard personal

### Para Profesionales
- Registro como profesional
- Gestión de perfil y servicios
- Dashboard de administración
- Gestión de citas

