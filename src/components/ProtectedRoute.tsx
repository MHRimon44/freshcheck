import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, initializationError } = useAuth();
  const { pathname } = useLocation();
  if (loading)
    return (
      <div className="container page-section" role="status">
        Restoring your session…
      </div>
    );
  if (initializationError)
    return (
      <div className="container page-section" role="alert">
        {initializationError}
      </div>
    );
  if (!user)
    return <Navigate to="/sign-in" replace state={{ from: pathname }} />;
  return children;
}
