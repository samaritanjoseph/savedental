import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MapPin, Phone } from "lucide-react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PHONE_TEL, MAPS_URL } from "./data";

const queryClient = new QueryClient();

import "./styles.css";
import "./i18n";
import "./components/LiveChat.css";

import { ThemeProvider } from "./context/ThemeContext";
import { ScrollToTop } from "./components/ScrollToTop";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { LiveChat } from "./components/LiveChat";

import { Home } from "./pages/Home";
import { Services } from "./pages/Services";
import { About } from "./pages/About";
import { Experience } from "./pages/Experience";
import { Booking } from "./pages/Booking";
import { FAQ } from "./pages/FAQ";
import { Contact } from "./pages/Contact";
import { Gallery } from "./pages/Gallery";
import { Login } from "./pages/Login";
import { AdminDashboard } from "./pages/AdminDashboard";

function App() {
  const [token, setToken] = React.useState<string | null>(localStorage.getItem("adminToken"));

  const handleLogin = (newToken: string) => {
    localStorage.setItem("adminToken", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* ── Standalone admin / login routes (no site header/footer) ── */}
        <Route
          path="/login"
          element={token ? <Navigate to="/admin" /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/admin"
          element={token ? <AdminDashboard token={token} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />

        {/* ── Public site routes (with header / footer / floating buttons) ── */}
        <Route
          path="*"
          element={
            <>
              <Header />
              <main id="top">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/experience" element={<Experience />} />
                  <Route path="/booking" element={<Booking />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/gallery" element={<Gallery />} />
                </Routes>
              </main>

              {/* Live Chat Widget – replaces floating WhatsApp */}
              <LiveChat />

              <div className="mobile-action-bar" aria-label="Quick mobile actions">
                <a href={`tel:${PHONE_TEL}`}>
                  <Phone size={18} /> Call
                </a>
                <a href="/booking">
                  <MapPin size={18} /> Book Now
                </a>
                <a href={MAPS_URL} target="_blank" rel="noreferrer">
                  <MapPin size={18} /> Directions
                </a>
              </div>

              <Footer />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </QueryClientProvider>
);
