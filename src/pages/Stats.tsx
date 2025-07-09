import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { OverallStatsCards } from "@/components/stats/OverallStatsCards";
import { LeagueActivityCard } from "@/components/stats/LeagueActivityCard";
import { PopularTroopsCard } from "@/components/stats/PopularTroopsCard";
import { MetaInsightsCard } from "@/components/stats/MetaInsightsCard";
import { useStatsData } from "@/components/stats/hooks/useStatsData";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileArchive, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuditLog } from "@/hooks/useAuditLog";

const Stats = () => {
  const { loading: authLoading } = useAuth();
  const { isAdmin, loading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();
  const { leagueStats, troopStats, overallStats, loading } = useStatsData();
  const { toast } = useToast();
  const { logDownload } = useAuditLog();
  const [leagues, setLeagues] = useState<Array<{id: number, name: string}>>([]);
  const [downloadingLeague, setDownloadingLeague] = useState<string | null>(null);

  // Fetch leagues for download options
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const { data: leaguesData, error } = await supabase
          .from('leagues')
          .select('id, name')
          .order('id');
        
        if (error) throw error;
        setLeagues(leaguesData || []);
      } catch (error) {
        console.error('Error fetching leagues:', error);
      }
    };
    
    fetchLeagues();
  }, []);

  const handleDownloadLeague = async (leagueName: string) => {
    try {
      setDownloadingLeague(leagueName);
      
      toast({
        title: "Preparing Download",
        description: `Collecting screenshots for ${leagueName}...`,
      });

      const response = await fetch(
        `https://moohcttaexbfxrbrpwtn.supabase.co/functions/v1/download-league-screenshots?league=${encodeURIComponent(leagueName)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download screenshots');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${leagueName.replace(/\s+/g, '_').toLowerCase()}_screenshots_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Log the download action
      await logDownload(leagueName);

      toast({
        title: "Download Complete",
        description: `Screenshots for ${leagueName} downloaded successfully!`,
      });

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: `Failed to download screenshots for ${leagueName}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setDownloadingLeague(null);
    }
  };

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && !rolesLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, authLoading, rolesLoading, navigate]);

  if (authLoading || rolesLoading || loading) {
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

  // Don't render anything if user is not admin
  if (!isAdmin) {
    return null;
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
        <OverallStatsCards stats={overallStats} />

        {/* Admin Screenshot Downloads */}
        <Card className="game-card">
          <CardHeader className="bg-gradient-accent border-b-4 border-accent">
            <CardTitle className="font-game-title text-xl text-accent-foreground flex items-center gap-3">
              <FileArchive className="h-6 w-6 animate-bounce-subtle" strokeWidth={3} />
              Download Screenshots by League
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leagues.map((league) => (
                <Button
                  key={league.id}
                  onClick={() => handleDownloadLeague(league.name)}
                  disabled={downloadingLeague === league.name}
                  className="h-12 font-game-title bg-gradient-primary hover:scale-105 transition-transform border-2 border-accent shadow-game"
                >
                  {downloadingLeague === league.name ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" strokeWidth={3} />
                      {league.name}
                    </>
                  )}
                </Button>
              ))}
            </div>
            <p className="text-sm font-game text-foreground/70 mt-4 text-center">
              Each download includes all uploaded screenshots for the selected league with metadata
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-8">
          {/* Most Popular Troops - Mobile first */}
          <PopularTroopsCard troopStats={troopStats} />

          {/* League Statistics */}
          <LeagueActivityCard leagueStats={leagueStats} />
        </div>

        {/* Meta Insights */}
        <MetaInsightsCard troopStats={troopStats} leagueStats={leagueStats} />
      </div>
    </Layout>
  );
};

export default Stats;