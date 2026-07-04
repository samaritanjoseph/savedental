import { API_BASE } from '../../api';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PatientProfile } from './PatientProfile';
import { X, Search, UserPlus } from 'lucide-react';
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
}

const AVATAR_COLORS = [
  '#07863f', '#3b82f6', '#7c3aed', '#f59e0b',
  '#ec4899', '#0891b2', '#059669', '#dc2626',
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

interface NewPatientForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob: string;
  allergies: string;
  medications: string;
  medical_conditions: string;
}

const EMPTY_FORM: NewPatientForm = {
  first_name: '', last_name: '', email: '', phone: '', dob: '',
  allergies: '', medications: '', medical_conditions: '',
};

export function PatientsView({ token, onPatientAdded }: { token: string; onPatientAdded?: () => void }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewPatientForm>(EMPTY_FORM);
  const [error, setError] = useState('');

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch patients');
      return response.json();
    }
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return [];
      return response.json();
    }
  });

  const [editingPatientId, setEditingPatientId] = useState<number | null>(null);

  const addPatientMutation = useMutation({
    mutationFn: async (formData: NewPatientForm) => {
      const url = editingPatientId ? `${API_BASE}/api/patients/${editingPatientId}` : `${API_BASE}/api/patients`;
      const method = editingPatientId ? 'PATCH' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save patient.');
      }
      return response.json();
    },
    onSuccess: () => {
      setShowModal(false);
      setEditingPatientId(null);
      setForm(EMPTY_FORM);
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      if (onPatientAdded && !editingPatientId) onPatientAdded();
    },
    onError: (err: any) => {
      setError(err.message || 'Network error. Please try again.');
    }
  });

  const deletePatientMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`${API_BASE}/api/patients/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] })
  });

  async function handleAddPatient(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    addPatientMutation.mutate(form);
  }

  function openEditModal(p: Patient) {
    setForm({
      first_name: p.first_name,
      last_name: p.last_name,
      email: p.email || '',
      phone: p.phone || '',
      dob: p.dob || '',
      allergies: p.allergies || '',
      medications: p.medications || '',
      medical_conditions: p.medical_conditions || ''
    });
    setEditingPatientId(p.id);
    setShowModal(true);
  }

  function handleChange(field: keyof NewPatientForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (selectedPatientId) {
    return (
      <PatientProfile
        patientId={selectedPatientId}
        token={token}
        onBack={() => setSelectedPatientId(null)}
      />
    );
  }

  const filtered = patients.filter((p: Patient) => {
    const q = search.toLowerCase();
    return (
      p.first_name.toLowerCase().includes(q) ||
      p.last_name.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.includes(q)
    );
  });

  return (
    <>
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2>{t("admin.dashboard.patients.title", { defaultValue: "Patient Directory ({{count}})", count: patients.length })}</h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="admin-search-bar">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder={t("admin.dashboard.patients.search_placeholder", { defaultValue: "Search patientsâ€¦" })}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn primary" onClick={() => { setEditingPatientId(null); setForm(EMPTY_FORM); setShowModal(true); }}>
              <UserPlus size={16} /> {t("admin.dashboard.patients.add_patient", { defaultValue: "Add Patient" })}
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin.dashboard.patients.name", { defaultValue: "Name" })}</th>
                <th>{t("admin.dashboard.patients.email", { defaultValue: "Email" })}</th>
                <th>{t("admin.dashboard.patients.phone", { defaultValue: "Phone" })}</th>
                <th>Appts</th>
                <th>{t("admin.dashboard.patients.actions", { defaultValue: "Actions" })}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((p: Patient) => {
                  const initials = getInitials(p.first_name, p.last_name);
                  const color = getAvatarColor(p.first_name + p.last_name);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="patient-name-cell">
                          <div className="patient-avatar" style={{ background: color }}>
                            {initials}
                          </div>
                          <strong>{p.first_name} {p.last_name}</strong>
                        </div>
                      </td>
                      <td style={{ color: '#6b7280' }}>{p.email || '—'}</td>
                      <td style={{ color: '#6b7280' }}>{p.phone || '—'}</td>
                      <td style={{ color: '#6b7280' }}>
                        {bookings.filter((b: any) => 
                          b.name?.toLowerCase() === `${p.first_name} ${p.last_name}`.toLowerCase() || 
                          (p.email && b.email?.toLowerCase() === p.email.toLowerCase())
                        ).length}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => setSelectedPatientId(p.id)} className="action-btn confirm">View</button>
                          <button onClick={() => openEditModal(p)} className="action-btn confirm">Edit</button>
                          <button onClick={() => { if(window.confirm('Delete patient?')) deletePatientMutation.mutate(p.id); }} className="action-btn cancel">Del</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="empty-state">
                    {search 
                      ? t("admin.dashboard.patients.no_match", { defaultValue: "No patients match your search." }) 
                      : t("admin.dashboard.patients.no_found", { defaultValue: "No patients found." })}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* â”€â”€ Add Patient Modal â”€â”€ */}
      {showModal && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingPatientId ? "Edit Patient" : t("admin.dashboard.patients.add_new_patient", { defaultValue: "Add New Patient" })}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={15} /></button>
            </div>

            <form onSubmit={handleAddPatient}>
              <div className="modal-body">
                {error && (
                  <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem', fontWeight: 600 }}>
                    {error}
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">{t("admin.dashboard.patients.first_name", { defaultValue: "First Name *" })}</label>
                    <input className="form-input" required value={form.first_name} onChange={(e) => handleChange('first_name', e.target.value)} placeholder="Jane" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t("admin.dashboard.patients.last_name", { defaultValue: "Last Name *" })}</label>
                    <input className="form-input" required value={form.last_name} onChange={(e) => handleChange('last_name', e.target.value)} placeholder="Doe" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t("admin.dashboard.patients.email", { defaultValue: "Email" })}</label>
                    <input className="form-input" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="jane@example.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t("admin.dashboard.patients.phone", { defaultValue: "Phone" })}</label>
                    <input className="form-input" type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+44 7700 000000" />
                  </div>
                  <div className="form-group span-2">
                    <label className="form-label">{t("admin.dashboard.patients.dob", { defaultValue: "Date of Birth" })}</label>
                    <input className="form-input" type="date" value={form.dob} onChange={(e) => handleChange('dob', e.target.value)} />
                  </div>

                  <div className="form-section-title">{t("admin.dashboard.patients.medical_information", { defaultValue: "Medical Information" })}</div>

                  <div className="form-group span-2">
                    <label className="form-label">{t("admin.dashboard.patients.allergies", { defaultValue: "Allergies" })}</label>
                    <textarea className="form-textarea" value={form.allergies} onChange={(e) => handleChange('allergies', e.target.value)} placeholder="e.g. Penicillin, Latexâ€¦" />
                  </div>
                  <div className="form-group span-2">
                    <label className="form-label">{t("admin.dashboard.patients.current_medications", { defaultValue: "Current Medications" })}</label>
                    <textarea className="form-textarea" value={form.medications} onChange={(e) => handleChange('medications', e.target.value)} placeholder="e.g. Metformin 500mgâ€¦" />
                  </div>
                  <div className="form-group span-2">
                    <label className="form-label">{t("admin.dashboard.patients.medical_conditions", { defaultValue: "Medical Conditions" })}</label>
                    <textarea className="form-textarea" value={form.medical_conditions} onChange={(e) => handleChange('medical_conditions', e.target.value)} placeholder="e.g. Type 2 Diabetes, Hypertensionâ€¦" />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn ghost" onClick={() => setShowModal(false)}>{t("admin.dashboard.patients.cancel", { defaultValue: "Cancel" })}</button>
                <button type="submit" className="btn primary" disabled={addPatientMutation.isPending}>
                  {addPatientMutation.isPending 
                    ? t("admin.dashboard.patients.saving", { defaultValue: "Saving..." }) 
                    : editingPatientId ? "Save Changes" : t("admin.dashboard.patients.add_patient", { defaultValue: "Add Patient" })}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
