import { API_BASE } from '../api';
import React, { useState } from "react";
import { Lock, Mail, ArrowRight, ArrowLeft, Key } from "lucide-react";

export function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        onLogin(data.token);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setSuccess("A temporary password has been sent to your email.");
        setTimeout(() => setMode("login"), 4000);
      } else {
        setError(data.error || "Failed to reset password.");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login-page section-pad" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at top left, rgba(7, 134, 63, 0.1), transparent 400px)' }}>
      <div className="container" style={{ maxWidth: '440px', width: '100%' }}>
        
        <div style={{ background: '#fff', borderRadius: '24px', padding: '40px 32px', boxShadow: '0 24px 60px rgba(0, 95, 45, 0.08)', border: '1px solid var(--line)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 16px' }}>
              <img src="/images/save-dental-profile.jpg" alt="Save Dental Clinic" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)', boxShadow: '0 12px 28px rgba(7, 134, 63, 0.25)' }} />
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: '26px', height: '26px', background: 'var(--primary)', borderRadius: '50%', border: '2px solid #fff', display: 'grid', placeItems: 'center', color: '#fff' }}>
                {mode === "login" ? <Lock size={13} /> : <Key size={13} />}
              </div>
            </div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '4px', letterSpacing: '-0.03em' }}>
              {mode === "login" ? "Welcome Back" : "Reset Password"}
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>
              {mode === "login" ? "Save Dental Clinic — Staff Portal" : "Enter your email to receive a temporary password."}
            </p>
          </div>

          {error && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '20px', border: '1px solid #fca5a5' }}>{error}</div>}
          {success && <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '20px', border: '1px solid #86efac' }}>{success}</div>}

          {mode === "login" ? (
            <form onSubmit={handleLogin} style={{ display: 'grid', gap: '20px' }}>
              <label style={{ display: 'grid', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                Email Address
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '12px', border: '1px solid var(--line)', outline: 'none', background: '#f9fafb', transition: 'border-color 0.2s' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--line)'}
                  />
                </div>
              </label>
              <label style={{ display: 'grid', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Password
                  <button type="button" onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Forgot?</button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '12px', border: '1px solid var(--line)', outline: 'none', background: '#f9fafb', transition: 'border-color 0.2s' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--line)'}
                  />
                </div>
              </label>
              <button type="submit" disabled={loading} style={{ background: 'var(--primary)', color: '#fff', padding: '14px', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, marginTop: '8px', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 8px 20px rgba(7, 134, 63, 0.25)' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                {loading ? "Signing in..." : <>Sign In <ArrowRight size={18} /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgot} style={{ display: 'grid', gap: '20px' }}>
              <label style={{ display: 'grid', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                Email Address
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '12px', border: '1px solid var(--line)', outline: 'none', background: '#f9fafb', transition: 'border-color 0.2s' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--line)'}
                  />
                </div>
              </label>
              <button type="submit" disabled={loading} style={{ background: 'var(--primary)', color: '#fff', padding: '14px', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, marginTop: '8px', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 8px 20px rgba(7, 134, 63, 0.25)' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                {loading ? "Sending..." : "Send Temporary Password"}
              </button>
              <button type="button" onClick={() => { setMode("login"); setError(""); setSuccess(""); }} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
                <ArrowLeft size={16} /> Back to Sign In
              </button>
            </form>
          )}

        </div>
      </div>
    </main>
  );
}
