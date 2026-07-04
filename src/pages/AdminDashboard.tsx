import { API_BASE } from '../api';
import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Users, List, LogOut, MessageCircle, Check, X, Clock, Mail, LayoutDashboard, UserCog, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CalendarView } from "./admin/CalendarView";
import { PatientsView } from "./admin/PatientsView";
import { UsersView } from "./admin/UsersView";
import { ReviewsView } from "./admin/ReviewsView";
import { SiteSettingsView } from "./admin/SiteSettingsView";
import { whatsappLink } from "../data";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Booking {
  id: number;
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  notes: string;
  status: string;
  created_at: string;
}

export function AdminDashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role || "");
      } catch (e) {
        console.error("Failed to decode token", e);
      }
    }
  }, [token]);

  const { data: bookings = [], isLoading: loading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401 || response.status === 403) {
        onLogout();
        throw new Error('Unauthorized');
      }
      return response.json();
    }
  });

  const { data: patientCount = 0 } = useQuery({
    queryKey: ['patientCount'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        return data.length;
      }
      return 0;
    }
  });

  const { data: staffCount = 0 } = useQuery({
    queryKey: ['staffCount'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        return data.length;
      }
      return 0;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      await fetch(`${API_BASE}/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] })
  });

  function updateStatus(id: number, status: string) {
    updateStatusMutation.mutate({ id, status });
  }

  // Derived stats
  const today = new Date().toISOString().split("T")[0];
  const confirmed = bookings.filter((b: any) => b.status === "Confirmed").length;
  const pending = bookings.filter((b: any) => b.status === "Pending").length;
  const todayCount = bookings.filter((b: Booking) => b.date === today).length;

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    overview:  { title: t("admin.dashboard.titles.overview", { defaultValue: "Dashboard Overview" }), subtitle: t("admin.dashboard.titles.overview_sub", { defaultValue: "Today is {{date}}", date: new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) }) },
    calendar:  { title: t("admin.dashboard.titles.schedule", { defaultValue: "Clinic Schedule" }), subtitle: t("admin.dashboard.titles.schedule_sub", { defaultValue: "View and manage all appointments" }) },
    patients:  { title: t("admin.dashboard.titles.patients", { defaultValue: "Patient Directory" }), subtitle: t("admin.dashboard.titles.patients_sub", { defaultValue: "Browse and manage patient records" }) },
    list:      { title: t("admin.dashboard.titles.all_bookings", { defaultValue: "All Bookings" }), subtitle: t("admin.dashboard.titles.all_bookings_sub", { defaultValue: "Full booking history and status management" }) },
    reviews:   { title: t("admin.dashboard.titles.reviews", { defaultValue: "Reviews Management" }), subtitle: t("admin.dashboard.titles.reviews_sub", { defaultValue: "Approve or hide patient testimonials" }) },
    users:     { title: t("admin.dashboard.titles.staff", { defaultValue: "Staff Directory" }), subtitle: t("admin.dashboard.titles.staff_sub", { defaultValue: "Manage system access and roles" }) },
    settings:  { title: t("admin.dashboard.titles.settings", { defaultValue: "Site Settings" }), subtitle: t("admin.dashboard.titles.settings_sub", { defaultValue: "Update clinic info, hours, banners, and homepage content" }) },
  };

  const BASE_NAV_ITEMS = [
    { id: "overview", label: t("admin.dashboard.sidebar.overview", { defaultValue: "Overview" }), icon: LayoutDashboard },
    { id: "calendar", label: t("admin.dashboard.sidebar.schedule", { defaultValue: "Schedule" }), icon: CalendarIcon },
    { id: "patients", label: t("admin.dashboard.sidebar.patients", { defaultValue: "Patients" }), icon: Users },
    { id: "list", label: t("admin.dashboard.sidebar.all_bookings", { defaultValue: "All Bookings" }), icon: List },
    { id: "reviews", label: t("admin.dashboard.sidebar.reviews", { defaultValue: "Reviews" }), icon: MessageCircle },
    { id: "settings", label: t("admin.dashboard.sidebar.site_settings", { defaultValue: "Site Settings" }), icon: Settings },
  ];

  const navItems = [...BASE_NAV_ITEMS];
  if (userRole === "admin") {
    navItems.push({ id: "users", label: t("admin.dashboard.sidebar.staff_users", { defaultValue: "Staff Users" }), icon: UserCog });
  }

  const current = tabTitles[activeTab] || tabTitles.overview;

  return (
    <div className="admin-shell">
      {/* â”€â”€ Sidebar â”€â”€ */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <img src="/images/save-dental-profile.jpg" alt="Save Dental" />
          <div className="admin-sidebar-logo-text">
            <strong>Save Dental</strong>
            <small>{t("admin.dashboard.sidebar.panel_title", { defaultValue: "Admin Panel" })}</small>
          </div>
        </div>

        <div className="admin-sidebar-section">{t("admin.dashboard.sidebar.navigation", { defaultValue: "Navigation" })}</div>

        <nav className="admin-nav">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`admin-nav-btn${activeTab === id ? " active" : ""}`}
            >
              <span className="nav-icon"><Icon size={17} /></span>
              {label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={onLogout} className="admin-logout-btn">
            <LogOut size={17} /> {t("admin.dashboard.sidebar.sign_out", { defaultValue: "Sign Out" })}
          </button>
        </div>
      </aside>

      {/* â”€â”€ Main â”€â”€ */}
      <main className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar-title">
            <h1>{current.title}</h1>
            <p>{current.subtitle}</p>
          </div>
        </div>

        <div className="admin-content">
          {/* Stats row â€” always visible */}
          <div className="admin-stats-grid">
            <div className="stat-card stat-card-clickable" onClick={() => setActiveTab("list")}>
              <div className="stat-card-icon green"><List size={22} /></div>
              <div className="stat-card-body">
                <div className="stat-card-value">{bookings.length}</div>
                <div className="stat-card-label">{t("admin.dashboard.stats.total_bookings", { defaultValue: "Total Bookings" })}</div>
              </div>
            </div>
            <div className="stat-card stat-card-clickable" onClick={() => setActiveTab("list")}>
              <div className="stat-card-icon amber"><Clock size={22} /></div>
              <div className="stat-card-body">
                <div className="stat-card-value">{pending}</div>
                <div className="stat-card-label">{t("admin.dashboard.stats.pending", { defaultValue: "Pending" })}</div>
              </div>
            </div>
            <div className="stat-card stat-card-clickable" onClick={() => setActiveTab("calendar")}>
              <div className="stat-card-icon blue"><CalendarIcon size={22} /></div>
              <div className="stat-card-body">
                <div className="stat-card-value">{todayCount}</div>
                <div className="stat-card-label">{t("admin.dashboard.stats.today", { defaultValue: "Today" })}</div>
              </div>
            </div>
            <div className="stat-card stat-card-clickable" onClick={() => setActiveTab("patients")}>
              <div className="stat-card-icon purple"><Users size={22} /></div>
              <div className="stat-card-body">
                <div className="stat-card-value">{patientCount}</div>
                <div className="stat-card-label">{t("admin.dashboard.stats.patients", { defaultValue: "Patients" })}</div>
              </div>
            </div>
            {userRole === "admin" && (
              <div className="stat-card stat-card-clickable" onClick={() => setActiveTab("users")}>
                <div className="stat-card-icon teal"><UserCog size={22} /></div>
                <div className="stat-card-body">
                  <div className="stat-card-value">{staffCount}</div>
                  <div className="stat-card-label">{t("admin.dashboard.stats.staff_members", { defaultValue: "Staff Members" })}</div>
                </div>
              </div>
            )}
          </div>

          {/* Tab content */}
          {activeTab === "overview" && (
            <OverviewTab
              bookings={bookings}
              loading={loading}
              confirmed={confirmed}
              updateStatus={updateStatus}
            />
          )}
          {activeTab === "calendar" && <CalendarView token={token} />}
          {activeTab === "patients" && <PatientsView token={token} onPatientAdded={() => queryClient.invalidateQueries({ queryKey: ['patientCount'] })} />}
          {activeTab === "users" && userRole === "admin" && <UsersView token={token} onStaffAdded={() => queryClient.invalidateQueries({ queryKey: ['staffCount'] })} />}
          {activeTab === "reviews" && <ReviewsView token={token} />}
          {activeTab === "settings" && <SiteSettingsView token={token} />}
          {activeTab === "list" && (
            <BookingsTable token={token} bookings={bookings} loading={loading} updateStatus={updateStatus} />
          )}
        </div>
      </main>
    </div>
  );
}

/* â”€â”€ Overview Tab â”€â”€ */
function OverviewTab({
  bookings,
  loading,
  confirmed,
  updateStatus,
}: {
  bookings: Booking[];
  loading: boolean;
  confirmed: number;
  updateStatus: (id: number, status: string) => void;
}) {
  const { t } = useTranslation();
  const pending = bookings.filter((b) => b.status === "Pending");
  const upcoming = bookings
    .filter((b) => b.status === "Confirmed")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      {/* Pending approvals */}
      {pending.length > 0 && (
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2>{t("admin.dashboard.overview.pending_approvals", { defaultValue: "âš ï¸ Pending Approvals ({{count}})", count: pending.length })}</h2>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t("admin.dashboard.overview.patient", { defaultValue: "Patient" })}</th>
                  <th>{t("admin.dashboard.overview.service_time", { defaultValue: "Service & Time" })}</th>
                  <th>{t("admin.dashboard.overview.contact", { defaultValue: "Contact" })}</th>
                  <th>{t("admin.dashboard.overview.actions", { defaultValue: "Actions" })}</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((b) => (
                  <tr key={b.id}>
                    <td><strong>{b.name}</strong></td>
                    <td>
                      <div><strong>{b.service}</strong></div>
                      <div className="time-cell"><Clock size={12} /> {b.date} at {b.time}</div>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <a href={`mailto:${b.email}`}><Mail size={13} /> {b.email}</a>
                        <a href={whatsappLink(`Hi ${b.name}, this is Save Dental Clinic.`, b.phone.replace("+", ""))} target="_blank" rel="noreferrer">
                          <MessageCircle size={13} color="#25d366" /> {b.phone}
                        </a>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => updateStatus(b.id, "Confirmed")} className="action-btn confirm"><Check size={14} /> {t("admin.dashboard.overview.confirm", { defaultValue: "Confirm" })}</button>
                        <button onClick={() => updateStatus(b.id, "Cancelled")} className="action-btn cancel"><X size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upcoming confirmed */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2>{t("admin.dashboard.overview.upcoming_confirmed", { defaultValue: "Upcoming Confirmed ({{count}})", count: confirmed })}</h2>
        </div>
        {loading ? (
          <div className="admin-panel-body" style={{ color: "#6b7280" }}>{t("admin.dashboard.overview.loading", { defaultValue: "Loadingâ€¦" })}</div>
        ) : upcoming.length === 0 ? (
          <div className="admin-panel-body" style={{ color: "#6b7280" }}>{t("admin.dashboard.overview.no_upcoming", { defaultValue: "No upcoming confirmed appointments." })}</div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t("admin.dashboard.overview.patient", { defaultValue: "Patient" })}</th>
                  <th>{t("admin.dashboard.overview.service", { defaultValue: "Service" })}</th>
                  <th>{t("admin.dashboard.overview.date_time", { defaultValue: "Date & Time" })}</th>
                  <th>{t("admin.dashboard.overview.status", { defaultValue: "Status" })}</th>
                  <th>{t("admin.dashboard.overview.actions", { defaultValue: "Actions" })}</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((b) => (
                  <tr key={b.id}>
                    <td><strong>{b.name}</strong></td>
                    <td>{b.service}</td>
                    <td><div className="time-cell"><Clock size={12} /> {b.date} at {b.time}</div></td>
                    <td><span className={`status-badge status-${b.status.toLowerCase()}`}>{b.status}</span></td>
                    <td>
                      <button onClick={() => updateStatus(b.id, "Completed")} className="action-btn complete">{t("admin.dashboard.overview.mark_completed", { defaultValue: "Mark Completed" })}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* â”€â”€ All Bookings Table â”€â”€ */
function BookingsTable({
  token,
  bookings,
  loading,
  updateStatus,
}: {
  token: string;
  bookings: Booking[];
  loading: boolean;
  updateStatus: (id: number, status: string) => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`${API_BASE}/api/bookings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] })
  });

  const filtered = bookings.filter(b => {
    if (filter !== "All" && b.status !== filter) return false;
    if (search && !b.name.toLowerCase().includes(search.toLowerCase()) && !b.email.toLowerCase().includes(search.toLowerCase()) && !b.phone.includes(search)) return false;
    return true;
  });

  const exportCSV = () => {
    const header = "ID,Name,Email,Phone,Service,Date,Time,Status,Notes\n";
    const csv = filtered.map(b => `${b.id},"${b.name}","${b.email}","${b.phone}","${b.service}","${b.date}","${b.time}","${b.status}","${(b.notes || '').replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([header + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="admin-panel">
      <div className="admin-panel-header" style={{ flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2>{t("admin.dashboard.all_bookings.title", { defaultValue: "All Bookings" })}</h2>
          <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>{filtered.length} total</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Search name, email, phone..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
          />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button className="btn primary" style={{ padding: '8px 16px' }} onClick={exportCSV}>Export CSV</button>
        </div>
      </div>
      {loading ? (
        <div className="admin-panel-body" style={{ color: "#6b7280" }}>{t("admin.dashboard.all_bookings.loading", { defaultValue: "Loading appointments..." })}</div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin.dashboard.all_bookings.patient", { defaultValue: "Patient" })}</th>
                <th>{t("admin.dashboard.all_bookings.contact", { defaultValue: "Contact" })}</th>
                <th>{t("admin.dashboard.all_bookings.service_time", { defaultValue: "Service & Time" })}</th>
                <th>{t("admin.dashboard.all_bookings.booked_on", { defaultValue: "Booked On" })}</th>
                <th>{t("admin.dashboard.all_bookings.notes", { defaultValue: "Notes" })}</th>
                <th>{t("admin.dashboard.all_bookings.status", { defaultValue: "Status" })}</th>
                <th>{t("admin.dashboard.all_bookings.actions", { defaultValue: "Actions" })}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td><strong>{b.name}</strong></td>
                  <td>
                    <div className="contact-cell">
                      <a href={`mailto:${b.email}`}><Mail size={13} /> {b.email}</a>
                      <a href={whatsappLink(`Hi ${b.name}, this is Save Dental Clinic.`, b.phone.replace("+", ""))} target="_blank" rel="noreferrer">
                        <MessageCircle size={13} color="#25d366" /> {b.phone}
                      </a>
                    </div>
                  </td>
                  <td>
                    <div><strong>{b.service}</strong></div>
                    <div className="time-cell"><Clock size={12} /> {b.date} at {b.time}</div>
                  </td>
                  <td style={{ fontSize: "0.82rem", color: "#6b7280", whiteSpace: "nowrap" }}>
                    {b.created_at
                      ? new Date(b.created_at).toLocaleString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit"
                        })
                      : "—"}
                  </td>
                  <td className="notes-cell">{b.notes || "—"}</td>
                  <td><span className={`status-badge status-${b.status.toLowerCase()}`}>{b.status}</span></td>
                  <td>
                    {b.status === "Pending" && (
                      <div className="action-buttons">
                        <button onClick={() => updateStatus(b.id, "Confirmed")} className="action-btn confirm"><Check size={14} /> {t("admin.dashboard.all_bookings.confirm", { defaultValue: "Confirm" })}</button>
                        <button onClick={() => updateStatus(b.id, "Cancelled")} className="action-btn cancel"><X size={14} /></button>
                      </div>
                    )}
                    {b.status === "Confirmed" && (
                      <button onClick={() => updateStatus(b.id, "Completed")} className="action-btn complete">{t("admin.dashboard.all_bookings.mark_completed", { defaultValue: "Mark Completed" })}</button>
                    )}
                    <button onClick={() => { if(window.confirm('Delete this booking?')) deleteMutation.mutate(b.id); }} className="action-btn cancel" style={{ marginLeft: '4px' }} title="Delete"><X size={14} /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="empty-state">{t("admin.dashboard.all_bookings.no_appointments", { defaultValue: "No appointments found." })}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
