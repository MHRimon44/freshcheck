import type { FoodInput } from "../types/food";
// Explicit projection prevents unexpected fields (including ownerId) entering a write.
export function ownedFoodFields(food: FoodInput, uid: string) {
  if (!uid) throw new Error("Please sign in before saving food.");
  return {
    name: food.name.trim(),
    storedDate: food.storedDate,
    recommendedDays: food.recommendedDays,
    notes: food.notes?.trim() ?? "",
    ownerId: uid,
  };
}
