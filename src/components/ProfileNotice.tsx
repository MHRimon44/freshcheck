import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
export default function ProfileNotice() {
  const { profileError, repairProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  if (!profileError) return null;
  return (
    <div className="container profile-notice" role="status">
      <p>{profileError}</p>
      <button
        className="button secondary-button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await repairProfile();
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Saving profile…" : "Retry profile setup"}
      </button>
    </div>
  );
}
