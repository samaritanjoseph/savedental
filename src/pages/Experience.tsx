import { Quote } from "lucide-react";
import { carePromises, processSteps, safetyItems } from "../data";
import { useTranslation } from "react-i18next";

export function Experience() {
  const { t } = useTranslation();
  return (
    <>
      <section className="section-pad safety-section">
        <div className="container">
          <div className="section-heading centered">
            <span className="eyebrow">
              <span /> {t("experience.safety_eyebrow", { defaultValue: "Safety & Sterilization" })}
            </span>
            <h2>{t("experience.safety_title", { defaultValue: "Clean, protected, and patient-conscious care." })}</h2>
            <p>
              {t("experience.safety_desc", { defaultValue: "The clinic photos show a protected treatment setup. This section turns that visual proof into trust-building UX for first-time patients." })}
            </p>
          </div>
          <div className="safety-photo-band">
            <img
              src="/images/savedental/clinic-photo-4.jpg"
              alt="Save Dental protected patient care session"
            />
            <img
              src="/images/savedental/clinic-photo-1.jpg"
              alt="Save Dental treatment setup with team"
            />
          </div>
          <div className="safety-grid">
            {safetyItems.map(({ id, title, text, icon: Icon }) => (
              <article className="safety-card" key={id}>
                <Icon size={26} />
                <h3>{t(`data.safetyItems.${id}.title`, { defaultValue: title })}</h3>
                <p>{t(`data.safetyItems.${id}.text`, { defaultValue: text })}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="experience" className="section-pad experience-section">
        <div className="container experience-grid">
          <div>
            <span className="eyebrow">
              <span /> {t("experience.subtitle")}
            </span>
            <h2>{t("experience.journey_title", { defaultValue: "A clear journey from appointment to after-care." })}</h2>
            <figure className="section-photo-card experience-photo-card">
              <img
                src="/images/savedental/clinic-photo-5.jpg"
                alt="Save Dental treatment room and dental chair"
              />
              <figcaption>{t("experience.photo_caption", { defaultValue: "Comfortable treatment room environment" })}</figcaption>
            </figure>
          </div>
          <div className="steps">
            {processSteps.map((step, index) => (
              <div className="step" key={step.id}>
                <strong>{String(index + 1).padStart(2, "0")}</strong>
                <p>{t(`data.processSteps.${step.id}`, { defaultValue: step.text })}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad promise-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">
              <span /> {t("experience.subtitle")}
            </span>
            <h2>{t("experience.title")}</h2>
            <p>
              {t("experience.desc")}
            </p>
          </div>
          <div className="promise-grid">
            {carePromises.map((promise) => (
              <article className="promise-card" key={promise.id}>
                <Quote size={28} />
                <h3>{t(`data.carePromises.${promise.id}.title`, { defaultValue: promise.title })}</h3>
                <p>{t(`data.carePromises.${promise.id}.text`, { defaultValue: promise.text })}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
