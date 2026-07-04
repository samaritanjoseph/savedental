import { API_BASE } from '../../api';
import { useState, useEffect } from 'react';
import { DentalChart } from '../../components/DentalChart';
import { ArrowLeft, Clock, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob: string;
  allergies?: string;
  medications?: string;
  medical_conditions?: string;
  created_at?: string;
}

interface Appointment {
  id: number;
  service: string;
  date: string;
  time: string;
  status: string;
  notes?: string;
}

function MedicalTag({ value, type }: { value?: string; type: 'allergy' | 'med' | 'condition' }) {
  const { t } = useTranslation();
  if (!value) return <span className="medical-tag none">{t("admin.dashboard.profile.none_reported", { defaultValue: "None reported" })}</span>;
  return (
    <>
      {value.split(',').map((v, i) => (
        <span key={i} className={`medical-tag ${type}`}>{v.trim()}</span>
      ))}
    </>
  );
}

export function PatientProfile({
  patientId,
  token,
  onBack,
}: {
  patientId: string | number;
  token: string;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    fetchPatient();
    fetchAppointments();
  }, [patientId]);

  async function fetchPatient() {
    try {
      const res = await fetch(`${API_BASE}/api/patients/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setPatient(await res.json());
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchAppointments() {
    try {
      // Fetch all bookings and filter client-side by patient name/email
      // (the server doesn't have a patient_id filter on bookings yet)
      const res = await fetch(`${API_BASE}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const all: Appointment[] = await res.json();
        // We'll set them all and filter after patient loads
        setAppointments(all);
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (!patient) {
    return (
      <div style={{ color: '#6b7280', padding: 40, textAlign: 'center' }}>
        {t("admin.dashboard.profile.loading", { defaultValue: "Loading patient profileâ€¦" })}
      </div>
    );
  }

  const initials = `${patient.first_name[0] ?? ''}${patient.last_name[0] ?? ''}`.toUpperCase();
  const fullName = `${patient.first_name} ${patient.last_name}`;

  // Filter appointments that match this patient by name (best-effort without FK)
  const patientAppts = appointments.filter(
    (a: any) =>
      a.name?.toLowerCase() === fullName.toLowerCase() ||
      (patient.email && a.email?.toLowerCase() === patient.email.toLowerCase())
  );

  return (
    <div>
      <button onClick={onBack} className="btn ghost" style={{ marginBottom: 24 }}>
        <ArrowLeft size={16} /> {t("admin.dashboard.profile.back", { defaultValue: "Back to Patients" })}
      </button>

      <div className="patient-profile-layout">
        {/* â”€â”€ Left sidebar card â”€â”€ */}
        <div className="patient-sidebar-card">
          <div className="patient-sidebar-hero">
            <div
              className="patient-big-avatar"
              style={{ background: `rgba(255,255,255,0.25)` }}
            >
              {initials}
            </div>
            <h2>{fullName}</h2>
            <p>{patient.email || t("admin.dashboard.profile.no_email", { defaultValue: "No email on file" })}</p>
          </div>

          <div className="patient-info-list">
            <div className="patient-info-row">
              <span className="patient-info-label">{t("admin.dashboard.profile.phone", { defaultValue: "Phone" })}</span>
              <span className="patient-info-value">{patient.phone || 'â€”'}</span>
            </div>
            <div className="patient-info-row">
              <span className="patient-info-label">{t("admin.dashboard.profile.dob", { defaultValue: "Date of Birth" })}</span>
              <span className="patient-info-value">{patient.dob || 'â€”'}</span>
            </div>
            {patient.created_at && (
              <div className="patient-info-row">
                <span className="patient-info-label">{t("admin.dashboard.profile.patient_since", { defaultValue: "Patient Since" })}</span>
                <span className="patient-info-value">
                  {new Date(patient.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            )}

            <div className="patient-info-row">
              <span className="patient-info-label">{t("admin.dashboard.profile.allergies", { defaultValue: "Allergies" })}</span>
              <div style={{ marginTop: 4 }}>
                <MedicalTag value={patient.allergies} type="allergy" />
              </div>
            </div>

            <div className="patient-info-row">
              <span className="patient-info-label">{t("admin.dashboard.profile.medications", { defaultValue: "Medications" })}</span>
              <div style={{ marginTop: 4 }}>
                <MedicalTag value={patient.medications} type="med" />
              </div>
            </div>

            <div className="patient-info-row">
              <span className="patient-info-label">{t("admin.dashboard.profile.conditions", { defaultValue: "Conditions" })}</span>
              <div style={{ marginTop: 4 }}>
                <MedicalTag value={patient.medical_conditions} type="condition" />
              </div>
            </div>
          </div>
        </div>

        {/* â”€â”€ Right column â”€â”€ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Dental chart */}
          <DentalChart patientId={patientId} token={token} />

          {/* Appointment history */}
          <div className="admin-panel">
            <div className="admin-panel-header">
              <h2>{t("admin.dashboard.profile.appointment_history", { defaultValue: "Appointment History" })}</h2>
              <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>{t("admin.dashboard.profile.found", { defaultValue: "{{count}} found", count: patientAppts.length })}</span>
            </div>
            {patientAppts.length === 0 ? (
              <div className="admin-panel-body" style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                {t("admin.dashboard.profile.no_appointments", { defaultValue: "No appointments linked to this patient yet." })}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{t("admin.dashboard.overview.service", { defaultValue: "Service" })}</th>
                      <th>{t("admin.dashboard.overview.date_time", { defaultValue: "Date & Time" })}</th>
                      <th>{t("admin.dashboard.overview.status", { defaultValue: "Status" })}</th>
                      <th>{t("admin.dashboard.all_bookings.notes", { defaultValue: "Notes" })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientAppts
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((appt) => (
                        <tr key={appt.id}>
                          <td><strong>{appt.service}</strong></td>
                          <td>
                            <div className="time-cell">
                              <Clock size={12} /> {appt.date} {t("admin.dashboard.calendar.at", { defaultValue: "at" })} {appt.time}
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge status-${appt.status.toLowerCase()}`}>
                              {t(`admin.dashboard.status.${appt.status.toLowerCase()}`, { defaultValue: appt.status })}
                            </span>
                          </td>
                          <td className="notes-cell">
                            {appt.notes ? (
                              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <FileText size={13} style={{ color: '#9ca3af', flexShrink: 0 }} />
                                {appt.notes}
                              </div>
                            ) : 'â€”'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
