import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function BackButton() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  if (pathname === "/") return null;

  function goBack() {
    // Direct QR visits may have no previous page within this app.
    if (typeof window.history.state?.idx === "number" && window.history.state.idx > 0) {
      void navigate(-1);
    } else {
      void navigate("/");
    }
  }

  return (
    <div className="container page-back">
      <button type="button" className="utility-button back-button" onClick={goBack} aria-label="Go back to the previous page">
        <ArrowLeft size={18} aria-hidden="true" />
        <span>Back</span>
      </button>
    </div>
  );
}
