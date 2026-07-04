import { API_BASE } from '../../api';
import React, { useState, useEffect } from 'react';
import { X, UserPlus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface User {
  id: number;
  name: string | null;
  email: string;
  role: string;
}

export function UsersView({ token, onStaffAdded }: { token: string; onStaffAdded?: () => void }) {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('receptionist');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id?: number; email?: string } | null>(null);

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser(payload);
      } catch (e) {
        console.error('Failed to parse token payload', e);
      }
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [token]);

  async function fetchUsers() {
    try {
      const response = await fetch(`${API_BASE}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      } else {
        console.error('Error fetching users:', data.error);
      }
    } catch (err) {
      console.error('Network error fetching users:', err);
    }
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();
      if (response.ok) {
        setShowModal(false);
        setName('');
        setEmail('');
        setPassword('');
        setRole('receptionist');
        fetchUsers();
        if (onStaffAdded) onStaffAdded();
      } else {
        setError(data.error || 'Failed to add user');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser(userId: number, userEmail: string) {
    if (currentUser && currentUser.id === userId) {
      alert('You cannot delete your own account.');
      return;
    }

    if (!confirm(`Are you sure you want to delete staff member "${userEmail}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        fetchUsers();
        if (onStaffAdded) onStaffAdded();
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      alert('Network error deleting user.');
    }
  }

  function getRoleBadge(userRole: string) {
    switch (userRole) {
      case 'admin':
        return <span className="status-badge status-confirmed">{t("admin.dashboard.users.role_admin", { defaultValue: "Admin" })}</span>;
      case 'dentist':
        return (
          <span className="status-badge" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
            {t("admin.dashboard.users.role_dentist", { defaultValue: "Dentist" })}
          </span>
        );
      case 'receptionist':
        return <span className="status-badge status-pending">{t("admin.dashboard.users.role_receptionist", { defaultValue: "Receptionist" })}</span>;
      default:
        return <span className="status-badge status-completed">{userRole}</span>;
    }
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h2>{t("admin.dashboard.users.title", { defaultValue: "Staff Directory" })}</h2>
        <button className="btn primary" onClick={() => setShowModal(true)}>
          <UserPlus size={16} /> {t("admin.dashboard.users.add_staff", { defaultValue: "Add Staff Member" })}
        </button>
      </div>

      <div className="admin-panel-body">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin.dashboard.patients.name", { defaultValue: "Name" })}</th>
                <th>{t("admin.dashboard.patients.email", { defaultValue: "Email" })}</th>
                <th>{t("admin.dashboard.users.role", { defaultValue: "Role" })}</th>
                <th style={{ width: '100px', textAlign: 'right' }}>{t("admin.dashboard.patients.actions", { defaultValue: "Actions" })}</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-state">
                    {t("admin.dashboard.users.no_users_found", { defaultValue: "No users found" })}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="patient-name-cell">
                        <div
                          className="patient-avatar"
                          style={{
                            backgroundColor:
                              user.role === 'admin'
                                ? '#07863f'
                                : user.role === 'dentist'
                                ? '#3b82f6'
                                : '#f59e0b',
                          }}
                        >
                          {(user.name || user.email).substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong>{user.name || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>{t("admin.dashboard.users.no_name_set", { defaultValue: "No name set" })}</span>}</strong>
                          {currentUser && currentUser.id === user.id && (
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: '6px' }}>
                              ({t("admin.dashboard.users.you", { defaultValue: "You" })})
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#6b7280', fontSize: '0.85rem' }}>{user.email}</td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td style={{ textAlign: 'right' }}>
                      {currentUser && currentUser.id !== user.id ? (
                        <button
                          className="action-btn cancel"
                          title={t("admin.dashboard.users.delete", { defaultValue: "Delete staff member" })}
                          onClick={() => handleDeleteUser(user.id, user.email)}
                        >
                          <Trash2 size={15} />
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: '#9ca3af', fontStyle: 'italic' }}>
                          {t("admin.dashboard.users.active", { defaultValue: "Active" })}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card modal-sm">
            <div className="modal-header">
              <h3>{t("admin.dashboard.users.add_staff", { defaultValue: "Add Staff Member" })}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="modal-body">
                {error && (
                  <div
                    style={{
                      padding: '12px',
                      backgroundColor: '#fee2e2',
                      color: '#b91c1c',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    {error}
                  </div>
                )}
                <div className="form-grid full">
                  <div className="form-group">
                    <label className="form-label">{t("admin.dashboard.users.full_name", { defaultValue: "Full Name" })}</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Dr. Jane Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t("admin.dashboard.users.email_address", { defaultValue: "Email Address" })}</label>
                    <input
                      type="email"
                      className="form-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t("admin.dashboard.users.password", { defaultValue: "Password" })}</label>
                    <input
                      type="password"
                      className="form-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t("admin.dashboard.users.role", { defaultValue: "Role" })}</label>
                    <select
                      className="form-select"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="receptionist">{t("admin.dashboard.users.role_receptionist", { defaultValue: "Receptionist" })}</option>
                      <option value="dentist">{t("admin.dashboard.users.role_dentist", { defaultValue: "Dentist" })}</option>
                      <option value="admin">{t("admin.dashboard.users.role_administrator", { defaultValue: "Administrator" })}</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn ghost" onClick={() => setShowModal(false)}>
                  {t("admin.dashboard.patients.cancel", { defaultValue: "Cancel" })}
                </button>
                <button type="submit" className="btn primary" disabled={loading}>
                  {loading 
                    ? t("admin.dashboard.users.creating", { defaultValue: "Creating..." }) 
                    : t("admin.dashboard.users.create_account", { defaultValue: "Create Account" })}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
