import { API_BASE } from '../api';
import { useState, useEffect } from 'react';

interface ChartEntry {
  id?: number;
  tooth_number: number;
  condition: string;
  notes?: string;
}

const CONDITIONS = [
  { value: '', label: 'Select conditionâ€¦' },
  { value: 'healthy',  label: 'âœ… Healthy' },
  { value: 'caries',   label: 'ðŸ”´ Caries (Cavity)' },
  { value: 'filled',   label: 'ðŸ”µ Filled' },
  { value: 'crown',    label: 'ðŸŸ£ Crown' },
  { value: 'missing',  label: 'â¬› Missing / Extracted' },
];

const LEGEND = [
  { key: 'healthy',  label: 'Healthy' },
  { key: 'caries',   label: 'Caries' },
  { key: 'filled',   label: 'Filled' },
  { key: 'crown',    label: 'Crown' },
  { key: 'missing',  label: 'Missing' },
];

const TOP_TEETH    = Array.from({ length: 16 }, (_, i) => i + 1);
const BOTTOM_TEETH = Array.from({ length: 16 }, (_, i) => i + 17).reverse();

export function DentalChart({ patientId, token }: { patientId: string | number; token: string }) {
  const [chartData, setChartData] = useState<Record<number, ChartEntry>>({});
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [condition, setCondition] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    fetchChart();
  }, [patientId]);

  async function fetchChart() {
    try {
      const response = await fetch(`${API_BASE}/api/patients/${patientId}/charts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data: ChartEntry[] = await response.json();
        // Build a map: tooth_number â†’ latest entry
        const map: Record<number, ChartEntry> = {};
        data.forEach((entry) => {
          map[entry.tooth_number] = entry;
        });
        setChartData(map);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function handleToothClick(tooth: number) {
    setSelectedTooth(tooth);
    const existing = chartData[tooth];
    setCondition(existing?.condition ?? '');
    setNotes(existing?.notes ?? '');
    setSavedMsg('');
  }

  async function handleSave() {
    if (!selectedTooth || !condition) return;
    setSaving(true);
    setSavedMsg('');
    try {
      const response = await fetch(`${API_BASE}/api/patients/${patientId}/charts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tooth_number: selectedTooth, condition, notes }),
      });
      if (response.ok) {
        setChartData((prev) => ({
          ...prev,
          [selectedTooth]: { tooth_number: selectedTooth, condition, notes },
        }));
        setSavedMsg('Saved!');
        setTimeout(() => setSavedMsg(''), 2000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  function toothClass(tooth: number) {
    const entry = chartData[tooth];
    if (!entry?.condition) return 'tooth-btn';
    return `tooth-btn tooth-${entry.condition}`;
  }

  function renderArch(teeth: number[]) {
    return teeth.map((t) => (
      <button
        key={t}
        onClick={() => handleToothClick(t)}
        className={`${toothClass(t)}${selectedTooth === t ? ' selected' : ''}`}
        title={`Tooth #${t}${chartData[t]?.condition ? ` â€” ${chartData[t].condition}` : ''}`}
      >
        {t}
        {chartData[t]?.condition && <span className="tooth-dot" />}
      </button>
    ));
  }

  return (
    <div className="dental-chart-wrapper">
      <div className="dental-chart-title">
        ðŸ¦· Dental Chart <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 500 }}>Universal 1â€“32</span>
      </div>

      {/* Upper arch */}
      <div className="dental-arch-label">Upper (Maxillary)</div>
      <div className="dental-arch">{renderArch(TOP_TEETH)}</div>

      <hr className="dental-divider" />

      {/* Lower arch */}
      <div className="dental-arch">{renderArch(BOTTOM_TEETH)}</div>
      <div className="dental-arch-label" style={{ marginTop: 6 }}>Lower (Mandibular)</div>

      {/* Legend */}
      <div className="dental-legend">
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginRight: 4 }}>Legend:</span>
        {LEGEND.map(({ key, label }) => (
          <span key={key} className="legend-item">
            <span className={`legend-dot ${key}`} />
            {label}
          </span>
        ))}
      </div>

      {/* Tooth detail panel */}
      {selectedTooth !== null && (
        <div className="tooth-detail-panel">
          <h4>Tooth #{selectedTooth}{chartData[selectedTooth]?.condition ? ` â€” currently: ${chartData[selectedTooth].condition}` : ' â€” no record yet'}</h4>
          <div className="tooth-detail-row">
            <div style={{ flex: 1, minWidth: 180 }}>
              <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>Condition</label>
              <select
                className="form-select"
                style={{ width: '100%' }}
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                {CONDITIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 2, minWidth: 200 }}>
              <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>Notes</label>
              <input
                className="form-input"
                style={{ width: '100%' }}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notesâ€¦"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <button
                className="btn primary"
                onClick={handleSave}
                disabled={saving || !condition}
                style={{ marginTop: 24 }}
              >
                {saving ? 'Savingâ€¦' : 'Save'}
              </button>
              {savedMsg && (
                <span style={{ color: '#07863f', fontWeight: 700, fontSize: '0.85rem', marginTop: 24 }}>
                  âœ“ {savedMsg}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
