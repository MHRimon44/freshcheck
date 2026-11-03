import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { db, auth, configurationError } from '../config/firebase';
import type { Food, FoodInput } from '../types/food';
import { validateFood, dateDay } from '../utils/freshness';
function database() { if (!db) throw new Error(configurationError); return db; }
function decode(id: string, data: DocumentData): Food {
 if (typeof data.name !== 'string' || !data.name.trim() || typeof data.storedDate !== 'string' || !Number.isInteger(data.recommendedDays) || data.recommendedDays < 1 || data.recommendedDays > 365 || (data.notes !== undefined && typeof data.notes !== 'string')) throw new Error('A food record has invalid fields. Please contact the organizer.');
 dateDay(data.storedDate);
 return { id, name: data.name, storedDate: data.storedDate, recommendedDays: data.recommendedDays, notes: data.notes, createdAt: data.createdAt instanceof Timestamp ? data.createdAt : undefined };
}
export async function addFood(food: FoodInput): Promise<string> {
 validateFood(food);
 if (!auth?.currentUser) throw new Error("Please sign in with your organizer account before saving food.");
 const record = await addDoc(collection(database(),'foods'), { ...food, createdAt: serverTimestamp() });
 return record.id;
}
export async function getFoodById(id: string): Promise<Food | null> {
 if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) return null;
 const record = await getDoc(doc(database(),'foods',id));
 return record.exists() ? decode(record.id,record.data()) : null;
}
export async function getFoods(): Promise<Food[]> {
 const records = await getDocs(collection(database(),'foods'));
 // Sort locally so legacy records without createdAt are still visible.
 return records.docs.map(record => decode(record.id,record.data())).sort((a,b)=>(b.createdAt?.toMillis() ?? 0)-(a.createdAt?.toMillis() ?? 0));
}
export function foodError(error: unknown): string {
 const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
 if (code.includes('permission-denied')) return 'Access was denied. An approved organizer must sign in to add food.';
 if (code.includes('unavailable')) return 'Storage is temporarily unavailable. Check your connection and try again.';
 return code ? 'We could not connect to FreshCheck. Please try again.' : error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}
