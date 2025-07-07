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
        <div className="h-10 bg-muted rounded-md animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Select League</label>
      <Select value={selectedLeague} onValueChange={onLeagueChange}>
        <SelectTrigger className="w-full max-w-xs">
          <SelectValue placeholder="Choose your league..." />
        </SelectTrigger>
        <SelectContent>
          {leagues.map((league) => (
            <SelectItem key={league.id} value={league.name}>
              <div className="flex items-center space-x-3">
                <Trophy className="h-4 w-4 text-primary" />
                <div className="flex items-center space-x-2">
                  <Badge variant={getBadgeVariant(league.name)} className="text-xs">
                    {league.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
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