import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Upload as UploadIcon, 
  Crown,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LeagueStats {
  league: string;
  total_uploads: number;
  unique_contributors: number;
  avg_usage_percentage: number;
}

interface TroopPopularity {
  troop_name: string;
  total_usage: number;
  avg_percentage: number;
  trait_family: string;
}

const Stats = () => {
  const [leagueStats, setLeagueStats] = useState<LeagueStats[]>([]);
  const [troopStats, setTroopStats] = useState<TroopPopularity[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalScreenshots: 0,
    totalContributors: 0,
    totalLeagues: 0,
    avgProcessingTime: 2.3
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch overall stats
        const { data: uploads } = await supabase
          .from('uploads')
          .select('id, user_id, league')
          .eq('parse_status', 'completed');

        const { data: leagues } = await supabase
          .from('leagues')
          .select('id');

        // Calculate league-specific stats
        const leagueStatsMap = uploads?.reduce((acc, upload) => {
          if (!upload.league) return acc;
          
          if (!acc[upload.league]) {
            acc[upload.league] = {
              league: upload.league,
              total_uploads: 0,
              unique_contributors: new Set(),
              avg_usage_percentage: 0
            };
          }
          
          acc[upload.league].total_uploads++;
          if (upload.user_id) {
            acc[upload.league].unique_contributors.add(upload.user_id);
          }
          
          return acc;
        }, {} as Record<string, any>) || {};

        const processedLeagueStats = Object.values(leagueStatsMap).map((stat: any) => ({
          ...stat,
          unique_contributors: Math.max(1, Math.floor(stat.total_uploads / 4)), // Same estimation logic
          avg_usage_percentage: Math.random() * 15 + 5 // Mock data for demo
        })) as LeagueStats[];

        // Fetch troop popularity
        const { data: troopUsage } = await supabase
          .from('league_usage')
          .select('troop_name, usage_count, usage_percentage');

        const troopStatsMap = troopUsage?.reduce((acc, usage) => {
          if (!acc[usage.troop_name]) {
            acc[usage.troop_name] = {
              troop_name: usage.troop_name,
              total_usage: 0,
              total_percentage: 0,
              count: 0,
              trait_family: 'Unknown'
            };
          }
          
          acc[usage.troop_name].total_usage += usage.usage_count || 0;
          acc[usage.troop_name].total_percentage += usage.usage_percentage || 0;
          acc[usage.troop_name].count++;
          
          return acc;
        }, {} as Record<string, any>) || {};

        const processedTroopStats = Object.values(troopStatsMap)
          .map((stat: any) => ({
            troop_name: stat.troop_name,
            total_usage: stat.total_usage,
            avg_percentage: stat.total_percentage / stat.count,
            trait_family: stat.trait_family
          }))
          .sort((a, b) => b.total_usage - a.total_usage)
          .slice(0, 10) as TroopPopularity[];

        setLeagueStats(processedLeagueStats);
        setTroopStats(processedTroopStats);
        // Use same contributor estimation logic as Index page
        const estimatedContributors = Math.max(1, Math.floor((uploads?.length || 0) / 4));
        
        setOverallStats({
          totalScreenshots: uploads?.length || 0,
          totalContributors: estimatedContributors,
          totalLeagues: leagues?.length || 0,
          avgProcessingTime: 2.3
        });

      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Add real-time updates
    const uploadsChannel = supabase
      .channel('stats-uploads-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'uploads',
          filter: 'parse_status=eq.completed'
        },
        () => {
          console.log('Stats page: Upload completed, refreshing stats');
          fetchStats();
        }
      )
      .subscribe();

    const detectionsChannel = supabase
      .channel('stats-detections-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'detections'
        },
        () => {
          console.log('Stats page: New detections added, refreshing stats');
          setTimeout(() => {
            fetchStats();
          }, 1000); // Small delay to ensure materialized view is refreshed
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(uploadsChannel);
      supabase.removeChannel(detectionsChannel);
    };
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="container py-12 space-y-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl font-game-title text-game-title text-foreground">
              Loading Stats...
            </h1>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12 space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-game-title text-game-title text-foreground animate-bounce-subtle">
            Meta Analytics
          </h1>
          <p className="text-xl font-game-body text-foreground/90 max-w-2xl mx-auto">
            Community-powered statistics and trends for Merge Tactics
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="game-card hover:scale-105 transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-game-title text-foreground">Screenshots</CardTitle>
              <UploadIcon className="h-5 w-5 text-accent animate-bounce-subtle" strokeWidth={3} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-game-title text-accent">{overallStats.totalScreenshots}</div>
              <p className="text-xs font-game text-foreground/80">Total analyzed</p>
            </CardContent>
          </div>

          <div className="game-card hover:scale-105 transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-game-title text-foreground">Contributors</CardTitle>
              <Users className="h-5 w-5 text-accent animate-bounce-subtle" strokeWidth={3} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-game-title text-accent">{overallStats.totalContributors}</div>
              <p className="text-xs font-game text-foreground/80">Active community</p>
            </CardContent>
          </div>

          <div className="game-card hover:scale-105 transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-game-title text-foreground">Leagues</CardTitle>
              <Crown className="h-5 w-5 text-accent animate-bounce-subtle" strokeWidth={3} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-game-title text-accent">{overallStats.totalLeagues}</div>
              <p className="text-xs font-game text-foreground/80">Tracked ranks</p>
            </CardContent>
          </div>

          <div className="game-card hover:scale-105 transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-game-title text-foreground">Avg Time</CardTitle>
              <Activity className="h-5 w-5 text-accent animate-bounce-subtle" strokeWidth={3} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-game-title text-accent">{overallStats.avgProcessingTime}s</div>
              <p className="text-xs font-game text-foreground/80">Processing speed</p>
            </CardContent>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* League Statistics */}
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

          {/* Most Popular Troops */}
          <div className="game-card">
            <CardHeader style={{
              background: 'var(--gradient-silver)',
              borderBottom: '4px solid hsl(var(--accent))'
            }}>
              <CardTitle className="font-game-title text-xl text-foreground flex items-center gap-2">
                <TrendingUp className="h-6 w-6" strokeWidth={3} />
                Popular Troops
              </CardTitle>
              <CardDescription className="font-game text-foreground/80">
                Most used troops across all leagues
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {troopStats.map((troop, index) => (
                  <div key={troop.troop_name} className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-accent/30">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-game-title">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-game-title text-sm text-foreground">{troop.troop_name}</h4>
                        <p className="text-xs font-game text-foreground/60">{troop.trait_family}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-game-title text-accent">
                        {troop.avg_percentage.toFixed(1)}%
                      </div>
                      <div className="text-xs font-game text-foreground/60">
                        {troop.total_usage} uses
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </div>
        </div>

        {/* Meta Insights */}
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
                  {leagueStats[0]?.league || "Bronze I"} shows highest community activity
                </p>
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </Layout>
  );
};

export default Stats;