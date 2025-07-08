import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload, BarChart3 } from "lucide-react";

export const ActionButtons = () => {
  return (
    <div className="flex flex-col gap-4 max-w-sm mx-auto px-4">
      <Button 
        asChild 
        size="lg" 
        className="h-16 text-xl font-game-title bg-gradient-accent hover:scale-105 transition-transform border-3 border-accent text-accent-foreground shadow-game"
      >
        <Link to="/upload">
          <Upload className="mr-3 h-6 w-6" strokeWidth={3} />
          Upload Screenshot
        </Link>
      </Button>
      
      <Button 
        asChild 
        variant="outline" 
        size="lg" 
        className="h-16 text-xl font-game-title border-3 border-foreground hover:scale-105 transition-transform shadow-game hover:bg-foreground hover:text-background"
      >
        <Link to="/stats">
          <BarChart3 className="mr-3 h-6 w-6" strokeWidth={3} />
          View Stats
        </Link>
      </Button>
    </div>
  );
};