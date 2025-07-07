import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Crown, Target, Upload, BarChart3 } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
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
              <div className="flex h-12 w-12 items-center justify-center rounded-xl shadow-winner animate-bounce-subtle border-3 border-accent" style={{
                background: 'var(--gradient-winner)',
                boxShadow: 'var(--shadow-inset), 0 0 20px hsl(45 100% 55% / 0.8)'
              }}>
                <Crown className="h-6 w-6 text-accent-foreground drop-shadow-lg" strokeWidth={3} />
              </div>
              <h1 className="text-3xl font-game-title text-game-title text-foreground">
                CMR-A
              </h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8 text-lg font-game font-bold">
              <a href="/" className="flex items-center space-x-2 text-foreground/90 hover:text-accent transition-all duration-200 hover:scale-105">
                <Target className="h-5 w-5" strokeWidth={3} />
                <span className="text-game-body">Advice</span>
              </a>
              <a href="/upload" className="flex items-center space-x-2 text-foreground/90 hover:text-accent transition-all duration-200 hover:scale-105">
                <Upload className="h-5 w-5" strokeWidth={3} />
                <span className="text-game-body">Upload</span>
              </a>
              <a href="/stats" className="flex items-center space-x-2 text-foreground/90 hover:text-accent transition-all duration-200 hover:scale-105">
                <BarChart3 className="h-5 w-5" strokeWidth={3} />
                <span className="text-game-body">Stats</span>
              </a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="lg" 
              className="font-game-title text-lg border-3 border-accent text-accent hover:bg-accent hover:text-accent-foreground shadow-game transition-all duration-200 hover:scale-105"
              onClick={() => {
                // For now, show a coming soon message
                alert("Authentication coming soon! You'll be able to sign in to save your preferences and contribute screenshots.");
              }}
            >
              Sign In
            </Button>
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
            CMR-A v0.3 - Clash Merch Royale Advisor
          </p>
          <p className="text-sm font-game text-foreground/80 mt-2">
            Built with{" "}
            <span className="text-accent animate-bounce-subtle inline-block">♥</span>{" "}
            for the community
          </p>
        </div>
      </footer>
    </div>
  );
}