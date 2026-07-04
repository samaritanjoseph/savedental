import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";

const navLinks = [
  ["nav.home", "/"],
  ["nav.services", "/services"],
  ["nav.about", "/about"],
  ["nav.experience", "/experience"],
  ["nav.book", "/booking"],
  ["nav.faq", "/faq"],
  ["nav.contact", "/contact"],
];

export function Header() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  // Read notice banner from site settings
  const [banner, setBanner] = React.useState<{ enabled: boolean; text: string; color: string } | null>(null);
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('savedental_site_settings');
      if (saved) {
        const s = JSON.parse(saved);
        if (s.noticeBannerEnabled && s.noticeBannerText) {
          setBanner({ enabled: true, text: s.noticeBannerText, color: s.noticeBannerColor || '#07863f' });
        }
      }
    } catch {}
  }, []);

  return (
    <>
      {banner?.enabled && (
        <div style={{ background: banner.color, color: '#fff', textAlign: 'center', padding: '9px 20px', fontSize: '0.88rem', fontWeight: 600, letterSpacing: '0.01em', zIndex: 20, position: 'relative' }}>
          {banner.text}
        </div>
      )}
    <header className="site-header">
      <nav className="nav container" aria-label="Main navigation">
        <Link to="/" className="brand" aria-label="Save Dental Clinic home" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark image-mark">
            <img src="/images/save-dental-profile.jpg" alt="Save Dental Clinic logo" className="logo-anim" />
          </span>
          <span>
            <strong>Save Dental</strong>
            <small>Clinic</small>
          </span>
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`nav-panel ${menuOpen ? "is-open" : ""}`}>
          {navLinks.map(([label, to]) => (
            <NavLink
              key={label}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              {t(label)}
            </NavLink>
          ))}
          <div className="header-controls">
            <select
              className="lang-switcher"
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="fr">FR</option>
            </select>

            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>

          <Link to="/booking" className="nav-cta" onClick={() => setMenuOpen(false)}>
            {t("nav.book")}
          </Link>
        </div>
      </nav>
    </header>
    </>
  );
}
