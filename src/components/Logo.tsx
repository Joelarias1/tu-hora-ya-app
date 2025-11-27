interface LogoProps {
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
}

export const Logo = ({ variant = 'default', className = '' }: LogoProps) => {
  if (variant === 'icon-only') {
    return (
      <div className={`relative ${className}`}>
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-accent via-blue-500 to-blue-600 shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform">
          {/* Clock Icon */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 text-white"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {/* Sparkle effect */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-accent via-blue-500 to-blue-600 shadow-md flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-white"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Tu Hora Ya
        </span>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-accent via-blue-500 to-blue-600 shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform">
          {/* Clock Icon */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-7 h-7 text-white"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {/* Sparkle effect */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent to-blue-600 blur-md opacity-30 -z-10" />
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold leading-none bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
          Tu Hora Ya
        </span>
        <span className="text-xs text-muted-foreground font-medium">
          Reserva inteligente
        </span>
      </div>
    </div>
  );
};
