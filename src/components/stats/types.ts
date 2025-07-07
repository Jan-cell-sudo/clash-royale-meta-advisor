export interface LeagueStats {
  league: string;
  total_uploads: number;
  unique_contributors: number;
  avg_usage_percentage: number;
}

export interface TroopPopularity {
  troop_name: string;
  total_usage: number;
  avg_percentage: number;
  trait_family: string;
}

export interface OverallStats {
  totalScreenshots: number;
  totalContributors: number;
  totalLeagues: number;
  avgProcessingTime: number;
}