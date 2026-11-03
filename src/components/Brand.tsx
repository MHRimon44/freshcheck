import { Leaf, Check } from "lucide-react";
export default function Brand() {
  return (
    <span className="brand">
      <span className="brand-mark" aria-hidden="true">
        <Leaf size={27} />
        <Check size={15} />
      </span>
      <span>
        Fresh<span className="brand-accent">Check</span>
      </span>
    </span>
  );
}
