import type { FreshnessStatus } from "../types/food";
export const localDate = (date = new Date()): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function dateDay(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new Error("Invalid storage date.");
  const [y, m, d] = value.split("-").map(Number);
  const time = Date.UTC(y, m - 1, d);
  if (new Date(time).toISOString().slice(0, 10) !== value)
    throw new Error("Invalid storage date.");
  return time / 86400000;
}
export function validateFood(
  food: {
    name: string;
    storedDate: string;
    recommendedDays: number;
    notes?: string;
  },
  today = localDate(),
): void {
  if (!food.name.trim() || food.name.length > 100)
    throw new Error("Enter a food name of 1–100 characters.");
  if (dateDay(food.storedDate) > dateDay(today))
    throw new Error("The stored date cannot be in the future.");
  if (
    !Number.isInteger(food.recommendedDays) ||
    food.recommendedDays < 1 ||
    food.recommendedDays > 365
  )
    throw new Error("Choose a whole storage period between 1 and 365 days.");
  if ((food.notes?.length ?? 0) > 2000)
    throw new Error("Keep notes under 2,000 characters.");
}
export const getDaysStored = (
  storedDate: string,
  today = localDate(),
): number => Math.max(0, dateDay(today) - dateDay(storedDate));
// Fresh until 70% (rounded up); Use Soon through the final day; Check Before Use after it.
export function getFreshnessStatus(
  storedDate: string,
  recommendedDays: number,
  today = localDate(),
): FreshnessStatus {
  if (
    !Number.isInteger(recommendedDays) ||
    recommendedDays < 1 ||
    recommendedDays > 365
  )
    throw new Error("Invalid recommended period.");
  const days = getDaysStored(storedDate, today);
  return days > recommendedDays
    ? "Check Before Use"
    : days >= Math.max(1, Math.ceil(recommendedDays * 0.7))
      ? "Use Soon"
      : "Fresh";
}
export const getRemainingDays = (
  storedDate: string,
  recommendedDays: number,
  today = localDate(),
): number => recommendedDays - getDaysStored(storedDate, today);

export const formatDays = (days: number): string =>
  `${days} ${days === 1 ? "day" : "days"}`;
export const formatStoredDate = (value: string): string =>
  new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
