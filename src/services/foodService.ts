import {
  addDoc,
  runTransaction,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { db, auth, configurationError } from "../config/firebase";
import type { Food, FoodInput } from "../types/food";
import { ownedFoodFields } from "../utils/ownership";
import { validateFood, dateDay } from "../utils/freshness";
function database() {
  if (!db) throw new Error(configurationError);
  return db;
}
function decode(id: string, data: DocumentData): Food {
  if (
    typeof data.name !== "string" ||
    !data.name.trim() ||
    typeof data.storedDate !== "string" ||
    !Number.isInteger(data.recommendedDays) ||
    data.recommendedDays < 1 ||
    data.recommendedDays > 365 ||
    (data.notes !== undefined && typeof data.notes !== "string") ||
    (data.ownerId !== undefined &&
      (typeof data.ownerId !== "string" || !data.ownerId))
  )
    throw new Error(
      "A food record has invalid fields. Please contact the organizer.",
    );
  dateDay(data.storedDate);
  return {
    id,
    ownerId: data.ownerId,
    name: data.name,
    storedDate: data.storedDate,
    recommendedDays: data.recommendedDays,
    notes: data.notes,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt : undefined,
  };
}
export async function addFood(food: FoodInput): Promise<string> {
  validateFood(food);
  if (!auth?.currentUser) throw new Error("Please sign in before saving food.");
  const record = await addDoc(collection(database(), "foods"), {
    ...ownedFoodFields(food, auth.currentUser.uid),
    createdAt: serverTimestamp(),
  });
  return record.id;
}
export async function getFoodById(id: string): Promise<Food | null> {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) return null;
  const record = await getDoc(doc(database(), "foods", id));
  return record.exists() ? decode(record.id, record.data()) : null;
}
export async function getFoodsByOwner(userId: string): Promise<Food[]> {
  if (!userId || auth?.currentUser?.uid !== userId)
    throw new Error("Please sign in to view your foods.");
  const records = await getDocs(
    query(collection(database(), "foods"), where("ownerId", "==", userId)),
  );
  // Sort locally so legacy records without createdAt are still visible.
  return records.docs
    .map((record) => decode(record.id, record.data()))
    .sort(
      (a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0),
    );
}
export async function deleteFood(id: string): Promise<void> {
  const uid = auth?.currentUser?.uid;
  if (!uid) throw new Error("Please sign in before deleting food.");
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) throw new Error("This food link is invalid.");
  const reference = doc(database(), "foods", id);
  await runTransaction(database(), async transaction => {
    const record = await transaction.get(reference);
    if (!record.exists()) return; // Already deleted is a successful removal from this list.
    if (record.data().ownerId !== uid) throw new Error("You can only delete your own food.");
    transaction.delete(reference);
  });
}
export function foodError(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "";
  if (code.includes("permission-denied"))
    return "Access was denied. Please sign in with the account that owns this food.";
  if (code.includes("unavailable"))
    return "Storage is temporarily unavailable. Check your connection and try again.";
  return code
    ? "We could not connect to FreshCheck. Please try again."
    : error instanceof Error
      ? error.message
      : "Something went wrong. Please try again.";
}
