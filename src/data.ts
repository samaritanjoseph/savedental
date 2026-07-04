import {
  BadgeAlert,
  BadgeCheck,
  Brush,
  CheckCircle2,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Stethoscope,
} from "lucide-react";

export const PHONE_DISPLAY = "+234 815 228 7675";
export const PHONE_TEL = "+2348152287675";
export const SECONDARY_PHONE_DISPLAY = "+234 702 598 9518";
export const SECONDARY_PHONE_TEL = "+2347025989518";
export const WHATSAPP_NUMBER = "2348152287675";
export const EMAIL = "savedentalinitiative@gmail.com";
export const ADDRESS =
  "Dikat House, First Floor, Complex, A1 No. 60 Ring Road, Ibadan";
export const INSTAGRAM_URL = "https://www.instagram.com/save_dental/";
export const MAP_QUERY = "Save Dental Clinic Dikat House No 60 Ring Road Ibadan";
export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_QUERY)}`;
export const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&output=embed`;

export function whatsappLink(message: string, phone: string = WHATSAPP_NUMBER) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function formatMinutes(minutes: number) {
  if (minutes === 12 * 60) return "12noon";
  const hour24 = Math.floor(minutes / 60);
  const minute = String(minutes % 60).padStart(2, "0");
  const suffix = hour24 >= 12 ? "pm" : "am";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minute}${suffix}`;
}

export function getOpenStatus(now = new Date()) {
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const schedule: Record<number, { open: number; close: number; label: string; next: string }> = {
    0: {
      open: 12 * 60,
      close: 16 * 60,
      label: "Sunday",
      next: "Monday 8:00am",
    },
    1: {
      open: 8 * 60,
      close: 18 * 60,
      label: "Monday",
      next: "Tuesday 8:00am",
    },
    2: {
      open: 8 * 60,
      close: 18 * 60,
      label: "Tuesday",
      next: "Wednesday 8:00am",
    },
    3: {
      open: 8 * 60,
      close: 18 * 60,
      label: "Wednesday",
      next: "Thursday 8:00am",
    },
    4: {
      open: 8 * 60,
      close: 18 * 60,
      label: "Thursday",
      next: "Friday 8:00am",
    },
    5: {
      open: 8 * 60,
      close: 18 * 60,
      label: "Friday",
      next: "Saturday 9:00am",
    },
    6: {
      open: 9 * 60,
      close: 17 * 60,
      label: "Saturday",
      next: "Sunday 12noon",
    },
  };
  const today = schedule[day];

  if (minutes >= today.open && minutes < today.close) {
    return {
      open: true,
      label: "Open now",
      detail: `Closes ${formatMinutes(today.close)}`,
    };
  }

  return {
    open: false,
    label: "Closed now",
    detail:
      minutes < today.open
        ? `Opens today ${formatMinutes(today.open)}`
        : `Opens ${today.next}`,
  };
}

export const services = [
  {
    id: "teeth_cleaning",
    title: "Teeth Cleaning",
    description:
      "Professional cleaning to remove stains, plaque, and tartar for fresher confidence.",
    icon: Sparkles,
    colorTheme: "theme-blue",
  },
  {
    id: "tooth_fillings",
    title: "Tooth Fillings",
    description:
      "Comfort-focused restorations that repair cavities and protect natural tooth structure.",
    icon: Smile,
    colorTheme: "theme-green",
  },
  {
    id: "root_canal",
    title: "Root Canal Therapy",
    description:
      "Targeted treatment designed to relieve pain and preserve natural teeth when possible.",
    icon: ShieldCheck,
    colorTheme: "theme-purple",
  },
  {
    id: "teeth_whitening",
    title: "Teeth Whitening",
    description:
      "Smile-brightening treatment for patients who want a cleaner, more confident look.",
    icon: Star,
    colorTheme: "theme-yellow",
  },
  {
    id: "dental_implantology",
    title: "Dental Implantology",
    description:
      "Modern tooth replacement options to restore confidence, function, and appearance.",
    icon: Stethoscope,
    colorTheme: "theme-red",
  },
  {
    id: "dental_xrays",
    title: "Dental X-rays",
    description:
      "Diagnostic imaging that helps the dental team plan safer, clearer treatment.",
    icon: CheckCircle2,
    colorTheme: "theme-cyan",
  },
  {
    id: "braces",
    title: "Orthodontic & Invisible Braces",
    description:
      "Braces and alignment options including educational content on self-ligating braces.",
    icon: CheckCircle2,
    colorTheme: "theme-orange",
  },
  {
    id: "veneers",
    title: "Veneers, Crowns & Bridges",
    description:
      "Cosmetic and restorative options for stronger, better-looking smiles.",
    icon: Sparkles,
    colorTheme: "theme-pink",
  },
  {
    id: "general",
    title: "General Dental Treatment",
    description:
      "Everyday dental care for patients who need consultation, prevention, or treatment.",
    icon: Stethoscope,
    colorTheme: "theme-teal",
  },
];

export const highlights = [
  { id: "h1", text: "Ultra modern dental clinic" },
  { id: "h2", text: "Warm, anxiety-friendly care" },
  { id: "h3", text: "Family dental services" },
  { id: "h4", text: "No. 60 Ring Road, Ibadan" },
];

export const processSteps = [
  { id: "step1", text: "Book your appointment by phone, WhatsApp, or Instagram." },
  { id: "step2", text: "Get a careful consultation and treatment plan." },
  { id: "step3", text: "Receive comfortable care from the dental team." },
  { id: "step4", text: "Leave with after-care guidance for lasting results." },
];

export const openingHours = [
  {
    id: "weekdays",
    days: "Mondays - Fridays",
    time: "8:00am - 6:00pm",
  },
  {
    id: "saturday",
    days: "Saturday",
    time: "9:00am - 5:00pm",
  },
  {
    id: "sunday",
    days: "Sundays",
    time: "12noon - 4:00pm",
  },
];

export const safetyItems = [
  {
    id: "setup",
    title: "Protected treatment setup",
    text: "Clinical photos show the team using masks, gloves, caps, and protective barriers during patient care.",
    icon: ShieldCheck,
  },
  {
    id: "environment",
    title: "Clean treatment environment",
    text: "The website highlights real chair-side images so patients know what to expect before visiting.",
    icon: Sparkles,
  },
  {
    id: "guidance",
    title: "Clear after-care guidance",
    text: "Patients are encouraged to ask questions and leave with practical instructions after treatment.",
    icon: BadgeCheck,
  },
];

export const carePromises = [
  {
    id: "calm",
    title: "Calm first visit",
    text: "A welcoming experience that helps new patients feel safe before treatment begins.",
  },
  {
    id: "explanation",
    title: "Clear explanation",
    text: "Simple treatment guidance, expected outcomes, and after-care instructions.",
  },
  {
    id: "modern",
    title: "Modern confidence",
    text: "A brand feel that matches an ultra modern dental clinic and social-first audience.",
  },
];

export const dentalTips = [
  {
    id: "brush",
    title: "Brush twice daily",
    text: "Use a soft toothbrush and fluoride toothpaste for two minutes, especially before bedtime.",
    icon: Brush,
  },
  {
    id: "pain",
    title: "Treat pain early",
    text: "Do not wait until tooth pain becomes severe. Early care can make treatment simpler.",
    icon: BadgeAlert,
  },
  {
    id: "cleaning",
    title: "Plan routine cleaning",
    text: "Professional scaling and polishing helps remove stains and tartar that brushing cannot reach.",
    icon: Sparkles,
  },
];

export const galleryItems = [
  {
    id: "treatment",
    title: "Treatment in progress",
    image: "/images/savedental/clinic-photo-1.jpg",
  },
  {
    id: "flyer1",
    title: "Save Dental services flyer",
    image: "/images/savedental/clinic-photo-3.jpg",
  },
  {
    id: "chair",
    title: "Dental chair and treatment room",
    image: "/images/savedental/clinic-photo-5.jpg",
  },
  {
    id: "hours",
    title: "Opening days and time",
    image: "/images/savedental/clinic-photo-6.jpg",
  },
  {
    id: "campaign",
    title: "D-Day campaign flyer",
    image: "/images/savedental/clinic-photo-2.jpg",
  },
  {
    id: "patient_care",
    title: "Patient care session",
    image: "/images/savedental/clinic-photo-4.jpg",
  },
];

export const visitChecklist = [
  { id: "call", text: "Call or send WhatsApp to confirm availability." },
  { id: "symptoms", text: "Describe your symptoms or the service you need." },
  { id: "records", text: "Bring previous dental records or X-rays if available." },
  { id: "aftercare", text: "Ask about after-care steps before leaving the clinic." },
];

export const faqs = [
  {
    id: "location",
    question: "Where is Save Dental Clinic located?",
    answer:
      "The approved clinic flyer lists Save Dental Clinic at Dikat House, First Floor, Complex, A1 No. 60 Ring Road, Ibadan, Oyo State.",
  },
  {
    id: "booking",
    question: "How can patients book an appointment?",
    answer:
      "Patients can call +234 815 228 7675, call +234 702 598 9518, use WhatsApp from this website, or message the Instagram account @save_dental.",
  },
  {
    id: "services",
    question: "What dental services are available?",
    answer:
      "The approved service flyer promotes teeth cleaning, tooth fillings, root canal therapy, teeth whitening, dental implantology, dental X-rays, orthodontic and invisible braces, veneers, crowns, bridges, and general dental treatment.",
  },
  {
    id: "hours",
    question: "What are the opening hours?",
    answer:
      "The approved opening-hours flyer lists Mondays to Fridays 8:00am - 6:00pm, Saturday 9:00am - 5:00pm, and Sundays 12noon - 4:00pm.",
  },
  {
    id: "whatsapp",
    question: "Can I book teeth cleaning through WhatsApp?",
    answer:
      "Yes. Use the service-specific booking buttons or the appointment form to open WhatsApp with a ready-made booking message.",
  },
  {
    id: "emergencies",
    question: "Do they handle tooth pain or dental emergencies?",
    answer:
      "The website includes an urgent-help WhatsApp action for tooth pain, swelling, broken tooth, or emergency dental care. Patients should contact the clinic quickly for guidance.",
  },
  {
    id: "braces",
    question: "Do they offer braces?",
    answer:
      "Yes. The approved flyer lists orthodontic and invisible braces, and their Instagram also includes educational content about self-ligating braces.",
  },
  {
    id: "xrays",
    question: "Do they offer dental X-rays?",
    answer:
      "Yes. Dental X-rays are included on the approved Save Dental services flyer.",
  },
  {
    id: "sundays",
    question: "Is the clinic open on Sundays?",
    answer:
      "Yes. The approved opening-hours flyer lists Sundays from 12noon to 4:00pm.",
  },
];
