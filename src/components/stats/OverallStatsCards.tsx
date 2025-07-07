import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload as UploadIcon, Users, Crown, Activity } from "lucide-react";
import { OverallStats } from "./types";

interface OverallStatsCardsProps {
  stats: OverallStats;
}

export const OverallStatsCards = ({ stats }: OverallStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="game-card hover:scale-105 transition-transform duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-game-title text-foreground">Screenshots</CardTitle>
          <UploadIcon className="h-5 w-5 text-accent animate-bounce-subtle" strokeWidth={3} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-game-title text-accent">{stats.totalScreenshots}</div>
          <p className="text-xs font-game text-foreground/80">Total analyzed</p>
        </CardContent>
      </div>

      <div className="game-card hover:scale-105 transition-transform duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-game-title text-foreground">Contributors</CardTitle>
          <Users className="h-5 w-5 text-accent animate-bounce-subtle" strokeWidth={3} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-game-title text-accent">{stats.totalContributors}</div>
          <p className="text-xs font-game text-foreground/80">Active community</p>
        </CardContent>
      </div>

      <div className="game-card hover:scale-105 transition-transform duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-game-title text-foreground">Leagues</CardTitle>
          <Crown className="h-5 w-5 text-accent animate-bounce-subtle" strokeWidth={3} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-game-title text-accent">{stats.totalLeagues}</div>
          <p className="text-xs font-game text-foreground/80">Tracked ranks</p>
        </CardContent>
      </div>

      <div className="game-card hover:scale-105 transition-transform duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-game-title text-foreground">Avg Time</CardTitle>
          <Activity className="h-5 w-5 text-accent animate-bounce-subtle" strokeWidth={3} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-game-title text-accent">{stats.avgProcessingTime}s</div>
          <p className="text-xs font-game text-foreground/80">Processing speed</p>
        </CardContent>
      </div>
    </div>
  );
};