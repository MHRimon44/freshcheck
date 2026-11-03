import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteFood, foodError } from "../services/foodService";
import { Link } from "react-router-dom";

import type { Food } from "../types/food";
import {
  formatStoredDate,
  formatDays,
  getDaysStored,
  getFreshnessStatus,
} from "../utils/freshness";

import FreshnessBadge from "./FreshnessBadge";

import { useToday } from "../hooks/useToday";

interface Props {
  food: Food;
  onDeleted?: (id: string) => void;
}

const FoodCard = ({ food, onDeleted }: Props) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  async function remove() {
    if (!window.confirm(`Delete “${food.name}”? This cannot be undone. Its QR link will no longer show this food.`)) return;
    setDeleting(true); setError("");
    try { await deleteFood(food.id); onDeleted?.(food.id); }
    catch (cause) { setError(foodError(cause)); }
    finally { setDeleting(false); }
  }
  const today = useToday();
  const status = getFreshnessStatus(
    food.storedDate,
    food.recommendedDays,
    today,
  );

  return (
    <article className="food-card">
      <div className="food-card-top">
        <div>
          <p className="eyebrow">FOOD ITEM</p>
          <h3>{food.name}</h3>
        </div>

        <FreshnessBadge status={status} />
      </div>

      <div className="food-info">
        <p>
          <strong>Date stored:</strong> {formatStoredDate(food.storedDate)}
        </p>

        <p>
          <strong>Days stored:</strong> {getDaysStored(food.storedDate, today)}
        </p>

        <p>
          <strong>Recommended period:</strong>{" "}
          {formatDays(food.recommendedDays)}
        </p>
      </div>

      <div className="food-card-actions"><Link className="button secondary-button" to={`/food/${food.id}`}>
        View details & QR
      </Link>
      {onDeleted && <button type="button" className="button danger-button delete-food" disabled={deleting} onClick={remove}><Trash2 size={16} aria-hidden="true"/>{deleting ? "Deleting…" : "Delete Food"}</button>}</div>
      {error && <p role="alert" className="error-message">{error}</p>}
    </article>
  );
};

export default FoodCard;
