import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3 } from "lucide-react";
import { LeagueStats } from "./types";

interface LeagueActivityCardProps {
  leagueStats: LeagueStats[];
}

export const LeagueActivityCard = ({ leagueStats }: LeagueActivityCardProps) => {
  return (
    <div className="game-card">
      <CardHeader style={{
        background: 'var(--gradient-winner)',
        borderBottom: '4px solid hsl(var(--accent))'
      }}>
        <CardTitle className="font-game-title text-xl text-accent-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6" strokeWidth={3} />
          League Activity
        </CardTitle>
        <CardDescription className="font-game text-accent-foreground/80">
          Upload activity across all leagues
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {leagueStats.map((league) => (
            <div key={league.league} className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge 
                  variant="outline" 
                  className="font-game-title border-2 border-accent bg-accent/20 text-foreground"
                >
                  {league.league}
                </Badge>
                <div className="text-right">
                  <div className="text-sm font-game-title text-foreground">
                    {league.total_uploads} uploads
                  </div>
                  <div className="text-xs font-game text-foreground/60">
                    {league.unique_contributors} contributors
                  </div>
                </div>
              </div>
              <Progress 
                value={(league.total_uploads / Math.max(...leagueStats.map(l => l.total_uploads))) * 100} 
                className="h-3 border border-accent"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </div>
  );
};