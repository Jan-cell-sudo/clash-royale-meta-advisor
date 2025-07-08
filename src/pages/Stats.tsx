import { Layout } from "@/components/Layout";
import { OverallStatsCards } from "@/components/stats/OverallStatsCards";
import { LeagueActivityCard } from "@/components/stats/LeagueActivityCard";
import { PopularTroopsCard } from "@/components/stats/PopularTroopsCard";
import { MetaInsightsCard } from "@/components/stats/MetaInsightsCard";
import { useStatsData } from "@/components/stats/hooks/useStatsData";

const Stats = () => {
  const { leagueStats, troopStats, overallStats, loading } = useStatsData();

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