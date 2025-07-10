import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface League {
  id: number;
  name: string;
  min_trophies: number;
  max_trophies: number;
}

interface LeagueSelectorProps {
  leagues: League[];
  selectedLeague: string;
  onLeagueChange: (league: string) => void;
  loading?: boolean;
}

export function LeagueSelector({ leagues, selectedLeague, onLeagueChange, loading = false }: LeagueSelectorProps) {
  const formatTrophyRange = (min: number, max: number) => {
    if (max >= 9999) return `${min.toLocaleString()}+`;
    return `${min.toLocaleString()}-${max.toLocaleString()}`;
  };

  const getBadgeVariant = (leagueName: string) => {
    if (leagueName.includes("Bronze")) return "secondary";
    if (leagueName.includes("Silver")) return "outline";
    if (leagueName.includes("Gold")) return "default";
    if (leagueName.includes("Diamond")) return "default";
    return "secondary";
  };

  if (loading) {
    return (
      <div className="w-full max-w-xs">
        <div className="h-12 bg-muted rounded-xl animate-pulse border-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="text-lg font-game-title text-foreground">Select League</label>
      <Select value={selectedLeague} onValueChange={onLeagueChange}>
        <SelectTrigger className="w-full max-w-xs h-12 bg-gradient-primary border-2 border-accent font-game text-foreground shadow-game hover:scale-105 transition-all duration-200 touch-manipulation">
          <SelectValue placeholder="Choose your league..." />
        </SelectTrigger>
        <SelectContent className="bg-gradient-primary border-2 border-accent shadow-game z-[9999] max-h-[50vh] overflow-y-auto" sideOffset={4} align="center">
          {leagues.map((league) => (
            <SelectItem 
              key={league.id} 
              value={league.name}
              className="font-game text-foreground hover:bg-gradient-winner focus:bg-gradient-winner cursor-pointer py-3 touch-manipulation"
            >
              <div className="flex items-center space-x-4 pointer-events-none">
                <Trophy className="h-5 w-5 text-accent animate-bounce-subtle" strokeWidth={3} />
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant={getBadgeVariant(league.name)} 
                    className="text-sm font-game-title border-2 border-accent bg-gradient-accent text-accent-foreground"
                  >
                    {league.name}
                  </Badge>
                  <span className="text-sm font-game text-foreground/80">
                    {formatTrophyRange(league.min_trophies, league.max_trophies)} trophies
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}