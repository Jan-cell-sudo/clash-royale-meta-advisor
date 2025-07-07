import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { AdviceCard } from "@/components/AdviceCard";
import { LeagueSelector } from "@/components/LeagueSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Target, Users, BarChart3 } from "lucide-react";
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
  const { toast } = useToast();

  // Fetch leagues on component mount
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const { data, error } = await supabase
          .from('leagues')
          .select('*')
          .order('id');

        if (error) throw error;
        setLeagues(data || []);
      } catch (error) {
        console.error('Error fetching leagues:', error);
        toast({
          title: "Error",
          description: "Failed to load leagues",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, [toast]);

  // Fetch advice when league changes
  useEffect(() => {
    const fetchAdvice = async () => {
      if (!selectedLeague) return;
      
      setAdviceLoading(true);
      try {
        // Get troop usage data for the selected league
        const { data, error } = await supabase
          .from('league_usage')
          .select('*')
          .eq('league', selectedLeague)
          .order('usage_percentage', { ascending: true })
          .limit(6);

        if (error) throw error;

        // Transform data for the advice card
        const adviceData: TroopAdvice[] = (data || []).map((item, index) => ({
          id: item.troop_id,
          name: item.troop_name,
          usagePercentage: item.usage_percentage || 0,
          traitFamily: "Unknown", // Will be enhanced later
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

    fetchAdvice();
  }, [selectedLeague, toast]);

  return (
    <Layout>
      <div className="container py-12 space-y-12 relative z-10">
        {/* Hero Section with enhanced styling */}
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-game-title text-game-title text-foreground animate-bounce-subtle">
            Merge Tactics
          </h1>
          <h2 className="text-4xl font-game-title text-game-title text-accent">
            VICTORY
          </h2>
          <p className="text-xl font-game-body text-foreground/90 max-w-3xl mx-auto leading-relaxed">
            Get real-time meta advice for Merge Tactics. Upload match screenshots to crowdsource troop usage data 
            and discover the least-contested troops for your league.
          </p>
          <div className="flex items-center justify-center gap-6 pt-6">
            <Button 
              size="lg" 
              className="font-game-title text-xl bg-gradient-winner hover:scale-105 transform transition-all duration-200 shadow-game border-4 border-accent/50 text-accent-foreground px-8 py-4"
              onClick={() => {
                toast({
                  title: "Upload Feature",
                  description: "Screenshot upload feature coming soon! This will analyze your match results.",
                });
              }}
            >
              <Upload className="h-6 w-6 mr-3" strokeWidth={3} />
              Upload Screenshot
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="font-game-title text-xl border-4 border-foreground text-foreground hover:bg-foreground hover:text-background hover:scale-105 transform transition-all duration-200 shadow-game px-8 py-4"
              onClick={() => {
                toast({
                  title: "Stats Dashboard",
                  description: "Detailed statistics and analytics coming soon!",
                });
              }}
            >
              <BarChart3 className="h-6 w-6 mr-3" strokeWidth={3} />
              View Stats
            </Button>
          </div>
        </div>

        {/* Stats Cards with perfect game styling */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="game-card hover:scale-105 transition-transform duration-200 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg font-game-title text-foreground">Screenshots Analyzed</CardTitle>
              <Upload className="h-6 w-6 text-accent animate-bounce-subtle group-hover:scale-110 transition-transform" strokeWidth={3} />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-game-title text-accent drop-shadow-lg">0</div>
              <p className="text-sm font-game text-foreground/80">+0 from last hour</p>
            </CardContent>
          </div>
          <div className="game-card hover:scale-105 transition-transform duration-200 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg font-game-title text-foreground">Active Contributors</CardTitle>
              <Users className="h-6 w-6 text-accent animate-bounce-subtle group-hover:scale-110 transition-transform" strokeWidth={3} />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-game-title text-accent drop-shadow-lg">0</div>
              <p className="text-sm font-game text-foreground/80">Community powered</p>
            </CardContent>
          </div>
          <div className="game-card hover:scale-105 transition-transform duration-200 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg font-game-title text-foreground">Leagues Tracked</CardTitle>
              <Target className="h-6 w-6 text-accent animate-bounce-subtle group-hover:scale-110 transition-transform" strokeWidth={3} />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-game-title text-accent drop-shadow-lg">{leagues.length}</div>
              <p className="text-sm font-game text-foreground/80">Bronze to Diamond</p>
            </CardContent>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* League Selection with enhanced game styling */}
          <div className="space-y-8">
            <div className="game-card">
              <CardHeader style={{
                background: 'var(--gradient-winner)',
                borderBottom: '4px solid hsl(var(--accent))'
              }}>
                <CardTitle className="font-game-title text-xl text-accent-foreground">Choose Your League</CardTitle>
                <CardDescription className="font-game text-accent-foreground/80">
                  Select your current league to get personalized meta advice
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <LeagueSelector
                  leagues={leagues}
                  selectedLeague={selectedLeague}
                  onLeagueChange={setSelectedLeague}
                  loading={loading}
                />
              </CardContent>
            </div>

            <div className="game-card">
              <CardHeader style={{
                background: 'var(--gradient-silver)',
                borderBottom: '4px solid hsl(var(--accent))'
              }}>
                <CardTitle className="font-game-title text-xl text-foreground">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-base font-game p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-winner text-accent-foreground text-xl font-game-title shadow-game border-2 border-accent">
                    1
                  </div>
                  <p className="text-foreground">Upload your post-match victory screenshots</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-winner text-accent-foreground text-xl font-game-title shadow-game border-2 border-accent">
                    2
                  </div>
                  <p className="text-foreground">AI analyzes troop compositions and star levels</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-winner text-accent-foreground text-xl font-game-title shadow-game border-2 border-accent">
                    3
                  </div>
                  <p className="text-foreground">Get recommendations for under-contested troops</p>
                </div>
              </CardContent>
            </div>
          </div>

          {/* Advice Display with game styling */}
          <div className="lg:col-span-2">
            <AdviceCard
              league={selectedLeague}
              troops={advice}
              loading={adviceLoading}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
