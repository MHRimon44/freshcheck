import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { localDate, validateFood } from "../utils/freshness";
import { addFood, foodError } from "../services/foodService";

const AddFoodPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [storedDate, setStoredDate] = useState(localDate);
  const [recommendedDays, setRecommendedDays] = useState<number>(7);
  const [notes, setNotes] = useState("");

  const [today] = useState(localDate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!name.trim() || !storedDate || recommendedDays < 1) {
      setError("Please complete all required fields.");
      return;
    }

    try {
      setLoading(true);

      validateFood({ name, storedDate, recommendedDays, notes });
      const id = await addFood({
        name: name.trim(),
        storedDate,
        recommendedDays,
        notes: notes.trim(),
      });

      navigate(`/food/${id}`);
    } catch (err) {
      setError(foodError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-section">
      <div className="container small-container">
        <div className="section-heading left">
          <p className="eyebrow">FRESHCHECK</p>
          <h1>Add Food</h1>

          <p>
            Enter the food information. FreshCheck will create a unique QR code
            after saving.
          </p>
        </div>

        <form className="food-form" onSubmit={handleSubmit} aria-busy={loading}>
          <fieldset disabled={loading}>
            <div className="form-group">
              <label htmlFor="name">Food Item *</label>

              <input
                id="name"
                required
                maxLength={100}
                type="text"
                placeholder="e.g. Grapes"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">Date Stored *</label>

              <input
                id="date"
                required
                type="date"
                value={storedDate}
                max={today}
                onChange={(e) => setStoredDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="days">Recommended Storage Period (Days) *</label>

              <input
                id="days"
                required
                step="1"
                type="number"
                min="1"
                max="365"
                value={recommendedDays}
                onChange={(e) => setRecommendedDays(Number(e.target.value))}
              />

              <small>
                For the exhibition, set the appropriate period for Grapes, Cut
                Carrots or Boiled Eggs.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>

              <textarea
                id="notes"
                maxLength={2000}
                rows={4}
                placeholder="Optional public storage information..."
                aria-describedby="notes-privacy"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <small id="notes-privacy">
                Notes may be visible to anyone with this QR link. Do not include
                sensitive or private information.
              </small>
            </div>

            {error && (
              <div role="alert" className="error-message">
                {error}
              </div>
            )}

            <button
              className="button primary-button full-button"
              disabled={loading}
              type="submit"
            >
              {loading ? "Saving..." : "Save & Generate QR"}
            </button>
          </fieldset>
        </form>
      </div>
    </section>
  );
};

export default AddFoodPage;
