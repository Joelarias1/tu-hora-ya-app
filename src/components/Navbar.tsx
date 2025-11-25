import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, User, Menu, LogOut, UserCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Obtener iniciales del usuario
  const getUserInitials = () => {
    if (!user) return "U";

    // Para usuarios de Azure AD (AccountInfo)
    if ("username" in user) {
      const email = user.username || "";
      return email.substring(0, 2).toUpperCase();
    }

    // Para usuarios con credenciales tradicionales (UserData)
    if ("nombre" in user && "apellido" in user) {
      return `${user.nombre?.[0] || ""}${user.apellido?.[0] || ""}`.toUpperCase();
    }

    return "U";
  };

  // Obtener nombre del usuario
  const getUserName = () => {
    if (!user) return "";

    // Para usuarios de Azure AD
    if ("username" in user) {
      return user.username || user.name || "Usuario";
    }

    // Para usuarios con credenciales tradicionales
    if ("nombre" in user && "apellido" in user) {
      return `${user.nombre || ""} ${user.apellido || ""}`.trim() || "Usuario";
    }

    return "Usuario";
  };

  // Obtener correo del usuario
  const getUserEmail = () => {
    if (!user) return "";

    // Para usuarios de Azure AD
    if ("username" in user) {
      return user.username || "";
    }

    // Para usuarios con credenciales tradicionales
    if ("correo" in user) {
      return user.correo || "";
    }

    return "";
  };

  // Obtener foto del usuario
  const getUserPhoto = () => {
    if (!user) return undefined;

    // Para usuarios con credenciales tradicionales
    if ("foto_url" in user) {
      return user.foto_url || undefined;
    }

    return undefined;
  };

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
            {isAuthenticated && (
              <button
                onClick={() => navigate("/dashboard")}
                className={`font-medium text-sm transition-colors ${
                  location.pathname === "/dashboard"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Mis Reservas
              </button>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getUserPhoto()} alt={getUserName()} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden lg:block">
                      {getUserName()}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{getUserName()}</span>
                      <span className="text-xs text-muted-foreground">
                        {getUserEmail()}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/perfil")}>
                    <UserCircle className="w-4 h-4 mr-2" />
                    Mi Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Mis Reservas
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                  Ingresar
                </Button>
                <Button variant="default" size="sm" onClick={() => navigate("/registro")}>
                  Registrarse
                </Button>
              </>
            )}
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
            {isAuthenticated && (
              <button
                onClick={() => {
                  navigate("/dashboard");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-muted rounded-md"
              >
                Mis Reservas
              </button>
            )}
            <div className="px-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-md mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getUserPhoto()} alt={getUserName()} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{getUserName()}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {getUserEmail()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate("/perfil");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <UserCircle className="w-4 h-4 mr-2" />
                    Mi Perfil
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-600"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
