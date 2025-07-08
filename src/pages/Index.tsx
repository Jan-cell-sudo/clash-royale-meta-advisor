import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { MetaAdviceCard } from "@/components/MetaAdviceCard";
import { HeroSection } from "@/components/home/HeroSection";
import { ActionButtons } from "@/components/home/ActionButtons";
import { StatsCards } from "@/components/home/StatsCards";
import { useAppStats } from "@/hooks/useAppStats";
import { useLeagueData } from "@/hooks/useLeagueData";
import { useAdviceData } from "@/hooks/useAdviceData";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedLeague, setSelectedLeague] = useState<string>("Bronze");
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Custom hooks for data management
  const { stats, loading: statsLoading, fetchStats, setStats } = useAppStats();
  const { leagues, loading: leaguesLoading } = useLeagueData();
  const { advice, loading: adviceLoading, fetchAdvice } = useAdviceData(selectedLeague);

  // Set up real-time updates
  useRealtimeUpdates({
    onStatsUpdate: fetchStats,
    onAdviceUpdate: fetchAdvice,
    selectedLeague
  });

  // Initialize leagues count in stats
  useEffect(() => {
    if (leagues.length > 0) {
      setStats(prev => ({
        ...prev,
        leagues: leagues.length
      }));
    }
  }, [leagues, setStats]);

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

  return (
    <Layout>
      <div className="min-h-screen relative">
        <div className="container py-8 px-4 space-y-8 relative z-10">
          {/* Hero Content */}
          <HeroSection />

          {/* Action Buttons */}
          <ActionButtons />

          {/* Stats Cards */}
          <StatsCards 
            stats={stats} 
            onRefresh={handleRefresh} 
            refreshing={refreshing} 
          />

          {/* Combined League Selector and Meta Advice */}
          <div className="max-w-sm mx-auto px-4">
            <MetaAdviceCard
              leagues={leagues}
              selectedLeague={selectedLeague}
              onLeagueChange={setSelectedLeague}
              troops={advice}
              loading={adviceLoading}
              leaguesLoading={leaguesLoading}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;