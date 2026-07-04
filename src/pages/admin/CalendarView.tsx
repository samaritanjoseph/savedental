import { API_BASE } from '../../api';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { X, Clock, FileText, Mail, MessageCircle, Check } from 'lucide-react';
import { whatsappLink } from '../../data';
import { useTranslation } from 'react-i18next';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

interface BookingResource {
  id: number;
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  notes: string;
  status: string;
}

interface CalEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: BookingResource;
}

interface PopupState {
  event: CalEvent;
  x: number;
  y: number;
}

const STATUS_COLORS: Record<string, string> = {
  Pending:   '#f59e0b',
  Confirmed: '#07863f',
  Completed: '#64748b',
  Cancelled: '#ef4444',
};

export function CalendarView({ token }: { token: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [popup, setPopup] = useState<PopupState | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopup(null);
      }
    }
    if (popup) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [popup]);

  const { data: events = [] } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      return data.map((b: BookingResource) => {
        const start = new Date(`${b.date}T${b.time}`);
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        return { id: b.id, title: `${b.name} â€” ${b.service}`, start, end, resource: b };
      });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const response = await fetch(`${API_BASE}/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Update failed');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      // Update the local popup state so the UI updates instantly
      setPopup((prev) =>
        prev && prev.event.id === variables.id
          ? { ...prev, event: { ...prev.event, resource: { ...prev.event.resource, status: variables.status } } }
          : prev
      );
    }
  });

  async function updateStatus(id: number, status: string) {
    updateStatusMutation.mutate({ id, status });
  }

  const handleSelectEvent = useCallback((event: CalEvent, e: React.SyntheticEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let x = rect.right + 8;
    let y = rect.top;

    // Flip if too close to right edge
    if (x + 380 > viewportW) x = rect.left - 388;
    // Clamp vertical
    if (y + 320 > viewportH) y = viewportH - 330;
    if (y < 10) y = 10;

    setPopup({ event, x, y });
  }, []);

  const eventStyleGetter = (event: CalEvent) => ({
    style: {
      backgroundColor: STATUS_COLORS[event.resource.status] || '#07863f',
      borderRadius: '6px',
      border: 'none',
      padding: '3px 8px',
      fontSize: '0.77rem',
      fontWeight: 600,
    },
  });

  const b = popup?.event.resource;

  const todayDateStr = new Date().toISOString().split("T")[0];
  const todayEvents = events.filter((e: CalEvent) => e.resource.date === todayDateStr).sort((a: CalEvent, b: CalEvent) => a.start.getTime() - b.start.getTime());

  return (
    <div style={{ position: 'relative', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      <div
        className="admin-panel"
        style={{ flex: 3, height: '72vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="admin-panel-header">
          <h2>{t("admin.dashboard.titles.schedule", { defaultValue: "Clinic Schedule" })}</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            {Object.entries(STATUS_COLORS).map(([s, c]) => (
              <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#6b7280' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }} />
                {t(`admin.dashboard.status.${s.toLowerCase()}`, { defaultValue: s })}
              </span>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, padding: '20px 28px 24px', minHeight: 0 }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            views={['month', 'week', 'day', 'agenda']}
            defaultView="week"
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleSelectEvent}
            popup
          />
        </div>
      </div>

      <div className="admin-panel" style={{ flex: 1, minWidth: '300px', height: '72vh', display: 'flex', flexDirection: 'column' }}>
        <div className="admin-panel-header">
          <h2>Today's Appointments</h2>
          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{todayEvents.length} total</span>
        </div>
        <div style={{ padding: '0', overflowY: 'auto', flex: 1 }}>
          {todayEvents.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>No appointments today.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {todayEvents.map((e: CalEvent) => (
                <div key={e.id} style={{ padding: '16px', borderBottom: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong>{e.resource.name}</strong>
                    <span className={`status-badge status-${e.resource.status.toLowerCase()}`}>{e.resource.status}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--ink)' }}>{e.resource.service}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {e.resource.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* â”€â”€ Event detail popup â”€â”€ */}
      {popup && b && (
        <div
          ref={popupRef}
          className="cal-event-popup"
          style={{ top: popup.y, left: popup.x }}
        >
          <div className="cal-popup-header">
            <div>
              <h4>{b.name}</h4>
              <div className="cal-popup-service">{b.service}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={`status-badge status-${b.status.toLowerCase()}`}>{t(`admin.dashboard.status.${b.status.toLowerCase()}`, { defaultValue: b.status })}</span>
              <button className="modal-close" onClick={() => setPopup(null)}><X size={14} /></button>
            </div>
          </div>

          <div className="cal-popup-body">
            <div className="cal-popup-row">
              <Clock size={15} />
              <span>{b.date} {t("admin.dashboard.calendar.at", { defaultValue: "at" })} {b.time}</span>
            </div>
            <div className="cal-popup-row">
              <Mail size={15} />
              <a href={`mailto:${b.email}`} style={{ color: '#374151', textDecoration: 'underline' }}>{b.email}</a>
            </div>
            <div className="cal-popup-row">
              <MessageCircle size={15} />
              <a
                href={whatsappLink(`Hi ${b.name}, this is Save Dental Clinic.`, b.phone.replace('+', ''))}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#25d366', textDecoration: 'underline' }}
              >
                {b.phone}
              </a>
            </div>
            {b.notes && (
              <div className="cal-popup-row" style={{ alignItems: 'flex-start' }}>
                <FileText size={15} style={{ marginTop: 2 }} />
                <span style={{ color: '#6b7280', fontSize: '0.83rem' }}>{b.notes}</span>
              </div>
            )}
          </div>

          <div className="cal-popup-actions">
            {b.status === 'Pending' && (
              <>
                <button
                  className="action-btn confirm"
                  onClick={() => updateStatus(b.id, 'Confirmed')}
                >
                  <Check size={14} /> {t("admin.dashboard.overview.confirm", { defaultValue: "Confirm" })}
                </button>
                <button
                  className="action-btn cancel"
                  onClick={() => updateStatus(b.id, 'Cancelled')}
                  title={t("admin.dashboard.calendar.cancel", { defaultValue: "Cancel" })}
                >
                  <X size={14} />
                </button>
              </>
            )}
            {b.status === 'Confirmed' && (
              <button
                className="action-btn complete"
                onClick={() => updateStatus(b.id, 'Completed')}
              >
                {t("admin.dashboard.overview.mark_completed", { defaultValue: "Mark Completed" })}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
