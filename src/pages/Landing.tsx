import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { CategoryCard } from "@/components/CategoryCard";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { categories, professionals } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { Search, Calendar, CreditCard, Star, ArrowRight, CheckCircle } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const featuredProfessionals = professionals.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-foreground">
              Reserva tu hora con los mejores profesionales de Chile
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Agenda online en segundos. Sin llamadas, sin esperas. Pago seguro y confirmación instantánea.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                variant="accent" 
                className="text-base h-12 px-8"
                onClick={() => navigate("/profesionales")}
              >
                Buscar Profesionales
                <ArrowRight className="ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-base h-12 px-8"
                onClick={() => navigate("/dashboard")}
              >
                Ofrecer mis Servicios
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Explora por Categoría
            </h2>
            <p className="text-lg text-muted-foreground">
              Encuentra el profesional perfecto para lo que necesitas
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                name={category.name}
                icon={category.icon}
                count={category.count}
                onClick={() => navigate(`/profesionales?categoria=${category.id}`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Cómo Funciona?
            </h2>
            <p className="text-lg text-muted-foreground">
              Reservar tu hora es más fácil que nunca
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto">
                <Search className="w-7 h-7 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold">1. Busca</h3>
              <p className="text-sm text-muted-foreground">
                Encuentra profesionales por categoría, ubicación o nombre
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto">
                <Calendar className="w-7 h-7 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold">2. Agenda</h3>
              <p className="text-sm text-muted-foreground">
                Selecciona fecha y hora disponible en tiempo real
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto">
                <CreditCard className="w-7 h-7 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold">3. Paga</h3>
              <p className="text-sm text-muted-foreground">
                Pago seguro online y confirmación instantánea
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Professionals */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Profesionales Destacados
            </h2>
            <p className="text-lg text-muted-foreground">
              Conoce a algunos de nuestros profesionales mejor valorados
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {featuredProfessionals.map((professional) => (
              <ProfessionalCard
                key={professional.id}
                id={professional.id}
                name={professional.name}
                profession={professional.profession}
                image={professional.image}
                rating={professional.rating}
                reviewCount={professional.reviewCount}
                pricePerHour={professional.pricePerHour}
                location={professional.location}
              />
            ))}
          </div>

          <div className="text-center mt-10">
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/profesionales")}
            >
              Ver Todos los Profesionales
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Por qué Tu Hora Ya!?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="text-center space-y-3">
              <CheckCircle className="w-10 h-10 text-foreground mx-auto" />
              <h3 className="font-semibold text-base">Verificado</h3>
              <p className="text-sm text-muted-foreground">
                Todos los profesionales están verificados
              </p>
            </div>

            <div className="text-center space-y-3">
              <Star className="w-10 h-10 text-foreground mx-auto" />
              <h3 className="font-semibold text-base">Reseñas Reales</h3>
              <p className="text-sm text-muted-foreground">
                Lee opiniones de clientes reales
              </p>
            </div>

            <div className="text-center space-y-3">
              <Calendar className="w-10 h-10 text-foreground mx-auto" />
              <h3 className="font-semibold text-base">Tiempo Real</h3>
              <p className="text-sm text-muted-foreground">
                Disponibilidad actualizada al instante
              </p>
            </div>

            <div className="text-center space-y-3">
              <CreditCard className="w-10 h-10 text-foreground mx-auto" />
              <h3 className="font-semibold text-base">Pago Seguro</h3>
              <p className="text-sm text-muted-foreground">
                Transacciones 100% protegidas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-foreground text-background">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para comenzar?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Únete a miles de chilenos que ya reservan sus horas online
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="accent"
              className="text-base h-12 px-8"
              onClick={() => navigate("/profesionales")}
            >
              Encontrar Profesional
            </Button>
            <Button 
              size="lg" 
              className="text-base h-12 px-8 bg-white text-foreground hover:bg-white/90"
              onClick={() => navigate("/registro")}
            >
              Registrarse Gratis
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary py-12 px-4 border-t">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-accent" />
                <span className="text-lg font-bold">Tu Hora Ya!</span>
              </div>
              <p className="text-sm text-muted-foreground">
                La plataforma líder de reservas para profesionales independientes en Chile.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Para Clientes</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer transition-colors">Buscar Profesionales</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Cómo Funciona</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Ayuda</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Para Profesionales</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer transition-colors">Registrarse</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Panel de Control</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Precios</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer transition-colors">Términos y Condiciones</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Política de Privacidad</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Contacto</li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 Tu Hora Ya! Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
