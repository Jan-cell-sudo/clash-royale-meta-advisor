export interface League {
  id: number;
  name: string;
  min_trophies: number;
  max_trophies: number;
}

export interface TroopAdvice {
  id: number;
  name: string;
  usagePercentage: number;
  usageCount: number;
  traitFamily: string;
  rank: number;
}

export interface AppStats {
  screenshots: number;
  contributors: number;
  leagues: number;
}