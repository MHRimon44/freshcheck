import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import NotFoundPage from "./pages/NotFoundPage";
import Brand from "./components/Brand";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import BackButton from "./components/BackButton";

import HomePage from "./pages/HomePage";
const AddFoodPage = lazy(() => import("./pages/AddFoodPage"));
const FoodListPage = lazy(() => import("./pages/FoodListPage"));
const FoodDetailsPage = lazy(() => import("./pages/FoodDetailsPage"));

function RouteFocus() {
 const { pathname } = useLocation();
 useEffect(() => { window.scrollTo(0,0); document.querySelector<HTMLElement>("main")?.focus(); },[pathname]);
 return null;
}
function App() {
  return (
    <BrowserRouter>
      <a className="skip-link" href="#main">Skip to content</a><Navbar /><RouteFocus />

      <main id="main" tabIndex={-1}>
        <BackButton />
        <Suspense fallback={<div className="page-section container" role="status">Opening FreshCheck…</div>}><Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/add-food" element={<AddFoodPage />} />
          <Route path="/foods" element={<FoodListPage />} />
          <Route path="/food/:id" element={<FoodDetailsPage />} />
        <Route path="*" element={<NotFoundPage />} /></Routes></Suspense>
      </main>

      <footer>
        <div className="container">
          <Brand/>
          <p>Less Waste, More Freshness.</p>
        </div>
      </footer>
    </BrowserRouter>
  );
}

export default App;
