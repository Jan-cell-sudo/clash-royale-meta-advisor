import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { OverallStatsCards } from "@/components/stats/OverallStatsCards";
import { LeagueActivityCard } from "@/components/stats/LeagueActivityCard";
import { PopularTroopsCard } from "@/components/stats/PopularTroopsCard";
import { MetaInsightsCard } from "@/components/stats/MetaInsightsCard";
import { useStatsData } from "@/components/stats/hooks/useStatsData";
import { useAuth } from "@/contexts/AuthContext";

const Stats = () => {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { leagueStats, troopStats, overallStats, loading } = useStatsData();

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && (!profile?.is_admin || profile?.email !== 'waterflesjan@gmail.com')) {
      navigate('/');
    }
  }, [profile, authLoading, navigate]);

  if (authLoading || loading) {
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
  if (!profile?.is_admin || profile?.email !== 'waterflesjan@gmail.com') {
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