import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const ActionButtons = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.is_admin && profile?.email === 'waterflesjan@gmail.com';

  return (
    <div className="flex flex-col gap-6 max-w-sm mx-auto px-4">
      <Button 
        asChild 
        size="lg" 
        className="h-16 text-xl font-game-title bg-gradient-accent hover:scale-105 transition-all duration-200 border-2 border-accent text-accent-foreground shadow-game font-bold"
      >
        <Link to="/upload">
          <Upload className="mr-3 h-6 w-6" strokeWidth={3} />
          Upload Screenshot
        </Link>
      </Button>
      
      {/* Stats button - Only visible to admin */}
      {isAdmin && (
        <Button 
          asChild 
          variant="outline" 
          size="lg" 
          className="h-16 text-xl font-game-title border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground hover:scale-105 transition-all duration-200 shadow-game"
        >
          <Link to="/stats">
            <BarChart3 className="mr-3 h-6 w-6" strokeWidth={3} />
            View Stats
          </Link>
        </Button>
      )}
    </div>
  );
};