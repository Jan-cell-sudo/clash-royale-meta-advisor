import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TroopPopularity, LeagueStats } from "./types";

interface MetaInsightsCardProps {
  troopStats: TroopPopularity[];
  leagueStats: LeagueStats[];
}

export const MetaInsightsCard = ({ troopStats, leagueStats }: MetaInsightsCardProps) => {
  return (
    <div className="game-card">
      <CardHeader style={{
        background: 'var(--gradient-primary)',
        borderBottom: '4px solid hsl(var(--accent))'
      }}>
        <CardTitle className="font-game-title text-xl text-foreground">
          Meta Insights
        </CardTitle>
        <CardDescription className="font-game text-foreground/80">
          Key trends and recommendations from the community data
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center space-y-2">
            <h3 className="font-game-title text-lg text-accent">Most Contested</h3>
            <p className="font-game text-sm text-foreground/80">
              {troopStats[0]?.troop_name || "Knight"} dominates the meta with highest usage
            </p>
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-game-title text-lg text-accent">Hidden Gems</h3>
            <p className="font-game text-sm text-foreground/80">
              Underused troops offer strategic advantages in current meta
            </p>
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-game-title text-lg text-accent">League Trends</h3>
            <p className="font-game text-sm text-foreground/80">
              {leagueStats[0]?.league || "Bronze"} shows highest community activity
            </p>
          </div>
        </div>
      </CardContent>
    </div>
  );
};