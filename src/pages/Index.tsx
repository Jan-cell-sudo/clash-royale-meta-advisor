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
      <div className="container py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Clash Merch Royale Advisor
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get real-time meta advice for Merge Tactics. Upload match screenshots to crowdsource troop usage data 
            and discover the least-contested troops for your league.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button className="bg-gradient-to-r from-primary to-primary/80">
              <Upload className="h-4 w-4 mr-2" />
              Upload Screenshot
            </Button>
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Stats
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Screenshots Analyzed</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">+0 from last hour</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contributors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Community powered</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leagues Tracked</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leagues.length}</div>
              <p className="text-xs text-muted-foreground">Bronze to Diamond</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* League Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Choose Your League</CardTitle>
                <CardDescription>
                  Select your current league to get personalized meta advice
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeagueSelector
                  leagues={leagues}
                  selectedLeague={selectedLeague}
                  onLeagueChange={setSelectedLeague}
                  loading={loading}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    1
                  </div>
                  <p>Upload your post-match victory screenshots</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    2
                  </div>
                  <p>AI analyzes troop compositions and star levels</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    3
                  </div>
                  <p>Get recommendations for under-contested troops</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advice Display */}
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
