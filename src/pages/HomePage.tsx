import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Leaf,
  QrCode,
  ScanLine,
  Plus,
  ShieldCheck,
  Recycle,
  Snowflake,
} from "lucide-react";
import FreshnessBadge from "../components/FreshnessBadge";
import hero from "../assets/food-containers.svg";
export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-copy">
            <p className="eyebrow">
              <Leaf size={15} /> A LITTLE LABEL. A FRESHER HABIT.
            </p>
            <h1>
              Scan It, Track It,
              <br />
              <span>Keep It Fresh.</span>
            </h1>
            <p>
              Good food deserves to be remembered. FreshCheck turns a simple QR
              label into clear storage guidance, right when you need it.
            </p>
            <div className="hero-actions">
              <Link className="button primary-button" to="/add-food">
                <Plus size={18} />
                Add Food
                <ArrowUpRight size={18} />
              </Link>
              <Link className="button outline-button" to="/my-foods">
                My Foods
              </Link>
            </div>
            <p className="hero-note">
              <ScanLine size={16} /> No app to install. Just your phone camera.
            </p>
          </div>
          <div className="hero-visual">
            <img
              src={hero}
              alt="Illustration of grapes, cut carrots, and boiled eggs in labeled storage containers"
            />
            <div className="visual-caption">
              <QrCode size={27} />
              <div>
                <strong>A small scan. A smarter kitchen.</strong>
                <span>Your food’s storage story, in one place.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="benefit-band">
        <div className="container benefits">
          <div>
            <ShieldCheck />
            <span>Track freshness</span>
          </div>
          <div>
            <Recycle />
            <span>Reduce food waste</span>
          </div>
          <div>
            <Snowflake />
            <span>Store smarter</span>
          </div>
        </div>
      </section>
      <section className="how-section container">
        <div className="section-heading left">
          <p className="eyebrow">FROM CONTAINER TO CAMERA</p>
          <h2>A fresher routine, in three steps.</h2>
          <p>A few details now. Less guesswork later.</p>
        </div>
        <div className="steps">
          {[
            {
              icon: Plus,
              title: "Add Food",
              text: "Give your food a name, a stored date, and a recommended storage period.",
            },
            {
              icon: QrCode,
              title: "Generate QR",
              text: "Save your food, then download or print its unique QR label for the container.",
            },
            {
              icon: ScanLine,
              title: "Scan & Check",
              text: "Open your phone camera and scan. See the current guidance in seconds.",
            },
          ].map(({ icon: Icon, title, text }, i) => (
            <article className="step-card" key={title}>
              <div className="step-top">
                <Icon size={25} />
                <span>0{i + 1}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="status-section">
        <div className="container">
          <div className="section-heading left">
            <p className="eyebrow">LESS GUESSWORK. MORE AWARENESS.</p>
            <h2>Know where your food stands.</h2>
            <p>Time-based guidance that changes as the days go by.</p>
          </div>
          <div className="steps">
            {(
              [
                {
                  status: "Fresh",
                  text: "Within the early part of your recommended storage period.",
                },
                {
                  status: "Use Soon",
                  text: "Approaching the end of the period. Plan to use it soon.",
                },
                {
                  status: "Check Before Use",
                  text: "Past the recommended period. Assess the food and its storage carefully.",
                },
              ] as const
            ).map(({ status, text }) => (
              <article className="status-explainer" key={status}>
                <FreshnessBadge status={status} />
                <p>{text}</p>
              </article>
            ))}
          </div>
          <p className="storage-note">
            FreshCheck provides storage guidance only. Always check the
            appearance, smell, storage conditions, and condition of food before
            consuming it.
          </p>
        </div>
      </section>
      <section className="closing container">
        <Leaf size={30} />
        <h2>Less Waste, More Freshness.</h2>
        <p>Start with one container. Make a little room for better habits.</p>
        <Link to="/add-food" className="button primary-button">
          Add your first food
          <ArrowUpRight size={18} />
        </Link>
      </section>
    </>
  );
}
