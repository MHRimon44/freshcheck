import { CircleCheck, Clock3, CircleAlert } from "lucide-react";
import type { FreshnessStatus } from "../types/food";
export default function FreshnessBadge({
  status,
}: {
  status: FreshnessStatus;
}) {
  const Icon =
    status === "Fresh"
      ? CircleCheck
      : status === "Use Soon"
        ? Clock3
        : CircleAlert;
  return (
    <span
      className={`status ${status === "Fresh" ? "fresh" : status === "Use Soon" ? "soon" : "check"}`}
    >
      <Icon size={16} aria-hidden="true" />
      {status}
    </span>
  );
}
