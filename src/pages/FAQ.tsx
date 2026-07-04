import { ChevronDown, HelpCircle, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { faqs, PHONE_TEL } from "../data";

export function FAQ() {
  const { t } = useTranslation();
  return (
    <>
      <section id="faq" className="section-pad faq-section">
        <div className="container faq-grid">
          <div className="section-heading">
            <span className="eyebrow">
              <span /> {t("faq.subtitle")}
            </span>
            <h2>{t("faq.title")}</h2>
            <p>
              {t("faq.desc")}
            </p>
            <figure className="section-photo-card faq-photo-card">
              <img
                src="/images/savedental/clinic-photo-6.jpg"
                alt="Save Dental opening hours flyer"
              />
              <figcaption>
                {t("faq.flyer_caption")}
              </figcaption>
            </figure>
          </div>
          <div className="faq-list">
            {faqs.map((faq) => (
              <details key={faq.id}>
                <summary>
                  <span>
                    <HelpCircle size={18} /> {t(`data.faqs.${faq.id}.question`, { defaultValue: faq.question })}
                  </span>
                  <ChevronDown size={18} />
                </summary>
                <p>{t(`data.faqs.${faq.id}.answer`, { defaultValue: faq.answer })}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section section-pad">
        <div className="container cta-card">
          <div>
            <span className="eyebrow light">
              <span /> {t("faq.cta_ready")}
            </span>
            <h2>
              {t("faq.cta_need")}
            </h2>
            <p>
              {t("faq.cta_call")}
            </p>
          </div>
          <a className="btn primary light-btn" href={`tel:${PHONE_TEL}`}>
            {t("faq.cta_btn")} <Phone size={18} />
          </a>
        </div>
      </section>
    </>
  );
}
