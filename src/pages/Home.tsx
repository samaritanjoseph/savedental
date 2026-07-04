import React from "react";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { ArrowRight, Camera, CheckCircle2, MessageCircle, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { ADDRESS, highlights, INSTAGRAM_URL, PHONE_DISPLAY, PHONE_TEL, getOpenStatus, whatsappLink } from "../data";

import { Services } from "./Services";
import { About } from "./About";
import { Experience } from "./Experience";
import { Booking } from "./Booking";
import { FAQ } from "./FAQ";
import { Contact } from "./Contact";
import { Reviews } from "../components/Reviews";
import { useTranslation } from "react-i18next";

export function Home() {
  const [openStatus, setOpenStatus] = React.useState(() => getOpenStatus());
  const { t } = useTranslation();

  React.useEffect(() => {
    const timer = window.setInterval(
      () => setOpenStatus(getOpenStatus()),
      60000,
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <section className="hero section-pad">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">
              <span /> {t("home.eyebrow")}
            </div>
            <h1>{t("home.title")}</h1>
            <p>
              {t("home.desc")}
            </p>
            <div className="hero-actions">
              <a className="btn primary" href={`tel:${PHONE_TEL}`}>
                {t("home.call")} {PHONE_DISPLAY} <ArrowRight size={18} />
              </a>
              <a
                className="btn green-btn"
                href={whatsappLink(
                  "Hello Save Dental Clinic, I would like to book an appointment.",
                )}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={18} /> {t("home.whatsapp_booking")}
              </a>
              <a
                className="btn green-btn"
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
              >
                <Camera size={18} /> {t("home.view_instagram")}
              </a>
            </div>
            <div className="trust-row" aria-label="Clinic highlights">
              {highlights.map((item) => (
                <span key={item.id}>
                  <CheckCircle2 size={16} /> {t(`data.highlights.${item.id}`, { defaultValue: item.text })}
                </span>
              ))}
            </div>
          </div>

          <div className="hero-card" aria-label="Clinic appointment card">
            <div className="hero-visual">
              <div className="orb orb-one" />
              <div className="orb orb-two" />
              <div className="hero-main-photo">
                <img
                  src="/images/savedental/clinic-photo-5.jpg"
                  alt="Save Dental Clinic treatment room"
                />
              </div>
              <div className="hero-logo-stamp">
                <img
                  src="/images/save-dental-profile.jpg"
                  alt="Save Dental Clinic logo"
                />
                <span>{t("home.stamp_text", { defaultValue: "...a perfect oral health is possible" })}</span>
              </div>
              <div
                className="hero-service-pills"
                aria-label="Popular clinic services"
              >
                <span>
                  <Sparkles size={17} /> {t("home.pill_scaling", { defaultValue: "Scaling & polishing" })}
                </span>
                <span>
                  <ShieldCheck size={17} /> {t("home.pill_comfort", { defaultValue: "Comfort-led care" })}
                </span>
              </div>
            </div>
            <div className="appointment-card">
              <div className="appointment-card-topline">
                <span className="status-dot">{t("home.appointments_available")}</span>
                <span
                  className={
                    openStatus.open ? "hours-chip is-open" : "hours-chip"
                  }
                >
                  {openStatus.label}
                </span>
              </div>
              <h2>{t("home.book_visit")}</h2>
              <div className="card-meta refined-meta" style={{ flexDirection: "column", alignItems: "flex-start", gap: "12px" }}>
                <div>
                  <strong style={{ display: "block", marginBottom: "4px" }}>{t("home.working_hours")}</strong>
                  <span>{t("home.working_hours_details", { defaultValue: "Mon–Fri: 8am–6pm | Sat: 9am–5pm | Sun: 12pm–4pm" })}</span>
                </div>
                <div>
                  <strong style={{ display: "block", marginBottom: "4px" }}>{t("home.location")}</strong>
                  <span>{ADDRESS}</span>
                </div>
              </div>
              <div className="appointment-card-actions">
                <a href={`tel:${PHONE_TEL}`}>
                  <Phone size={17} /> {t("home.call")}
                </a>
                <a
                  href={whatsappLink(
                    "Hello Save Dental Clinic, I would like to book a dental appointment.",
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle size={17} /> {t("booking.whatsapp")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="proof-strip reveal">
        <div className="container proof-grid">
          <div>
            <AnimatedCounter end={9} suffix="+" />
            <span>{t("home.core_services")}</span>
          </div>
          <div>
            <strong>8am</strong>
            <span>{t("home.opening_time")}</span>
          </div>
          <div>
            <strong>Ibadan</strong>
            <span>{t("home.location_area")}</span>
          </div>
          <div>
            <strong>@save_dental</strong>
            <span>{t("home.instagram_presence")}</span>
          </div>
        </div>
      </section>

      <Services />
      <About />
      <Experience />
      <Booking />
      <FAQ />
      <Reviews />
      <Contact />
    </>
  );
}
