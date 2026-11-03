import type { Timestamp } from "firebase/firestore";
export type FreshnessStatus = "Fresh" | "Use Soon" | "Check Before Use";
export interface Food {
  id: string;
  ownerId?: string; // Legacy exhibition records may have no owner.
  name: string;
  storedDate: string;
  recommendedDays: number;
  notes?: string;
  createdAt?: Timestamp;
}
export type FoodInput = Pick<
  Food,
  "name" | "storedDate" | "recommendedDays" | "notes"
>;
