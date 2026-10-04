import { API_BASE } from '../api';
import React from "react";
import {
  BadgeCheck,
  MessageCircle,
  Phone,
  Send,
  Syringe,
  PhoneCall,
  Clock,
  MapPin,
  CalendarCheck,
  User,
  Mail,
  Stethoscope,
  FileText
} from "lucide-react";
import {
  MAPS_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
  SECONDARY_PHONE_DISPLAY,
  SECONDARY_PHONE_TEL,
  visitChecklist,
  whatsappLink,
  ADDRESS,
  services,
} from "../data";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

type BookingMethod = "call" | "whatsapp" | "online";

export function Booking() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get("service") || "";
  // Find the matching service to get its translated display title
  const matchedService = services.find((s) => s.id === serviceId);
  const initialService = serviceId && matchedService
    ? t(`data.services.${serviceId}.title`, { defaultValue: matchedService.title })
    : "";
  const [activeMethod, setActiveMethod] = React.useState<BookingMethod>(
    searchParams.has("service") ? "online" : "call"
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState("");
  const [selectedTime, setSelectedTime] = React.useState("");
  const [takenSlots, setTakenSlots] = React.useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = React.useState(false);

  React.useEffect(() => {
    if (!selectedDate) {
      setTakenSlots([]);
      setSelectedTime("");
      return;
    }
    async function fetchAvailability() {
      setIsLoadingSlots(true);
      try {
        const res = await fetch(`${API_BASE}/api/availability?date=${selectedDate}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setTakenSlots(data.taken || []);
        }
      } catch (err) {
        console.error("Failed to fetch availability", err);
      } finally {
        setIsLoadingSlots(false);
      }
    }
    fetchAvailability();
  }, [selectedDate]);

  const TIME_SLOTS = [
    "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
    "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM"
  ];

  // Date constraints: today as minimum, 2 years ahead as maximum (keeps year to 4 digits)
  const todayStr = new Date().toISOString().split("T")[0];
  const maxDateStr = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2);
    return d.toISOString().split("T")[0];
  })();

  async function handleBookingSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitSuccess(false);

    const formData = new FormData(event.currentTarget);
    const bookingData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      service: formData.get("service"),
      date: formData.get("date"),
      time: selectedTime,
      notes: formData.get("message"),
    };

    try {
      const response = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        (event.target as HTMLFormElement).reset();
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMsg =
          errorData?.error ||
          (Array.isArray(errorData?.errors) ? errorData.errors.map((e: any) => e.msg).join(", ") : null) ||
          "Something went wrong. Please try again.";
        alert(errorMsg);
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert(`Failed to connect to the server (${API_BASE}). Please make sure the backend server is running.`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* Emergency Strip */}
      <section className="section-pad emergency-section">
        <div className="container emergency-card">
          <div>
            <span className="eyebrow light">
              <span /> {t("booking.emergency_eyebrow", { defaultValue: "Dental Emergency" })}
            </span>
            <h2>{t("booking.emergency_title", { defaultValue: "Tooth pain, swelling, or broken tooth?" })}</h2>
            <p>
              {t("booking.emergency_desc", { defaultValue: "Contact the clinic quickly instead of self-medicating or waiting until symptoms worsen." })}
            </p>
          </div>
          <div className="emergency-actions">
            <a href={`tel:${PHONE_TEL}`}>
              <Phone size={18} /> {t("booking.call_now", { defaultValue: "Call now" })}
            </a>
            <a
              href={whatsappLink(
                "Hello Save Dental Clinic, I need help with a dental emergency.",
              )}
              target="_blank"
              rel="noreferrer"
            >
              <Syringe size={18} /> {t("booking.urgent_help", { defaultValue: "Request urgent help" })}
            </a>
          </div>
        </div>
      </section>

      {/* Modern Split-Layout Booking Section */}
      <section id="booking" className="section-pad booking-section">
        <div className="container">
          <div className="section-heading centered">
            <span className="eyebrow">
              <span /> {t("booking.title")}
            </span>
            <h2>{t("booking.subtitle")}</h2>
            <p>
              {t("booking.desc")}
            </p>
          </div>

          {/* Premium Method Selectors */}
          <div className="booking-method-selector">
            <button 
              className={`method-card ${activeMethod === "call" ? "active" : ""}`}
              onClick={() => setActiveMethod("call")}
            >
              <div className="method-icon"><PhoneCall size={28} /></div>
              <h3>{t("booking.call_us")}</h3>
              <p>{t("booking.call_desc")}</p>
            </button>
            <button 
              className={`method-card ${activeMethod === "whatsapp" ? "active" : ""}`}
              onClick={() => setActiveMethod("whatsapp")}
            >
              <div className="method-icon wa"><MessageCircle size={28} /></div>
              <h3>{t("booking.whatsapp")}</h3>
              <p>{t("booking.whatsapp_desc")}</p>
            </button>
            <button 
              className={`method-card ${activeMethod === "online" ? "active" : ""}`}
              onClick={() => setActiveMethod("online")}
            >
              <div className="method-icon"><CalendarCheck size={28} /></div>
              <h3>{t("booking.online")}</h3>
              <p>{t("booking.online_desc")}</p>
            </button>
          </div>

          <div className="pro-booking-grid focused">
            {/* â”€â”€ LEFT COLUMN: Quick Contact Options â”€â”€ */}
            <div className="pro-quick-contact">
              
              {/* Call Card */}
              {activeMethod === "call" && (
                <div className="pro-contact-card focused-card">
                  <div className="pro-card-header">
                    <PhoneCall size={28} className="pro-icon" />
                    <div>
                      <h3>{t("booking.fast_track")}</h3>
                      <p>{t("booking.fast_track_desc")}</p>
                    </div>
                  </div>
                <div className="pro-card-body">
                  <a href={`tel:${PHONE_TEL}`} className="pro-phone-link">
                    <strong>{PHONE_DISPLAY}</strong>
                    <span>{t("booking.primary_line", { defaultValue: "Primary Line" })}</span>
                  </a>
                  <a href={`tel:${SECONDARY_PHONE_TEL}`} className="pro-phone-link secondary">
                    <strong>{SECONDARY_PHONE_DISPLAY}</strong>
                    <span>{t("booking.secondary_line", { defaultValue: "Secondary Line" })}</span>
                  </a>
                </div>
              </div>
              )}

              {/* WhatsApp Card */}
              {activeMethod === "whatsapp" && (
                <div className="pro-contact-card whatsapp focused-card">
                  <div className="pro-card-header">
                    <MessageCircle size={28} className="pro-icon wa-icon" />
                    <div>
                      <h3>{t("booking.book_whatsapp")}</h3>
                      <p>{t("booking.book_whatsapp_desc")}</p>
                    </div>
                  </div>
                  <div className="pro-card-body wa-chips">
                    {searchParams.has("service") ? (
                      <a
                        href={whatsappLink(`Hello Save Dental Clinic, I would like to book an appointment for *${initialService}*.`)}
                        target="_blank"
                        rel="noreferrer"
                        className="wa-micro-chip"
                        style={{ background: "#25d366", color: "#fff", borderColor: "#25d366", padding: "12px 20px", fontSize: "1.05rem" }}
                      >
                        <CalendarCheck size={18} /> {t("services.book_button")} {initialService}
                      </a>
                    ) : (
                      <>
                        {services.map(({ id, title, icon: Icon }) => {
                          const translatedTitle = t(`data.services.${id}.title`, { defaultValue: title });
                          return (
                            <a
                              key={id}
                              className="wa-micro-chip"
                              href={whatsappLink(`Hello Save Dental Clinic, I would like to book an appointment for *${translatedTitle}*.`)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Icon size={14} />
                              {translatedTitle}
                            </a>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Info Block (Always Visible on the left side) */}
              {(activeMethod === "call" || activeMethod === "whatsapp") && (
                <div className="pro-info-block">
                  <div className="info-item">
                    <Clock size={18} />
                    <div>
                      <strong>{t("home.working_hours")}</strong>
                      <span>{t("home.working_hours_details", { defaultValue: "Monâ€“Fri: 8amâ€“6pm | Sat: 9amâ€“5pm | Sun: 12pmâ€“4pm" })}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <MapPin size={18} />
                    <div>
                      <strong>{t("home.location")}</strong>
                      <a href={MAPS_URL} target="_blank" rel="noreferrer">{ADDRESS}</a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* â”€â”€ RIGHT COLUMN: Online Booking Form â”€â”€ */}
            {activeMethod === "online" && (
              <div className="pro-booking-form-wrapper focused-card full-width">
              
              {submitSuccess ? (
                <div className="booking-success-state">
                  <div className="success-icon-wrapper">
                    <BadgeCheck size={48} color="#25d366" />
                  </div>
                  <h3>{t("booking.success_title", { defaultValue: "Request Sent Successfully!" })}</h3>
                  <p>{t("booking.success_desc", { defaultValue: "Thank you for choosing Save Dental Clinic. We have received your appointment request." })}</p>
                  <div className="success-details">
                    <p><strong>{t("booking.success_next", { defaultValue: "What happens next?" })}</strong></p>
                    <ul>
                      <li>{t("booking.success_step1", { defaultValue: "We will review your requested time and service." })}</li>
                      <li>{t("booking.success_step2", { defaultValue: "You will receive a confirmation email shortly." })}</li>
                      <li>{t("booking.success_step3", { defaultValue: "Our team may call you if we need to adjust the time." })}</li>
                    </ul>
                  </div>
                  <button className="btn primary outline" type="button" onClick={() => setSubmitSuccess(false)}>
                    {t("booking.book_another", { defaultValue: "Book Another Appointment" })}
                  </button>
                </div>
              ) : (
                <>
                  <div className="pro-form-header">
                    <h3>{t("booking.request_appt")}</h3>
                    <p>{t("booking.request_appt_desc")}</p>
                  </div>
                  <form className="pro-form advanced" onSubmit={handleBookingSubmit}>
                <div className="form-section">
                  <h4 className="section-title">{t("booking.patient_details", { defaultValue: "Patient Details" })}</h4>
                  <div className="form-row">
                    <label className="input-group">
                      <span className="label-text">{t("booking.full_name")}</span>
                      <div className="input-wrapper">
                        <User size={18} className="input-icon" />
                        <input name="name" type="text" placeholder={t("booking.name_placeholder", { defaultValue: "Your full name" })} required />
                      </div>
                    </label>
                    <label className="input-group">
                      <span className="label-text">{t("booking.email")}</span>
                      <div className="input-wrapper">
                        <Mail size={18} className="input-icon" />
                        <input name="email" type="email" placeholder={t("booking.email_placeholder", { defaultValue: "you@example.com" })} required />
                      </div>
                    </label>
                  </div>
                  <div className="form-row">
                    <label className="input-group">
                      <span className="label-text">{t("booking.phone")}</span>
                      <div className="input-wrapper">
                        <Phone size={18} className="input-icon" />
                        <input name="phone" type="tel" placeholder="+234 xxx xxx xxxx" required />
                      </div>
                    </label>
                    <label className="input-group">
                      <span className="label-text">{t("booking.service_needed")}</span>
                      <div className="input-wrapper">
                        <Stethoscope size={18} className="input-icon" />
                        <select name="service" defaultValue={initialService} required>
                          <option value="">{t("booking.service_needed")}</option>
                          {services.map((s) => (
                            <option key={s.id} value={t(`data.services.${s.id}.title`, { defaultValue: s.title })}>
                              {t(`data.services.${s.id}.title`, { defaultValue: s.title })}
                            </option>
                          ))}
                          <option value={t("booking.emergency", { defaultValue: "Emergency dental care" })}>
                            {t("booking.emergency", { defaultValue: "Emergency dental care" })}
                          </option>
                        </select>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="form-section">
                  <h4 className="section-title">{t("booking.appt_details", { defaultValue: "Appointment Details" })}</h4>
                  <div className="form-row">
                    <label className="input-group">
                      <span className="label-text">{t("booking.pref_date")}</span>
                      <div className="input-wrapper">
                        <CalendarCheck size={18} className="input-icon" />
                        <input
                          name="date"
                          type="date"
                          required
                          min={todayStr}
                          max={maxDateStr}
                          value={selectedDate}
                          onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setSelectedTime("");
                          }}
                        />
                      </div>
                    </label>
                    <label className="input-group">
                      <span className="label-text">{t("booking.pref_time")}</span>
                      <div className="input-wrapper">
                        <Clock size={18} className="input-icon" />
                        <select 
                          name="time" 
                          required 
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          disabled={!selectedDate || isLoadingSlots}
                        >
                          <option value="">
                            {!selectedDate 
                              ? t("booking.select_date_first", { defaultValue: "Select a date first" }) 
                              : isLoadingSlots 
                                ? t("booking.loading_slots", { defaultValue: "Loading..." }) 
                                : t("booking.select_time", { defaultValue: "Select a time" })}
                          </option>
                          {selectedDate && !isLoadingSlots && TIME_SLOTS.map((time) => {
                            const isTaken = takenSlots.includes(time);
                            return (
                              <option key={time} value={time} disabled={isTaken}>
                                {time} {isTaken ? t("booking.slot_taken", { defaultValue: "(Taken)" }) : ""}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </label>
                  </div>
                  <label className="input-group">
                    <span className="label-text">{t("booking.notes")} <span className="optional-tag">({t("booking.optional", { defaultValue: "optional" })})</span></span>
                    <div className="input-wrapper textarea-wrapper">
                      <FileText size={18} className="input-icon" />
                      <textarea
                        name="message"
                        placeholder={t("booking.notes_placeholder", { defaultValue: "Describe your symptoms or what you'd like help with" })}
                        rows={4}
                      />
                    </div>
                  </label>
                </div>
                
                <button className="btn primary pro-submit-btn" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="loading-spinner"></span> {t("booking.sending", { defaultValue: "Sending..." })}
                    </>
                  ) : (
                    <>{t("booking.submit")} <Send size={18} /></>
                  )}
                </button>
              </form>
              </>
            )}
            </div>
            )}
          </div>

          {/* Before You Visit */}
          <div className="visit-checklist-inline">
            <h3>{t("booking.before_visit", { defaultValue: "Before you visit" })}</h3>
            <div className="visit-list">
              {visitChecklist.map((item) => (
                <div className="visit-item" key={item.id}>
                  <BadgeCheck size={20} />
                  <span>{t(`data.visitChecklist.${item.id}`, { defaultValue: item.text })}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
