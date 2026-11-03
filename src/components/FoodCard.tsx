import { Link } from "react-router-dom";

import type { Food } from "../types/food";
import { formatStoredDate, formatDays, getDaysStored, getFreshnessStatus } from "../utils/freshness";

import FreshnessBadge from "./FreshnessBadge";

import { useToday } from "../hooks/useToday";

interface Props {
  food: Food;
}

const FoodCard = ({ food }: Props) => {
  const today = useToday();
  const status = getFreshnessStatus(food.storedDate, food.recommendedDays, today);

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
          <strong>Date stored:</strong>{" "}
          {formatStoredDate(food.storedDate)}
        </p>

        <p>
          <strong>Days stored:</strong> {getDaysStored(food.storedDate,today)}
        </p>

        <p>
          <strong>Recommended period:</strong> {formatDays(food.recommendedDays)}
        </p>
      </div>

      <Link className="button secondary-button" to={`/food/${food.id}`}>
        View details & QR
      </Link>
    </article>
  );
};

export default FoodCard;
