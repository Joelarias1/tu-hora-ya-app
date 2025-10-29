export interface Professional {
  id: string;
  name: string;
  profession: string;
  category: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  pricePerHour: number;
  location: string;
  experience: string;
  services: string[];
  availability: {
    day: string;
    slots: string[];
  }[];
}

export interface Review {
  id: string;
  professionalId: string;
  userName: string;
  userImage: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export const categories: Category[] = [
  { id: "salud", name: "Salud", icon: "Heart", count: 45 },
  { id: "belleza", name: "Belleza", icon: "Sparkles", count: 38 },
  { id: "bienestar", name: "Bienestar", icon: "Smile", count: 52 },
  { id: "educacion", name: "Educación", icon: "GraduationCap", count: 67 },
  { id: "deporte", name: "Deporte", icon: "Dumbbell", count: 29 },
  { id: "tecnicos", name: "Servicios Técnicos", icon: "Wrench", count: 34 },
];

export const professionals: Professional[] = [
  {
    id: "1",
    name: "Dra. María Fernanda Silva",
    profession: "Psicóloga Clínica",
    category: "salud",
    description: "Psicóloga especializada en terapia cognitivo-conductual con más de 10 años de experiencia. Atención personalizada para ansiedad, depresión y manejo del estrés.",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop",
    rating: 4.9,
    reviewCount: 127,
    pricePerHour: 35000,
    location: "Las Condes, Santiago",
    experience: "10+ años",
    services: ["Terapia individual", "Terapia de pareja", "Manejo del estrés", "Ansiedad"],
    availability: [
      { day: "Lunes", slots: ["09:00", "10:00", "15:00", "16:00"] },
      { day: "Martes", slots: ["09:00", "11:00", "14:00", "16:00"] },
      { day: "Miércoles", slots: ["10:00", "15:00", "17:00"] },
      { day: "Jueves", slots: ["09:00", "11:00", "15:00", "16:00"] },
      { day: "Viernes", slots: ["09:00", "10:00", "14:00"] },
    ],
  },
  {
    id: "2",
    name: "Carlos Muñoz",
    profession: "Kinesiólogo",
    category: "salud",
    description: "Kinesiólogo deportivo especializado en rehabilitación de lesiones y prevención. Trabajo con deportistas amateur y profesionales.",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop",
    rating: 4.8,
    reviewCount: 93,
    pricePerHour: 30000,
    location: "Providencia, Santiago",
    experience: "8 años",
    services: ["Rehabilitación deportiva", "Kinesiología traumatológica", "Masoterapia", "Prevención de lesiones"],
    availability: [
      { day: "Lunes", slots: ["08:00", "09:00", "16:00", "17:00", "18:00"] },
      { day: "Martes", slots: ["08:00", "09:00", "17:00", "18:00"] },
      { day: "Miércoles", slots: ["08:00", "16:00", "17:00", "18:00"] },
      { day: "Jueves", slots: ["08:00", "09:00", "16:00", "18:00"] },
      { day: "Viernes", slots: ["08:00", "09:00", "17:00"] },
    ],
  },
  {
    id: "3",
    name: "Valentina Rojas",
    profession: "Estilista Profesional",
    category: "belleza",
    description: "Estilista con formación internacional. Especializada en cortes modernos, coloración y tratamientos capilares. Trabajo con productos de primera calidad.",
    image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop",
    rating: 4.9,
    reviewCount: 156,
    pricePerHour: 25000,
    location: "Vitacura, Santiago",
    experience: "12 años",
    services: ["Corte", "Coloración", "Mechas", "Tratamientos", "Peinados"],
    availability: [
      { day: "Martes", slots: ["10:00", "11:00", "14:00", "15:00", "16:00"] },
      { day: "Miércoles", slots: ["10:00", "11:00", "14:00", "15:00", "16:00"] },
      { day: "Jueves", slots: ["10:00", "14:00", "15:00", "16:00"] },
      { day: "Viernes", slots: ["10:00", "11:00", "14:00", "15:00"] },
      { day: "Sábado", slots: ["09:00", "10:00", "11:00", "12:00"] },
    ],
  },
  {
    id: "4",
    name: "Sebastián Torres",
    profession: "Entrenador Personal",
    category: "deporte",
    description: "Entrenador certificado especializado en fitness funcional y pérdida de peso. Planes personalizados según tus objetivos.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop",
    rating: 4.7,
    reviewCount: 84,
    pricePerHour: 28000,
    location: "Ñuñoa, Santiago",
    experience: "6 años",
    services: ["Entrenamiento funcional", "Pérdida de peso", "Ganancia muscular", "Planificación nutricional"],
    availability: [
      { day: "Lunes", slots: ["07:00", "08:00", "18:00", "19:00", "20:00"] },
      { day: "Martes", slots: ["07:00", "08:00", "18:00", "19:00", "20:00"] },
      { day: "Miércoles", slots: ["07:00", "18:00", "19:00", "20:00"] },
      { day: "Jueves", slots: ["07:00", "08:00", "18:00", "19:00"] },
      { day: "Viernes", slots: ["07:00", "08:00", "18:00", "19:00"] },
    ],
  },
  {
    id: "5",
    name: "Pamela Cortés",
    profession: "Nutricionista",
    category: "salud",
    description: "Nutricionista clínica especializada en nutrición deportiva y control de peso. Atención personalizada con seguimiento continuo.",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
    rating: 4.8,
    reviewCount: 112,
    pricePerHour: 32000,
    location: "La Reina, Santiago",
    experience: "9 años",
    services: ["Evaluación nutricional", "Planes alimentarios", "Nutrición deportiva", "Control de peso"],
    availability: [
      { day: "Lunes", slots: ["09:00", "10:00", "11:00", "15:00", "16:00"] },
      { day: "Martes", slots: ["09:00", "10:00", "15:00", "16:00", "17:00"] },
      { day: "Miércoles", slots: ["09:00", "11:00", "15:00", "16:00"] },
      { day: "Jueves", slots: ["09:00", "10:00", "11:00", "16:00"] },
      { day: "Viernes", slots: ["09:00", "10:00", "15:00"] },
    ],
  },
  {
    id: "6",
    name: "Prof. Diego Méndez",
    profession: "Profesor de Inglés",
    category: "educacion",
    description: "Profesor certificado TESOL con experiencia en preparación de exámenes internacionales. Clases dinámicas y conversacionales.",
    image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop",
    rating: 4.9,
    reviewCount: 145,
    pricePerHour: 22000,
    location: "Online / Santiago Centro",
    experience: "11 años",
    services: ["Inglés conversacional", "Preparación TOEFL", "Preparación IELTS", "Inglés de negocios"],
    availability: [
      { day: "Lunes", slots: ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00"] },
      { day: "Martes", slots: ["14:00", "15:00", "16:00", "17:00", "18:00"] },
      { day: "Miércoles", slots: ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00"] },
      { day: "Jueves", slots: ["14:00", "16:00", "17:00", "18:00", "19:00"] },
      { day: "Viernes", slots: ["14:00", "15:00", "16:00", "17:00"] },
    ],
  },
];

export const reviews: Review[] = [
  {
    id: "1",
    professionalId: "1",
    userName: "Andrea López",
    userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Andrea",
    rating: 5,
    comment: "Excelente profesional, muy empática y me ha ayudado muchísimo. Totalmente recomendada.",
    date: "2025-01-15",
  },
  {
    id: "2",
    professionalId: "1",
    userName: "Roberto Guzmán",
    userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto",
    rating: 5,
    comment: "La Dra. Silva es increíble. He tenido grandes avances en mi terapia gracias a su profesionalismo.",
    date: "2025-01-10",
  },
  {
    id: "3",
    professionalId: "2",
    userName: "Carolina Flores",
    userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carolina",
    rating: 5,
    comment: "Me recuperé de mi lesión mucho más rápido de lo esperado. Carlos es muy profesional y atento.",
    date: "2025-01-18",
  },
  {
    id: "4",
    professionalId: "3",
    userName: "Sofía Martínez",
    userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia",
    rating: 5,
    comment: "¡Amo mi nuevo look! Valentina es una artista, super recomendada.",
    date: "2025-01-20",
  },
];
