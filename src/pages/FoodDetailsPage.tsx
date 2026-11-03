import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import QRLabel from "../components/QRLabel";
import { useToday } from "../hooks/useToday";

import FreshnessBadge from "../components/FreshnessBadge";
import { getFoodById, foodError } from "../services/foodService";
import type { Food } from "../types/food";

import {
  formatDays,
  formatStoredDate,
  getDaysStored,
  getFreshnessStatus,
  getRemainingDays,
} from "../utils/freshness";

const FoodDetailsPage = () => {
  const { id } = useParams();
  const today = useToday();
  const [error,setError] = useState("");

  const [food, setFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    const loadFood = async () => {
      setLoading(true);setError("");setFood(null);setNotFound(false);
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const data = await getFoodById(id);

        if (!active) return;
        if (!data) {
          setNotFound(true);
        } else {
          setFood(data);
        }
      } catch (error) {
        if (active) setError(foodError(error));
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadFood();
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return (
      <section className="page-section">
        <div className="container small-container">
          <div className="message-card" role="status">Loading food…</div>
        </div>
      </section>
    );
  }

  if (error) return <section className="page-section container"><div className="message-card" role="alert"><h1>Couldn’t load this food</h1><p>{error}</p><button className="button primary-button" onClick={()=>window.location.reload()}>Try again</button></div></section>;

  if (notFound || !food) {
    return (
      <section className="page-section">
        <div className="container small-container">
          <div className="message-card">
            <h2>Food not found</h2>
            <p>This QR code does not contain a valid food record.</p>

            <Link className="button primary-button" to="/">
              Go Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const status = getFreshnessStatus(food.storedDate, food.recommendedDays, today);

  const daysStored = getDaysStored(food.storedDate,today);

  const remainingDays = getRemainingDays(food.storedDate, food.recommendedDays, today);



  const statusMessage =
    status === "Fresh"
      ? "This item is within its recommended storage period."
      : status === "Use Soon"
        ? "Consider using this item soon to help reduce food waste."
        : "The recommended storage period may have passed. Check the food carefully before use.";

  return (
    <section className="page-section details-background">
      <div className="container details-container">
        <div className="details-card">
          <div className="details-header">
            <div>
              <p className="eyebrow">FRESHCHECK RESULT</p>
              <h1>{food.name}</h1>
            </div>

            <FreshnessBadge status={status} />
          </div>

          <div className="result-message">
            <strong>{status}</strong>
            <p>{statusMessage}</p>
          </div>

          <div className="details-grid">
            <div>
              <span>Date Stored</span>
              <strong>
                {formatStoredDate(food.storedDate)}
              </strong>
            </div>

            <div>
              <span>Days Stored</span>
              <strong>{formatDays(daysStored)}</strong>
            </div>

            <div>
              <span>Recommended Period</span>
              <strong>{formatDays(food.recommendedDays)}</strong>
            </div>

            <div>
              <span>
                {remainingDays >= 0
                  ? "Recommended Days Remaining"
                  : "Past Recommended Period"}
              </span>

              <strong>
                {remainingDays >= 0
                  ? formatDays(remainingDays)
                  : formatDays(Math.abs(remainingDays))}
              </strong>
            </div>
          </div>

          {food.notes && (
            <div className="notes-box">
              <span>Storage Notes</span>
              <p>{food.notes}</p>
            </div>
          )}

          <div className="safety-notice">
            <strong>Important</strong>
            <p>
              FreshCheck provides storage guidance only. Always check the
              appearance, smell, storage conditions, and condition of food before consuming it.
            </p>
          </div>
        </div>

        <QRLabel id={food.id} name={food.name} />
      </div>
    </section>
  );
};

export default FoodDetailsPage;
