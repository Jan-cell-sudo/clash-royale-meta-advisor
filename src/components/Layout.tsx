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
                  className="h-12 w-12 md:h-14 md:w-14 object-contain drop-shadow-lg rounded-lg"
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
              <div className="flex items-center space-x-2 md:space-x-4">
                <div className="hidden md:flex items-center space-x-2">
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
                <div className="md:hidden flex items-center space-x-1">
                  <User className="h-4 w-4 text-accent" />
                  {profile?.is_admin && (
                    <span className="text-xs bg-accent text-accent-foreground px-1 py-0.5 rounded font-game-title">
                      ADMIN
                    </span>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="font-game-title border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground shadow-game transition-all duration-200 hover:scale-105 text-xs md:text-sm"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">Sign Out</span>
                  <span className="md:hidden">Out</span>
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t-4 border-accent bg-gradient-primary shadow-game">
        <div className="flex items-center justify-around py-2 px-4">
          <Link 
            to="/" 
            className={`flex flex-col items-center p-2 rounded-lg transition-all ${
              isActive('/') ? 'text-accent bg-accent/10' : 'text-foreground/70'
            }`}
          >
            <Target className="h-5 w-5" strokeWidth={3} />
            <span className="text-xs font-game-title mt-1">Advice</span>
          </Link>
          <Link 
            to="/upload" 
            className={`flex flex-col items-center p-2 rounded-lg transition-all ${
              isActive('/upload') ? 'text-accent bg-accent/10' : 'text-foreground/70'
            }`}
          >
            <Upload className="h-5 w-5" strokeWidth={3} />
            <span className="text-xs font-game-title mt-1">Upload</span>
          </Link>
          {isAdmin && (
            <Link 
              to="/stats" 
              className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                isActive('/stats') ? 'text-accent bg-accent/10' : 'text-foreground/70'
              }`}
            >
              <BarChart3 className="h-5 w-5" strokeWidth={3} />
              <span className="text-xs font-game-title mt-1">Stats</span>
            </Link>
          )}
          {!user && (
            <Button 
              variant="outline" 
              size="sm" 
              className="font-game-title border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground shadow-game transition-all duration-200"
              onClick={() => navigate('/auth')}
            >
              <User className="h-4 w-4 mr-1" />
              Sign In
            </Button>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-50 border-t-4 border-accent py-8 text-center shadow-game rounded-t-lg" style={{
        background: 'var(--gradient-primary)',
        boxShadow: 'var(--shadow-game), inset 0 4px 8px hsl(var(--accent) / 0.3)'
      }}>
        <div className="container">
          <div className="text-center">
            <p className="text-2xl font-game-title text-foreground mb-1">
              Merge Royal
            </p>
            <p className="text-sm font-game text-foreground/70">
              Built by the community
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}