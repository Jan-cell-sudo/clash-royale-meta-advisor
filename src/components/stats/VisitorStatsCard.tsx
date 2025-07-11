import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Users, TrendingUp, Calendar } from "lucide-react";
import { VisitorStats } from "@/hooks/useVisitorTracking";

interface VisitorStatsCardProps {
  stats: VisitorStats;
  loading: boolean;
}

export function VisitorStatsCard({ stats, loading }: VisitorStatsCardProps) {
  if (loading) {
    return (
      <Card className="game-card">
        <CardHeader className="bg-gradient-accent border-b-4 border-accent">
          <CardTitle className="font-game-title text-xl text-accent-foreground flex items-center gap-3">
            <Eye className="h-6 w-6 animate-bounce-subtle" strokeWidth={3} />
            Visitor Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center space-y-3 p-4 rounded-xl bg-gradient-silver border-2 border-accent/50">
                <div className="h-8 w-24 bg-muted rounded animate-pulse mx-auto" />
                <div className="h-12 w-16 bg-muted rounded animate-pulse mx-auto" />
                <div className="h-4 w-20 bg-muted rounded animate-pulse mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    {
      title: "Today",
      icon: Calendar,
      views: stats.todayViews,
      uniqueVisitors: stats.todayUniqueVisitors,
      gradient: "from-emerald-400 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
      textColor: "text-emerald-700"
    },
    {
      title: "Yesterday", 
      icon: TrendingUp,
      views: stats.yesterdayViews,
      uniqueVisitors: stats.yesterdayUniqueVisitors,
      gradient: "from-blue-400 to-indigo-500",
      bgGradient: "from-blue-50 to-indigo-50",
      textColor: "text-blue-700"
    },
    {
      title: "This Week",
      icon: Users,
      views: stats.weekViews,
      uniqueVisitors: stats.weekUniqueVisitors,
      gradient: "from-purple-400 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      textColor: "text-purple-700"
    }
  ];

  return (
    <Card className="game-card">
      <CardHeader className="bg-gradient-accent border-b-4 border-accent">
        <CardTitle className="font-game-title text-xl text-accent-foreground flex items-center gap-3">
          <Eye className="h-6 w-6 animate-bounce-subtle" strokeWidth={3} />
          Visitor Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((card) => (
            <div
              key={card.title}
              className={`text-center space-y-4 p-6 rounded-2xl border-4 border-accent/30 bg-gradient-to-br ${card.bgGradient} hover:scale-105 transition-all duration-300 shadow-2xl`}
            >
              {/* Icon and Title */}
              <div className="flex items-center justify-center gap-2">
                <div className={`p-2 rounded-xl bg-gradient-to-r ${card.gradient} shadow-lg`}>
                  <card.icon className="h-5 w-5 text-white" strokeWidth={3} />
                </div>
                <h3 className={`font-game-title text-lg ${card.textColor}`}>
                  {card.title}
                </h3>
              </div>

              {/* Views Count */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Eye className={`h-4 w-4 ${card.textColor}`} strokeWidth={2} />
                  <span className="text-sm font-game text-gray-600">Total Views</span>
                </div>
                <div className={`text-4xl font-game-title font-black ${card.textColor} drop-shadow-lg`}>
                  {card.views.toLocaleString()}
                </div>
              </div>

              {/* Unique Visitors */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Users className={`h-4 w-4 ${card.textColor}`} strokeWidth={2} />
                  <span className="text-sm font-game text-gray-600">Unique Visitors</span>
                </div>
                <Badge 
                  variant="secondary" 
                  className={`text-lg font-game-title px-4 py-2 bg-white/80 ${card.textColor} border-2 border-accent/30`}
                >
                  {card.uniqueVisitors.toLocaleString()}
                </Badge>
              </div>

              {/* Views per visitor ratio */}
              <div className="pt-2 border-t border-gray-300">
                <span className="text-xs font-game text-gray-500">
                  Avg: {card.uniqueVisitors > 0 ? (card.views / card.uniqueVisitors).toFixed(1) : '0'} views/visitor
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm font-game text-foreground/70">
            Visitor tracking counts unique daily visitors. Multiple views from the same visitor are counted separately for total views.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}