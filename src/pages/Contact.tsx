import { ArrowRight, Camera, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ADDRESS, EMAIL, INSTAGRAM_URL, MAPS_URL, MAP_EMBED_URL, PHONE_DISPLAY, PHONE_TEL, SECONDARY_PHONE_DISPLAY, SECONDARY_PHONE_TEL, whatsappLink } from "../data";

export function Contact() {
  const { t } = useTranslation();

  return (
    <>
      <section className="section-pad map-section">
        <div className="container map-grid">
          <div>
            <span className="eyebrow">
              <span /> {t("contact.subtitle")}
            </span>
            <h2>{t("contact.title")}</h2>
            <p>
              {t("contact.desc")}
            </p>
            <a
              className="text-link"
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
            >
              {t("contact.open_maps", { defaultValue: "Open in Google Maps" })} <ArrowRight size={17} />
            </a>
          </div>
          <div className="map-card">
            <iframe
              title="Save Dental Clinic map"
              src={MAP_EMBED_URL}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <section id="contact" className="section-pad contact-section">
        <div className="container contact-grid">
          <div>
            <span className="eyebrow">
              <span /> {t("contact.subtitle")}
            </span>
            <h2>{t("contact.visit_title", { defaultValue: "Visit Save Dental Clinic on Ring Road, Ibadan." })}</h2>
            <p>
              {t("contact.visit_desc", { defaultValue: "Approved clinic flyers list the location as Dikat House, First Floor, Complex, A1 No. 60 Ring Road, Ibadan, Oyo State. Call before visiting to confirm current availability." })}
            </p>
            <figure className="contact-location-photo">
              <img
                src="/images/savedental/clinic-photo-2.jpg"
                alt="Save Dental Clinic location and service flyer"
              />
              <figcaption>
                {t("contact.flyer_caption", { defaultValue: "Official flyer with Ring Road address and contact details" })}
              </figcaption>
            </figure>
          </div>
          <div className="contact-card">
            <a href={`tel:${PHONE_TEL}`}>
              <Phone size={20} /> {PHONE_DISPLAY}
            </a>
            <a
              href={whatsappLink(
                "Hello Save Dental Clinic, I would like to make an enquiry.",
              )}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={20} /> {t("contact.whatsapp_label", { defaultValue: "WhatsApp Save Dental" })}
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
              <Camera size={20} /> @save_dental
            </a>
            <a href={`tel:${SECONDARY_PHONE_TEL}`}>
              <Phone size={20} /> {SECONDARY_PHONE_DISPLAY}
            </a>
            <a href={MAPS_URL} target="_blank" rel="noreferrer">
              <MapPin size={20} /> {ADDRESS}
            </a>
            <a href={`mailto:${EMAIL}`}>
              <Mail size={20} /> {EMAIL}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
