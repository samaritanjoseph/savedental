import { Link } from "react-router-dom";
import { CalendarCheck } from "lucide-react";
import { services } from "../data";
import { useTranslation } from "react-i18next";

export function Services() {
  const { t } = useTranslation();
  return (
    <>
      <section id="services" className="section-pad services-section">
        <div className="container">
          <div className="service-intro-grid reveal">
            <div className="section-heading">
              <span className="eyebrow">
                <span /> {t("nav.services")}
              </span>
              <h2>{t("services.title")}</h2>
              <p>
                {t("services.subtitle")}
              </p>
            </div>
            <figure className="section-photo-card service-photo-card">
              <img
                src="/images/savedental/clinic-photo-3.jpg"
                alt="Save Dental Clinic approved services flyer"
              />
              <figcaption>{t("services.approved_list")}</figcaption>
            </figure>
          </div>

          <div className="services-grid">
            {services.map(({ id, title, icon: Icon, colorTheme }, index) => (
              <article className={`service-card ${colorTheme} reveal`} style={{ animationDelay: `${index * 0.1}s` }} key={id}>
                <div className="service-icon">
                  <Icon size={32} strokeWidth={1.5} />
                </div>
                <h3>{t(`data.services.${id}.title`, { defaultValue: title })}</h3>
                <p>{t(`data.services.${id}.description`, { defaultValue: title })}</p>
                <Link
                  className="service-booking-link"
                  to={`/booking?service=${encodeURIComponent(id)}`}
                >
                  {t("services.book_button")} {t(`data.services.${id}.title`, { defaultValue: title })} <CalendarCheck size={16} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
