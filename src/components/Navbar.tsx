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
import { Calendar, Menu, LogOut, UserCircle, Moon, Sun, Monitor } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Logo } from "@/components/Logo";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
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

  // Obtener tipo de usuario (cliente o profesional)
  const getUserType = (): 'cliente' | 'profesional' | null => {
    if (!user) return null;

    if ("userType" in user) {
      return user.userType || null;
    }

    return null;
  };

  const userType = getUserType();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="cursor-pointer"
            onClick={() => navigate("/")}
          >
            <Logo variant="compact" />
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center flex-1">
            {isAuthenticated && (
              <button
                onClick={() => navigate("/dashboard")}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  location.pathname === "/dashboard"
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {userType === 'profesional' ? 'Mi Agenda' : 'Mis Reservas'}
              </button>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Cambiar tema</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="mr-2 h-4 w-4" />
                  Claro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="mr-2 h-4 w-4" />
                  Oscuro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Monitor className="mr-2 h-4 w-4" />
                  Sistema
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors">
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
                    {userType === 'profesional' ? 'Mi Agenda' : 'Mis Reservas'}
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

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-1">
            {/* Mobile Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t animate-in slide-in-from-top-2 duration-200">
            {isAuthenticated && (
              <button
                onClick={() => {
                  navigate("/dashboard");
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                  location.pathname === "/dashboard"
                    ? "bg-accent/10 text-accent"
                    : "hover:bg-muted"
                }`}
              >
                {userType === 'profesional' ? 'Mi Agenda' : 'Mis Reservas'}
              </button>
            )}

            <div className="px-4 pt-2 space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl mb-3">
                    <Avatar className="h-11 w-11 ring-2 ring-background">
                      <AvatarImage src={getUserPhoto()} alt={getUserName()} />
                      <AvatarFallback className="bg-accent text-accent-foreground">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{getUserName()}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {getUserEmail()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-11"
                    onClick={() => {
                      navigate("/perfil");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <UserCircle className="w-4 h-4 mr-3" />
                    Mi Perfil
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-11 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      navigate("/login");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Ingresar
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={() => {
                      navigate("/registro");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Registrarse
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
