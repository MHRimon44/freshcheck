import { useEffect, useState } from "react";

import FoodCard from "../components/FoodCard";
import { Link } from "react-router-dom";
import { getFreshnessStatus } from "../utils/freshness";
import { useToday } from "../hooks/useToday";
import { getFoods, foodError } from "../services/foodService";
import type { Food } from "../types/food";

const FoodListPage = () => {
  const today = useToday();
  const [search,setSearch] = useState("");
  const [filter,setFilter] = useState("All");
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadFoods = async () => {
      try {
        const data = await getFoods();
        if (active) setFoods(data);
      } catch (err) {
        if (active) setError(foodError(err));
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadFoods();


  return () => { active=false; };
  }, []);
    const visible = foods.filter(food => food.name.toLowerCase().includes(search.toLowerCase()) && (filter === "All" || getFreshnessStatus(food.storedDate,food.recommendedDays,today) === filter));

  return (
    <section className="page-section">
      <div className="container">
        <div className="section-heading left">
          <p className="eyebrow">YOUR STORAGE</p>
          <h1>Food Items</h1>
          <p>View your stored food and QR codes.</p>
        </div>

        <div className="list-tools"><label>Search foods<input type="search" placeholder="Find a food…" value={search} onChange={e=>setSearch(e.target.value)}/></label><label>Freshness<select value={filter} onChange={e=>setFilter(e.target.value)}>{["All","Fresh","Use Soon","Check Before Use"].map(status=><option key={status}>{status}</option>)}</select></label><Link to="/add-food" className="button primary-button">+ Add Food</Link></div>
        {loading && <div className="message-card" role="status">Loading foods…</div>}

        {error && <div className="error-message" role="alert">{error} <button className="text-button" onClick={()=>window.location.reload()}>Try again</button></div>}

        {!loading && !error && foods.length === 0 && (
          <div className="message-card"><h2>Your fresh start begins here.</h2><p>Add your first food to create a container label.</p><Link to="/add-food" className="button primary-button">Add Food</Link></div>
        )}

        <div className="food-grid">
          {!loading && !error && foods.length > 0 && visible.length === 0 && <p role="status">No foods match your search.</p>}
          {visible.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FoodListPage;
