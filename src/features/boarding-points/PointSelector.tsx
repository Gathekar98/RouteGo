import type { BoardingPoint } from '../buses/types';
import { formatTime } from '../buses/filterUtils';

interface PointSelectorProps {
  label: string;
  points: BoardingPoint[];
  selectedId: string | null;
  onChange: (id: string) => void;
  name: string;
}

export function PointSelector({ label, points, selectedId, onChange, name }: PointSelectorProps) {
  return (
    <fieldset style={{ border: 'none', padding: 0, marginBottom: 20 }}>
      <legend style={{ fontWeight: 700, marginBottom: 8 }}>{label}</legend>
      <div role="radiogroup" aria-label={label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {points.map((point) => (
          <label
            key={point.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 14px',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              cursor: 'pointer',
              borderColor: selectedId === point.id ? 'var(--color-primary)' : 'var(--color-border)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="radio"
                name={name}
                checked={selectedId === point.id}
                onChange={() => onChange(point.id)}
              />
              {point.locationName}
            </span>
            <span style={{ fontWeight: 600 }}>{formatTime(point.scheduledTime)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}