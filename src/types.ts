export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  level: number;
  totalXp: number;
  currentStreak: number;
  totalCo2Saved: number;
  createdAt: string;
  updatedAt: string;
}

export type CarbonCategory =
  | 'transportation'
  | 'food'
  | 'electricity'
  | 'waste'
  | 'shopping'
  | 'water';

export interface CarbonLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  category: CarbonCategory;
  amount: number;
  calculatedCo2: number;
  createdAt: string;
}

export interface EcoAction {
  id: string;
  userId: string;
  title: string;
  category: string;
  co2Reduction: number;
  status: 'active' | 'completed';
  completedDates: string[]; // dates on which it was done
  createdAt: string;
}

export interface OffsetLog {
  id: string;
  userId: string;
  projectName: string;
  amountPaid: number;
  co2Offset: number;
  date: string;
}

export interface SustainabilityStats {
  sustainabilityScore: number;
  rating: string; // A, B, C, D, E, F
  monthlyEmissions: number;
  co2Prevented: number;
  co2Offset: number;
  distribution: Record<CarbonCategory, number>;
  trend: { month: string; emissions: number }[];
}

export interface LeaderboardUser {
  displayName: string;
  level: number;
  totalCo2Saved: number;
  totalXp: number;
}
