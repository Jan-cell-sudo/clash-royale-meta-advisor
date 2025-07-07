import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, Star } from "lucide-react";

interface TroopAdvice {
  id: number;
  name: string;
  usagePercentage: number;
  traitFamily: string;
  rank: number;
}

interface AdviceCardProps {
  league: string;
  troops: TroopAdvice[];
  loading?: boolean;
}

export function AdviceCard({ league, troops, loading = false }: AdviceCardProps) {
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-primary" />
            Loading advice...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-2 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-primary" />
          Meta Counter Advice
        </CardTitle>
        <CardDescription>
          Least used troops in <Badge variant="secondary">{league}</Badge> - Use these to gain advantage!
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {troops.map((troop) => (
            <div key={troop.id} className="flex items-center space-x-4 p-3 rounded-lg bg-card hover:bg-muted/50 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">{troop.name}</h4>
                    <p className="text-xs text-muted-foreground">{troop.traitFamily}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      #{troop.rank}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {troop.usagePercentage.toFixed(1)}% usage
                    </p>
                  </div>
                </div>
                <Progress 
                  value={troop.usagePercentage} 
                  className="h-2"
                  style={{
                    background: `linear-gradient(to right, hsl(var(--destructive)) 0%, hsl(var(--accent)) 50%, hsl(var(--primary)) 100%)`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        
        {troops.length === 0 && (
          <div className="text-center py-8">
            <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No data available for this league yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Upload screenshots to help build the meta database!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}