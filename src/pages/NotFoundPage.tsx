import { Link } from "react-router-dom";
export default function NotFoundPage() {
  return (
    <section className="page-section container">
      <div className="message-card">
        <p className="eyebrow">404 · PAGE NOT FOUND</p>
        <h1>A little off the shelf.</h1>
        <p>
          This link doesn’t lead to a FreshCheck page. Try scanning the
          container’s QR again.
        </p>
        <Link className="button primary-button" to="/">
          Back to Home
        </Link>
      </div>
    </section>
  );
}
