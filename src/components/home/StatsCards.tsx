import { Upload, Users, Target, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppStats } from "@/types";

interface StatsCardsProps {
  stats: AppStats;
  onRefresh: () => void;
  refreshing: boolean;
}

export const StatsCards = ({ stats, onRefresh, refreshing }: StatsCardsProps) => {
  return (
    <>
      {/* Mobile Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-sm mx-auto px-4">
        <div className="game-card p-6 text-center hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-game-title text-sm text-foreground">Screenshots Analyzed</h3>
            <Upload className="h-5 w-5 text-accent animate-bounce-subtle" strokeWidth={3} />
          </div>
          <div className="text-4xl font-game-title text-accent drop-shadow-lg mb-2">
            {stats.screenshots}
          </div>
          <div className="text-xs font-game text-foreground/70">
            +{Math.floor(stats.screenshots / 3)} from last hour
          </div>
        </div>

        <div className="game-card p-6 text-center hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-game-title text-sm text-foreground">Active Contributors</h3>
            <Users className="h-5 w-5 text-accent animate-bounce-subtle" strokeWidth={3} />
          </div>
          <div className="text-4xl font-game-title text-accent drop-shadow-lg mb-2">
            {stats.contributors}
          </div>
          <div className="text-xs font-game text-foreground/70">
            Community powered
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <Button
          onClick={onRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="font-game-title border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={3} />
          {refreshing ? 'Updating...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Desktop: Show additional info */}
      <div className="hidden lg:block max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="game-card hover:scale-105 transition-transform duration-200 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg font-game-title text-foreground">Screenshots Analyzed</CardTitle>
              <Upload className="h-6 w-6 text-accent animate-bounce-subtle group-hover:scale-110 transition-transform" strokeWidth={3} />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-game-title text-accent drop-shadow-lg">{stats.screenshots}</div>
              <p className="text-sm font-game text-foreground/80">+{Math.floor(stats.screenshots / 3)} from last hour</p>
            </CardContent>
          </div>
          <div className="game-card hover:scale-105 transition-transform duration-200 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg font-game-title text-foreground">Active Contributors</CardTitle>
              <Users className="h-6 w-6 text-accent animate-bounce-subtle group-hover:scale-110 transition-transform" strokeWidth={3} />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-game-title text-accent drop-shadow-lg">{stats.contributors}</div>
              <p className="text-sm font-game text-foreground/80">Community powered</p>
            </CardContent>
          </div>
          <div className="game-card hover:scale-105 transition-transform duration-200 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg font-game-title text-foreground">Leagues Tracked</CardTitle>
              <Target className="h-6 w-6 text-accent animate-bounce-subtle group-hover:scale-110 transition-transform" strokeWidth={3} />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-game-title text-accent drop-shadow-lg">{stats.leagues}</div>
              <p className="text-sm font-game text-foreground/80">Bronze to Diamond</p>
            </CardContent>
          </div>
        </div>
      </div>
    </>
  );
};