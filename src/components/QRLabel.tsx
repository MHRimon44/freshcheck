import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Printer } from "lucide-react";
import Brand from "./Brand";
export default function QRLabel({ id, name }: { id: string; name: string }) {
  const canvas = useRef<HTMLCanvasElement>(null),
    [error, setError] = useState("");
  const url = `${window.location.origin}/food/${encodeURIComponent(id)}`;
  function download() {
    try {
      const link = document.createElement("a");
      const foodName = name.normalize("NFKC").toLowerCase()
        .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80).replace(/-+$/g, "") || "food";
      link.download = `freshcheck-${foodName}-qr.png`;
      link.href = canvas.current!.toDataURL("image/png");
      link.click();
    } catch {
      setError("Could not download the QR. Try printing the label instead.");
    }
  }
  return (
    <aside className="qr-card">
      <div className="print-label">
        <Brand />
        <h2>{name}</h2>
        <div className="qr-wrapper">
          <QRCodeCanvas
            ref={canvas}
            value={url}
            size={720}
            level="M"
            marginSize={4}
            title={`FreshCheck QR for ${name}`}
          />
        </div>
        <p>Scan to check freshness</p>
      </div>
      <div className="qr-controls">
        <p className="qr-description">
          One label. Up-to-date guidance every time you scan.
        </p>
        <button
          className="button primary-button full-button"
          onClick={download}
        >
          <Download size={17} />
          Download QR
        </button>
        <button
          className="button secondary-button full-button"
          onClick={() => window.print()}
        >
          <Printer size={17} />
          Print QR label
        </button>
        <a className="qr-url" href={url}>
          {url}
        </a>
        {/^localhost$|^127\.0\.0\.1$/.test(window.location.hostname) && (
          <p className="muted">
            Local QR: this address won’t open on another phone. Generate labels
            on the deployed website.
          </p>
        )}
        {error && <p role="alert">{error}</p>}
      </div>
    </aside>
  );
}
