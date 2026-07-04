import { Link } from "react-router-dom";
import {
  Camera,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  ADDRESS,
  EMAIL,
  INSTAGRAM_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
  whatsappLink,
  openingHours,
  MAPS_URL,
} from "../data";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      {/* CTA Banner */}
      <div className="footer-cta-strip">
        <div className="container footer-cta-inner">
          <div>
            <span className="footer-cta-tag">{t("footer.cta_tag")}</span>
            <h2 className="footer-cta-heading">
              {t("footer.cta_heading")}
            </h2>
          </div>
          <div className="footer-cta-actions">
            <a href={`tel:${PHONE_TEL}`} className="footer-cta-btn primary">
              <Phone size={18} /> {t("footer.call_now")}
            </a>
            <a
              href={whatsappLink("Hello Save Dental Clinic, I would like to book an appointment.")}
              target="_blank"
              rel="noreferrer"
              className="footer-cta-btn ghost"
            >
              <MessageCircle size={18} /> {t("footer.whatsapp_us")}
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Body */}
      <div className="footer-body">
        <div className="container footer-grid">

          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo" aria-label="Save Dental Clinic home">
              <img src="/images/save-dental-profile.jpg" alt="Save Dental Clinic Logo" />
              <span>
                <strong>Save Dental</strong>
                <small>Clinic · Ibadan</small>
              </span>
            </Link>
            <p>
              Ultra-modern, patient-centred dental care on Ring Road, Ibadan.
              <em> …a perfect oral health is possible.</em>
            </p>
            <div className="footer-social" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <a className="btn green-btn" href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram">
                <Camera size={18} />
                <span>Instagram</span>
              </a>
              <a
                className="btn green-btn"
                href={whatsappLink("Hello Save Dental Clinic!")}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h3 className="footer-col-title">Quick Links</h3>
            <ul>
              <li><Link to="/"><ArrowRight size={14} />{t("nav.home")}</Link></li>
              <li><Link to="/about"><ArrowRight size={14} />{t("nav.about")}</Link></li>
              <li><Link to="/services"><ArrowRight size={14} />{t("nav.services")}</Link></li>
              <li><Link to="/experience"><ArrowRight size={14} />{t("nav.experience")}</Link></li>
              <li><Link to="/booking"><ArrowRight size={14} />{t("nav.book")}</Link></li>
              <li><Link to="/faq"><ArrowRight size={14} />{t("nav.faq")}</Link></li>
              <li><Link to="/contact"><ArrowRight size={14} />{t("nav.contact")}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h3 className="footer-col-title">Contact Us</h3>
            <ul>
              <li>
                <a href={MAPS_URL} target="_blank" rel="noreferrer">
                  <MapPin size={15} />
                  {ADDRESS}
                </a>
              </li>
              <li>
                <a href={`tel:${PHONE_TEL}`}>
                  <Phone size={15} />
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`}>
                  <Mail size={15} />
                  {EMAIL}
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="footer-col">
            <h3 className="footer-col-title">
              <Clock size={16} /> {t("home.open_status_detail")}
            </h3>
            <ul className="footer-hours-list">
              {openingHours.map((item) => (
                <li key={item.id}>
                  <span>{t(`data.openingHours.${item.id}.days`, { defaultValue: item.days })}</span>
                  <strong>{t(`data.openingHours.${item.id}.time`, { defaultValue: item.time })}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="container footer-bottom-inner">
          <p>© {new Date().getFullYear()} Save Dental Clinic · All rights reserved.</p>
          <p className="footer-made-with">
            Developed by samaritan (<a href="mailto:samaritanjoseph@gmail.com">samaritanjoseph@gmail.com</a>)
          </p>
        </div>
      </div>
    </footer>
  );
}
