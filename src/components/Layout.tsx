import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, Target, Upload, BarChart3, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, loading } = useAuth();
  const { isAdmin } = useUserRoles();
  
  const isActive = (path: string) => location.pathname === path;
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="relative z-50 w-full border-b-4 border-accent shadow-game-glow" style={{
        background: 'var(--gradient-primary)',
        boxShadow: 'var(--shadow-game), inset 0 -4px 8px hsl(var(--accent) / 0.3)'
      }}>
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-xl overflow-hidden">
                <img 
                  src="/lovable-uploads/871bd5d6-3539-44e4-b836-033e1d1f56a4.png" 
                  alt="Merge Royal Logo" 
                  className="h-12 w-12 md:h-14 md:w-14 object-contain drop-shadow-lg"
                />
              </div>
              <h1 className="text-3xl font-game-title text-game-title text-foreground">
                Merge Royal
              </h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8 text-lg font-game font-bold">
              <Link 
                to="/" 
                className={`flex items-center space-x-2 transition-all duration-200 hover:scale-105 ${
                  isActive('/') ? 'text-accent' : 'text-foreground/90 hover:text-accent'
                }`}
              >
                <Target className="h-5 w-5" strokeWidth={3} />
                <span className="text-game-body">Advice</span>
              </Link>
              <Link 
                to="/upload" 
                className={`flex items-center space-x-2 transition-all duration-200 hover:scale-105 ${
                  isActive('/upload') ? 'text-accent' : 'text-foreground/90 hover:text-accent'
                }`}
              >
                <Upload className="h-5 w-5" strokeWidth={3} />
                <span className="text-game-body">Upload</span>
              </Link>
              {/* Stats tab - Only visible to admin */}
              {isAdmin && (
                <Link 
                  to="/stats" 
                  className={`flex items-center space-x-2 transition-all duration-200 hover:scale-105 ${
                    isActive('/stats') ? 'text-accent' : 'text-foreground/90 hover:text-accent'
                  }`}
                >
                  <BarChart3 className="h-5 w-5" strokeWidth={3} />
                  <span className="text-game-body">Stats</span>
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="text-foreground/60 font-game">Loading...</div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-accent" />
                  <span className="font-game text-foreground">
                    {profile?.email}
                    {profile?.is_admin && (
                      <span className="ml-2 text-xs bg-accent text-accent-foreground px-2 py-1 rounded font-game-title">
                        ADMIN
                      </span>
                    )}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="font-game-title border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground shadow-game transition-all duration-200 hover:scale-105"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="lg" 
                className="font-game-title text-lg border-3 border-accent text-accent hover:bg-accent hover:text-accent-foreground shadow-game transition-all duration-200 hover:scale-105"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-50 border-t-4 border-accent py-8 text-center shadow-game" style={{
        background: 'var(--gradient-primary)',
        boxShadow: 'var(--shadow-game), inset 0 4px 8px hsl(var(--accent) / 0.3)'
      }}>
        <div className="container">
          <p className="text-lg font-game-title text-game-title text-foreground">
            Merge Royal
          </p>
          <p className="text-sm font-game text-foreground/80 mt-2">
            Built by the community
          </p>
        </div>
      </footer>
    </div>
  );
}