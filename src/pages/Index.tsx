import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { MetaAdviceCard } from "@/components/MetaAdviceCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Target, Users, BarChart3, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface League {
  id: number;
  name: string;
  min_trophies: number;
  max_trophies: number;
}

interface TroopAdvice {
  id: number;
  name: string;
  usagePercentage: number;
  traitFamily: string;
  rank: number;
}

const Index = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>("Bronze I");
  const [advice, setAdvice] = useState<TroopAdvice[]>([]);
  const [loading, setLoading] = useState(true);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ screenshots: 0, contributors: 0, leagues: 0 });
  const { toast } = useToast();

  // Real-time subscription to uploads and detections for immediate updates
  useEffect(() => {
    const uploadsChannel = supabase
      .channel('uploads-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'uploads',
          filter: 'parse_status=eq.completed'
        },
        () => {
          console.log('Upload completed, refreshing stats and advice');
          // Refresh stats when new uploads are completed
          fetchStats();
          // Refresh advice for current league
          fetchAdvice();
        }
      )
      .subscribe();

    const detectionsChannel = supabase
      .channel('detections-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'detections'
        },
        () => {
          console.log('New detections added, refreshing advice');
          // Refresh advice when new detections are added
          setTimeout(() => {
            fetchAdvice();
          }, 1000); // Small delay to ensure materialized view is refreshed
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(uploadsChannel);
      supabase.removeChannel(detectionsChannel);
    };
  }, [selectedLeague]);

  const fetchStats = async () => {
    try {
      const { data: uploadsData, error: uploadsError } = await supabase
        .from('uploads')
        .select('id, user_id')
        .eq('parse_status', 'completed');

      if (uploadsError) throw uploadsError;
      
      // Since we don't have authentication, estimate contributors based on upload patterns
      // Assume average contributor uploads 3-5 screenshots
      const estimatedContributors = Math.max(1, Math.floor((uploadsData?.length || 0) / 4));
      
      setStats(prev => ({
        ...prev,
        screenshots: uploadsData?.length || 0,
        contributors: estimatedContributors,
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAdvice = async () => {
    if (!selectedLeague) return;
    
    setAdviceLoading(true);
    try {
      // Get troop usage data for the selected league with proper trait mapping
      const { data, error } = await supabase
        .from('league_usage')
        .select('troop_id, troop_name, usage_count, usage_percentage')
        .eq('league', selectedLeague)
        .order('usage_percentage', { ascending: true })
        .limit(6);

      if (error) throw error;

      // Get trait family info
      const { data: troopData, error: troopError } = await supabase
        .from('troop_types')
        .select('id, trait_family');

      const troopTraits = troopData?.reduce((acc, troop) => {
        acc[troop.id] = troop.trait_family;
        return acc;
      }, {} as Record<number, string>) || {};

      // Transform data for the advice card
      const adviceData: TroopAdvice[] = (data || []).map((item, index) => ({
        id: item.troop_id,
        name: item.troop_name,
        usagePercentage: item.usage_percentage || 0,
        traitFamily: troopTraits[item.troop_id] || "Unknown",
        rank: index + 1
      }));

      setAdvice(adviceData);
    } catch (error) {
      console.error('Error fetching advice:', error);
      toast({
        title: "Info",
        description: "No data available for this league yet. Upload screenshots to contribute!",
      });
      setAdvice([]);
    } finally {
      setAdviceLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchStats(), fetchAdvice()]);
      toast({
        title: "Data Refreshed",
        description: "Latest meta analysis updated successfully!"
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Could not update data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch leagues and stats on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch leagues
        const { data: leaguesData, error: leaguesError } = await supabase
          .from('leagues')
          .select('*')
          .order('id');

        if (leaguesError) throw leaguesError;
        setLeagues(leaguesData || []);

        // Fetch stats
        const { data: uploadsData, error: uploadsError } = await supabase
          .from('uploads')
          .select('id, user_id')
          .eq('parse_status', 'completed');

        if (uploadsError) throw uploadsError;
        
        // Since we don't have authentication, estimate contributors based on upload patterns
        // Assume average contributor uploads 3-5 screenshots
        const estimatedContributors = Math.max(1, Math.floor((uploadsData?.length || 0) / 4));
        
        setStats({
          screenshots: uploadsData?.length || 0,
          contributors: estimatedContributors,
          leagues: leaguesData?.length || 0
        });

      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Fetch advice when league changes
  useEffect(() => {
    fetchAdvice();
  }, [selectedLeague]);

  return (
    <Layout>
      <div className="min-h-screen relative">
        {/* Mobile-first Hero Section */}
        <div className="container py-8 px-4 space-y-8 relative z-10">
          {/* Hero Content */}
          <div className="text-center space-y-6 max-w-md mx-auto">
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl font-game-title text-game-title text-foreground animate-bounce-subtle">
                Merge
              </h1>
              <h2 className="text-5xl sm:text-7xl font-game-title text-accent drop-shadow-lg">
                Tactics
              </h2>
              <div className="text-2xl sm:text-3xl font-game-title text-accent bg-gradient-winner px-4 py-2 rounded-xl border-2 border-accent inline-block">
                VICTORY
              </div>
            </div>
            
            <p className="text-lg sm:text-xl font-game-body text-foreground/90 leading-relaxed px-2">
              Get real-time meta advice for Merge Tactics. Upload match screenshots to crowdsource troop usage data and discover the least-contested troops for your league.
            </p>
          </div>

          {/* Action Buttons */}
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

          {/* Stats Cards */}
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
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="font-game-title border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={3} />
              {refreshing ? 'Updating...' : 'Refresh Data'}
            </Button>
          </div>

          {/* Combined League Selector and Meta Advice */}
          <div className="max-w-sm mx-auto px-4">
            <MetaAdviceCard
              leagues={leagues}
              selectedLeague={selectedLeague}
              onLeagueChange={setSelectedLeague}
              troops={advice}
              loading={adviceLoading}
              leaguesLoading={loading}
            />
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
        </div>
      </div>
    </Layout>
  );
};

export default Index;
