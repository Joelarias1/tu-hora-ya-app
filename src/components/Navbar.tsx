import { Button } from "@/components/ui/button";
import { Calendar, User, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate("/")}
          >
            <Calendar className="w-7 h-7 text-accent" />
            <span className="text-xl font-bold text-foreground">
              Tu Hora Ya!
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => navigate("/profesionales")}
              className={`font-medium text-sm transition-colors ${
                location.pathname === "/profesionales"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Buscar Profesionales
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className={`font-medium text-sm transition-colors ${
                location.pathname === "/dashboard"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Soy Profesional
            </button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
              Ingresar
            </Button>
            <Button variant="default" size="sm" onClick={() => navigate("/registro")}>
              Registrarse
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t">
            <button
              onClick={() => {
                navigate("/profesionales");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-muted rounded-md"
            >
              Buscar Profesionales
            </button>
            <button
              onClick={() => {
                navigate("/dashboard");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-muted rounded-md"
            >
              Soy Profesional
            </button>
            <div className="px-4 space-y-2">
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => {
                  navigate("/login");
                  setMobileMenuOpen(false);
                }}
              >
                Ingresar
              </Button>
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => {
                  navigate("/registro");
                  setMobileMenuOpen(false);
                }}
              >
                Registrarse
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
