import { Search, Calendar, CreditCard } from "lucide-react";

export const HowItWorks = () => {
  return (
    <section className="pb-20 px-4 relative z-10">
      <div className="container mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            ¿Cómo funciona <span className="text-accent">Tu Hora Ya</span>?
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Simplificamos el proceso de reserva para que puedas enfocarte en lo importante.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Step 1 */}
          <div className="relative group text-center space-y-6">
            <div className="relative z-10 w-24 h-24 mx-auto bg-background rounded-2xl shadow-lg border border-border/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:border-accent/50">
              <div className="absolute inset-0 bg-accent/5 rounded-2xl transform rotate-6 group-hover:rotate-12 transition-transform duration-300" />
              <Search className="w-10 h-10 text-accent relative z-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">1. Busca</h3>
              <p className="text-foreground/70 leading-relaxed">
                Explora cientos de profesionales verificados por categoría, especialidad o ubicación.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative group text-center space-y-6">
            <div className="relative z-10 w-24 h-24 mx-auto bg-background rounded-2xl shadow-lg border border-border/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:border-accent/50">
              <div className="absolute inset-0 bg-accent/5 rounded-2xl transform -rotate-3 group-hover:-rotate-6 transition-transform duration-300" />
              <Calendar className="w-10 h-10 text-accent relative z-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">2. Agenda</h3>
              <p className="text-foreground/70 leading-relaxed">
                Selecciona el horario que más te acomode en tiempo real. Sin esperas ni llamadas.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative group text-center space-y-6">
            <div className="relative z-10 w-24 h-24 mx-auto bg-background rounded-2xl shadow-lg border border-border/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:border-accent/50">
              <div className="absolute inset-0 bg-accent/5 rounded-2xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300" />
              <CreditCard className="w-10 h-10 text-accent relative z-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">3. Confirma</h3>
              <p className="text-foreground/70 leading-relaxed">
                Realiza el pago de forma segura y recibe tu confirmación inmediata en tu correo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
