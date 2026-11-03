import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import NotFoundPage from "./pages/NotFoundPage";
import Brand from "./components/Brand";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfileNotice from "./components/ProfileNotice";
import BackButton from "./components/BackButton";

import HomePage from "./pages/HomePage";
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AddFoodPage = lazy(() => import("./pages/AddFoodPage"));
const FoodListPage = lazy(() => import("./pages/FoodListPage"));
const FoodDetailsPage = lazy(() => import("./pages/FoodDetailsPage"));

function RouteFocus() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.querySelector<HTMLElement>("main")?.focus();
  }, [pathname]);
  return null;
}
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Navbar />
        <RouteFocus />

        <main id="main" tabIndex={-1}>
          <BackButton />
          <ProfileNotice />
          <Suspense
            fallback={
              <div className="page-section container" role="status">
                Opening FreshCheck…
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/add-food"
                element={
                  <ProtectedRoute>
                    <AddFoodPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/foods"
                element={<Navigate to="/my-foods" replace />}
              />
              <Route
                path="/my-foods"
                element={
                  <ProtectedRoute>
                    <FoodListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sign-in"
                element={<AuthPage key="sign-in" mode="sign-in" />}
              />
              <Route
                path="/sign-up"
                element={<AuthPage key="sign-up" mode="sign-up" />}
              />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/food/:id" element={<FoodDetailsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>

        <footer>
          <div className="container">
            <Brand />
            <p>Less Waste, More Freshness.</p>
          </div>
        </footer>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
