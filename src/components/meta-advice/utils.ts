import { TroopAdvice } from "./types";

export const formatTrophyRange = (min: number, max: number) => {
  if (max >= 9999) return `${min.toLocaleString()}+`;
  return `${min.toLocaleString()}-${max.toLocaleString()}`;
};

export const getBadgeVariant = (leagueName: string) => {
  if (leagueName === "Bronze") return "secondary";
  if (leagueName === "Silver") return "outline";
  if (leagueName === "Gold") return "default";
  if (leagueName === "Diamond") return "default";
  return "secondary";
};

export const calculateTotalUsage = (troopList: TroopAdvice[]) => {
  return troopList.reduce((total, troop) => total + troop.usageCount, 0);
};