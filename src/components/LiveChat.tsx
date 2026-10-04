import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  User,
  Phone,
  Calendar,
} from "lucide-react";
import { whatsappLink, PHONE_DISPLAY, PHONE_TEL } from "../data";
import { useTranslation } from "react-i18next";

// ─── Knowledge Base ────────────────────────────────────────────────────────────
const KB = {
  services: [
    "Teeth Cleaning",
    "Tooth Fillings",
    "Root Canal Therapy",
    "Teeth Whitening",
    "Dental Implantology",
    "Dental X-rays",
    "Orthodontic & Invisible Braces",
    "Veneers, Crowns & Bridges",
    "General Dental Treatment",
  ],
  hours: "Monday – Friday: 8:00am – 6:00pm | Saturday: 9:00am – 5:00pm | Sunday: 12noon – 4:00pm",
  address: "Dikat House, First Floor, Complex, A1 No. 60 Ring Road, Ibadan, Oyo State",
  phone1: PHONE_DISPLAY,
  phone2: "+234 702 598 9518",
  email: "savedentalinitiative@gmail.com",
  instagram: "@save_dental",
  bookingUrl: "/booking",
};

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  id: number;
  from: "bot" | "user";
  text?: string;
  textKey?: string;
  textParams?: any;
  quickReplies?: string[];
  time: string;
}

function getTime() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function getBotReplyKey(input: string, isQuickReply: boolean = false): { textKey: string; textParams?: any; quickReplies?: string[] } {
  if (isQuickReply) {
    switch (input) {
      case "services": return { textKey: "chat.reply.services", quickReplies: ["book", "hours", "contact"] };
      case "hours": return { textKey: "chat.reply.hours_msg", textParams: { hours: KB.hours }, quickReplies: ["book", "location"] };
      case "location": return { textKey: "chat.reply.location_msg", textParams: { address: KB.address }, quickReplies: ["directions", "hours", "book"] };
      case "book": return { textKey: "chat.reply.booking_msg", textParams: { phone1: KB.phone1 }, quickReplies: ["book_online", "call", "whatsapp"] };
      case "contact": return { textKey: "chat.reply.contact_msg", textParams: { phone1: KB.phone1, phone2: KB.phone2, email: KB.email, instagram: KB.instagram }, quickReplies: ["book", "hours"] };
      case "whatsapp": return { textKey: "chat.reply.booking_msg", quickReplies: [] };
    }
  }

  const msg = input.toLowerCase().trim();

  if (/^(hi|hello|hey|good morning|good afternoon|good evening|howdy|yo|bonjour|salut|hola|buenos|buenas)\b/.test(msg)) {
    return { textKey: "chat.reply.welcome", quickReplies: ["services", "hours", "location", "book"] };
  }
  if (/service|treat|offer|do you|what can|procedure|available|soin|traitement|servici/.test(msg)) {
    return { textKey: "chat.reply.services", quickReplies: ["book", "hours", "contact"] };
  }
  if (/clean|scaling|polish|plaque|tartar|stain|nettoyage|détartrage|limpieza|sarro/.test(msg)) {
    return { textKey: "chat.reply.cleaning", quickReplies: ["book", "hours"] };
  }
  if (/whiten|bright|white|blanchi|blanquea/.test(msg)) {
    return { textKey: "chat.reply.whitening", quickReplies: ["book", "hours"] };
  }
  if (/root canal|nerve|pulp|canal|nervio/.test(msg)) {
    return { textKey: "chat.reply.root_canal", quickReplies: ["book", "contact"] };
  }
  if (/brace|align|orthodont|invisible|crooked|straight|bagues|appareil|brackets|ortodoncia/.test(msg)) {
    return { textKey: "chat.reply.braces", quickReplies: ["book", "hours"] };
  }
  if (/implant|missing tooth|replace tooth|manquant|implante|diente/.test(msg)) {
    return { textKey: "chat.reply.implants", quickReplies: ["book", "contact"] };
  }
  if (/x.?ray|xray|scan|imaging|radio|radiografía/.test(msg)) {
    return { textKey: "chat.reply.xray", quickReplies: ["book", "hours"] };
  }
  if (/pain|ache|emergency|urgent|hurts|swollen|swelling|broken|crack|chip|douleur|urgence|mal|dolor|emergencia/.test(msg)) {
    return { textKey: "chat.reply.emergency", textParams: { phone1: KB.phone1, phone2: KB.phone2 }, quickReplies: ["whatsapp", "call"] };
  }
  if (/hour|open|close|time|when|schedule|day|weekend|sunday|saturday|monday|heure|ouvert|ferme|hora|abierto|cierra/.test(msg)) {
    return { textKey: "chat.reply.hours_msg", textParams: { hours: KB.hours }, quickReplies: ["book", "location"] };
  }
  if (/where|location|address|find you|directions|map|ibadan|ring road|où|adresse|donde|ubicación|dirección/.test(msg)) {
    return { textKey: "chat.reply.location_msg", textParams: { address: KB.address }, quickReplies: ["directions", "hours", "book"] };
  }
  if (/book|appointment|schedule|reserve|slot|rendez-vous|réserver|cita|reservar/.test(msg)) {
    return { textKey: "chat.reply.booking_msg", textParams: { phone1: KB.phone1 }, quickReplies: ["book_online", "call", "whatsapp"] };
  }
  if (/contact|phone|call|number|reach|tel|téléphone|numéro|teléfono/.test(msg)) {
    return { textKey: "chat.reply.contact_msg", textParams: { phone1: KB.phone1, phone2: KB.phone2, email: KB.email, instagram: KB.instagram }, quickReplies: ["book", "hours"] };
  }
  if (/price|cost|fee|how much|charge|afford|cheap|expensive|prix|coût|combien|precio|costo|cuánto/.test(msg)) {
    return { textKey: "chat.reply.price", quickReplies: ["book", "contact", "services"] };
  }
  if (/child|kid|baby|family|pediatric|young|enfant|bébé|famille|niño|bebé|familia/.test(msg)) {
    return { textKey: "chat.reply.family", quickReplies: ["book", "hours"] };
  }
  if (/safe|hygiene|clean|steril|covid|protect|mask|glove|sécurité|propre|seguro|limpio/.test(msg)) {
    return { textKey: "chat.reply.safety", quickReplies: ["book", "services"] };
  }
  if (/instagram|social|media|ig/.test(msg)) {
    return { textKey: "chat.reply.instagram_msg", textParams: { instagram: KB.instagram }, quickReplies: ["services", "book"] };
  }
  if (/thank|thanks|appreciate|helpful|merci|gracias/.test(msg)) {
    return { textKey: "chat.reply.thanks", quickReplies: ["services", "book", "hours"] };
  }
  if (/bye|goodbye|see you|later|done|au revoir|adiós|chao/.test(msg)) {
    return { textKey: "chat.reply.bye" };
  }

  return { textKey: "chat.reply.fallback", quickReplies: ["services", "hours", "location", "book", "contact"] };
}

// ─── Component ─────────────────────────────────────────────────────────────────
export function LiveChat() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      from: "bot",
      textKey: "chat.reply.welcome",
      quickReplies: ["services", "hours", "location", "book"],
      time: getTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  let nextId = useRef(2);

  useEffect(() => {
    // Auto-open after 30 seconds if user hasn't closed it
    const timer = setTimeout(() => {
      setOpen(o => {
        // Only auto-open on desktop (width > 768px)
        if (!o && !hidden && window.innerWidth > 768) return true;
        return o;
      });
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  function addMessage(msg: Omit<Message, "id" | "time">) {
    const id = nextId.current++;
    setMessages((prev) => [...prev, { ...msg, id, time: getTime() }]);
  }

  function handleQuickReply(qrKey: string) {
    addMessage({ from: "user", text: t(`chat.qr.${qrKey}`) });
    handleBotResponse(qrKey, true);
  }

  function handleBotResponse(inputVal: string, isQuickReply: boolean = false) {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);

      if (isQuickReply) {
        if (inputVal === "book_online") {
          window.location.href = "/booking";
          return;
        }
        if (inputVal === "directions") {
          window.open("https://www.google.com/maps/search/?api=1&query=Save+Dental+Clinic+Dikat+House+No+60+Ring+Road+Ibadan", "_blank");
          return;
        }
        if (inputVal === "whatsapp") {
          window.open(whatsappLink("Hello Save Dental Clinic, I would like to make an enquiry."), "_blank");
          return;
        }
        if (inputVal === "call") {
          window.location.href = `tel:${PHONE_TEL}`;
          return;
        }
      }

      const reply = getBotReplyKey(inputVal, isQuickReply);
      addMessage({ from: "bot", ...reply });
    }, 800 + Math.random() * 400);
  }

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    addMessage({ from: "user", text });
    handleBotResponse(text);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSend();
  }

  // Render markdown-lite (bold **text**)
  function renderText(text: string) {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={j}>{part.slice(2, -2)}</strong>
            ) : (
              part
            )
          )}
          {i < lines.length - 1 && <br />}
        </span>
      );
    });
  }

  if (hidden) return null;

  return (
    <>
      {/* ── Floating Button ── */}
      <div className={`livechat-fab-container ${open ? "livechat-fab-container--open" : ""}`}>
        {!open && (
          <button 
            className="livechat-hide-btn" 
            onClick={(e) => { e.stopPropagation(); setHidden(true); }}
            aria-label="Hide chat"
            title="Hide chat"
          >
            <X size={14} />
          </button>
        )}
        {!open && (
          <div className="livechat-tooltip" onClick={() => setOpen(true)}>
            {t('chat.tooltip', { defaultValue: 'Greetings! How can I help? 👋' })}
          </div>
        )}
        <button
          className={`livechat-fab ${open ? "livechat-fab--open" : ""}`}
          onClick={() => setOpen((o) => !o)}
          aria-label="Open live chat"
        >
          {open ? <X size={24} /> : <img src="/images/save-dental-profile.jpg" alt="Chat" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />}
          {!open && unread > 0 && (
            <span className="livechat-badge">{unread}</span>
          )}
        </button>
      </div>

      {/* ── Chat Window ── */}
      <div className={`livechat-window ${open ? "livechat-window--open" : ""}`}>
        {/* Header */}
        <div className="livechat-header">
          <div className="livechat-header-info">
            <div className="livechat-avatar">
              <img src="/images/save-dental-profile.jpg" alt="Save Dental Logo" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
            </div>
            <div>
              <p className="livechat-name">{t('chat.assistant', { defaultValue: 'Save Dental Assistant' })}</p>
              <p className="livechat-status">
                <span className="livechat-dot" /> {t('chat.status', { defaultValue: 'Online • Replies instantly' })}
              </p>
            </div>
          </div>
          <div className="livechat-header-actions">
            <a href={`tel:${PHONE_TEL}`} className="livechat-header-btn" title="Call us">
              <Phone size={16} />
            </a>
            <a href="/booking" className="livechat-header-btn" title="Book appointment">
              <Calendar size={16} />
            </a>
            <button className="livechat-header-btn" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="livechat-body">
          {messages.map((msg) => (
            <div key={msg.id} className={`livechat-msg-wrap livechat-msg-wrap--${msg.from}`}>
              {msg.from === "bot" && (
                <div className="livechat-msg-avatar">
                  <img src="/images/save-dental-profile.jpg" alt="Bot" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                </div>
              )}
              <div className="livechat-msg-col">
                <div className={`livechat-bubble livechat-bubble--${msg.from}`}>
                  {renderText((msg.textKey ? t(msg.textKey, msg.textParams) : (msg.text || "")) as string)}
                </div>
                <span className="livechat-time">{msg.time}</span>
                {msg.quickReplies && msg.from === "bot" && (
                  <div className="livechat-quick-replies">
                    {msg.quickReplies.map((qrKey) => (
                      <button
                        key={qrKey}
                        className="livechat-qr-btn"
                        onClick={() => handleQuickReply(qrKey as string)}
                      >
                        {t(`chat.qr.${qrKey}` as unknown as string)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {msg.from === "user" && (
                <div className="livechat-msg-avatar livechat-msg-avatar--user">
                  <User size={13} />
                </div>
              )}
            </div>
          ))}

          {typing && (
            <div className="livechat-msg-wrap livechat-msg-wrap--bot">
              <div className="livechat-msg-avatar">
                <img src="/images/save-dental-profile.jpg" alt="Bot" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
              </div>
              <div className="livechat-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="livechat-footer">
          <input
            ref={inputRef}
            className="livechat-input"
            placeholder={t('chat.placeholder', { defaultValue: 'Type your message…' })}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
          />
          <button
            className="livechat-send"
            onClick={handleSend}
            disabled={!input.trim()}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
