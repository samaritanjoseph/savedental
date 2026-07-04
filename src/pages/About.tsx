import React from "react";
import { ArrowRight, Camera, HeartPulse, MapPinned, Sparkles, Image, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { INSTAGRAM_URL, dentalTips, galleryItems } from "../data";

export function About() {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = React.useState<{title: string, image: string} | null>(null);

  return (
    <>
      <section id="about" className="section-pad split-section">
        <div className="container split-grid">
          <div className="image-panel real-photo-panel">
            <img
              src="/images/savedental/clinic-photo-1.jpg"
              alt="Save Dental Clinic team providing treatment"
            />
            <div className="floating-note">
              <Sparkles size={20} /> {t("about.floating_note", { defaultValue: "Prevention • Treatment • Education" })}
            </div>
          </div>
          <div className="split-copy">
            <span className="eyebrow">
              <span /> {t("about.subtitle")}
            </span>
            <h2>{t("about.title")}</h2>
            <p>
              {t("about.desc")}
            </p>
            <p>
              {t("about.visual_desc", { defaultValue: "The visual direction now combines clean medical whitespace with Save Dental's real clinic photos, green/orange brand colours, soft gradients, and rounded cards to communicate hygiene, calmness, and trust." })}
            </p>
            <div className="feature-list">
              <span>
                <HeartPulse size={18} /> {t("about.feature_patient", { defaultValue: "Patient-centred treatment tone" })}
              </span>
              <span>
                <Camera size={18} /> {t("about.feature_social", { defaultValue: "Social media friendly visuals" })}
              </span>
              <span>
                <MapPinned size={18} /> {t("about.feature_local", { defaultValue: "Strong local search signals" })}
              </span>
            </div>
            <a className="text-link" href="/contact">
              {t("about.find_clinic", { defaultValue: "Find the clinic" })} <ArrowRight size={17} />
            </a>
          </div>
        </div>
      </section>

      <section className="section-pad social-section">
        <div className="container social-grid">
          <div>
            <span className="eyebrow">
              <span /> {t("about.social_eyebrow", { defaultValue: "Social Direction" })}
            </span>
            <h2>
              {t("about.social_title", { defaultValue: "Designed to connect the website with their Instagram presence." })}
            </h2>
            <p>
              {t("about.social_desc", { defaultValue: "The public Instagram handle uses educational dental content and treatment awareness. This site supports that by making services, booking, and patient education easy to find." })}
            </p>
          </div>
          <div className="social-card">
            <img
              className="social-logo"
              src="/images/save-dental-profile.jpg"
              alt="Save Dental Clinic Instagram profile"
            />
            <img
              className="social-preview"
              src="/images/save-dental-braces-reel.jpg"
              alt="Save Dental Clinic braces education reel thumbnail"
            />
            <h3>@save_dental</h3>
            <p>
              {t("about.social_card_desc", { defaultValue: "Use Instagram for treatment education, before/after posts when approved, clinic updates, braces tips, and oral hygiene content." })}
            </p>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
              {t("about.open_instagram", { defaultValue: "Open Instagram" })} <ArrowRight size={17} />
            </a>
          </div>
        </div>
      </section>

      <section className="section-pad tips-section">
        <div className="container">
          <div className="section-heading centered">
            <span className="eyebrow">
              <span /> {t("about.tips_eyebrow", { defaultValue: "Oral Care Tips" })}
            </span>
            <h2>
              {t("about.tips_title", { defaultValue: "Helpful education that matches the clinic's social content." })}
            </h2>
            <p>
              {t("about.tips_desc", { defaultValue: "Short tips make the website feel useful, not just promotional, and give Save Dental more content to reuse on Instagram." })}
            </p>
          </div>
          <div className="tips-photo-row">
            <img
              src="/images/savedental/clinic-photo-2.jpg"
              alt="Save Dental D-Day campaign flyer"
            />
            <img
              src="/images/save-dental-braces-reel.jpg"
              alt="Save Dental oral health education post"
            />
          </div>
          <div className="tips-grid">
            {dentalTips.map(({ id, title, text, icon: Icon }) => (
              <article className="tip-card" key={id}>
                <Icon size={26} />
                <h3>{t(`data.dentalTips.${id}.title`, { defaultValue: title })}</h3>
                <p>{t(`data.dentalTips.${id}.text`, { defaultValue: text })}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad gallery-section">
        <div className="container gallery-grid">
          <div>
            <span className="eyebrow">
              <span /> {t("about.gallery_eyebrow", { defaultValue: "Gallery" })}
            </span>
            <h2>{t("about.gallery_title")}</h2>
            <p>
              {t("about.gallery_desc", { defaultValue: "A selection of our promotional content showing the treatment room, patient care, service flyers, opening hours, and Save Dental's clinic branding." })}
            </p>
          </div>
          <div className="gallery-wall">
            {galleryItems.map((item, index) => (
              <button
                className={`gallery-tile ${item.image ? "has-image" : ""}`}
                key={item.id}
                type="button"
                onClick={() => item.image && setSelectedImage(item)}
              >
                {item.image ? (
                  <img src={item.image} alt={t(`data.galleryItems.${item.id}`, { defaultValue: item.title })} />
                ) : (
                  <Image size={24} />
                )}
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{t(`data.galleryItems.${item.id}`, { defaultValue: item.title })}</strong>
                <em>{t("about.view_photo", { defaultValue: "View photo" })}</em>
              </button>
            ))}
          </div>
        </div>
      </section>

      {selectedImage && (
        <div
          className="gallery-modal"
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.title}
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="gallery-modal-close"
            type="button"
            aria-label="Close gallery image"
            onClick={() => setSelectedImage(null)}
          >
            <X size={22} />
          </button>
          <figure onClick={(event) => event.stopPropagation()}>
            <img src={selectedImage.image} alt={selectedImage.title} />
            <figcaption>{selectedImage.title}</figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
