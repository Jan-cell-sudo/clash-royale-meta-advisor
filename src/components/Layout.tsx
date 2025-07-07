import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Crown, Target, Upload, BarChart3 } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
                <Crown className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                CMR-A
              </h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <a href="/" className="flex items-center space-x-2 text-foreground/60 hover:text-foreground transition-colors">
                <Target className="h-4 w-4" />
                <span>Advice</span>
              </a>
              <a href="/upload" className="flex items-center space-x-2 text-foreground/60 hover:text-foreground transition-colors">
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </a>
              <a href="/stats" className="flex items-center space-x-2 text-foreground/60 hover:text-foreground transition-colors">
                <BarChart3 className="h-4 w-4" />
                <span>Stats</span>
              </a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <div className="container">
          <p>
            CMR-A v0.3 - Clash Merch Royale Advisor | Built with{" "}
            <span className="text-primary">♥</span> for the community
          </p>
        </div>
      </footer>
    </div>
  );
}