import type { Timestamp } from 'firebase/firestore';
export type FreshnessStatus = 'Fresh' | 'Use Soon' | 'Check Before Use';
export interface Food { id: string; name: string; storedDate: string; recommendedDays: number; notes?: string; createdAt?: Timestamp; }
export type FoodInput = Omit<Food, 'id' | 'createdAt'>;
