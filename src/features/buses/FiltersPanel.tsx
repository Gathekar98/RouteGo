import type { BusType, TripFilters } from './types';
import { Button } from '../../components/ui/Button/Button';
import styles from './FiltersPanel.module.scss';

const BUS_TYPES: { value: BusType; label: string }[] = [
  { value: 'AC_SLEEPER', label: 'AC Sleeper' },
  { value: 'NON_AC_SLEEPER', label: 'Non-AC Sleeper' },
  { value: 'AC_SEATER', label: 'AC Seater' },
  { value: 'NON_AC_SEATER', label: 'Non-AC Seater' },
];

interface FiltersPanelProps {
  filters: TripFilters;
  onChange: (filters: TripFilters) => void;
}

export function FiltersPanel({ filters, onChange }: FiltersPanelProps) {
  function toggleBusType(type: BusType) {
    const isSelected = filters.busTypes.includes(type);
    onChange({
      ...filters,
      busTypes: isSelected
        ? filters.busTypes.filter((t) => t !== type)
        : [...filters.busTypes, type],
    });
  }

  function clearAll() {
    onChange({ busTypes: [], maxPrice: null, minRating: null });
  }

  const activeFilterCount =
    filters.busTypes.length + (filters.maxPrice !== null ? 1 : 0) + (filters.minRating !== null ? 1 : 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: '1.0625rem' }}>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</h3>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll}>Clear all</Button>
        )}
      </div>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>Bus Type</p>
        {BUS_TYPES.map((type) => (
          <label key={type.value} className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={filters.busTypes.includes(type.value)}
              onChange={() => toggleBusType(type.value)}
            />
            {type.label}
          </label>
        ))}
      </div>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>Max Price (₹)</p>
        <input
          type="number"
          className={styles.priceInput}
          placeholder="No limit"
          value={filters.maxPrice ?? ''}
          onChange={(e) =>
            onChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : null })
          }
        />
      </div>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>Minimum Rating</p>
        {[4, 3].map((rating) => (
          <label key={rating} className={styles.checkboxRow}>
            <input
              type="radio"
              name="minRating"
              checked={filters.minRating === rating}
              onChange={() => onChange({ ...filters, minRating: rating })}
            />
            {rating}★ & above
          </label>
        ))}
        <label className={styles.checkboxRow}>
          <input
            type="radio"
            name="minRating"
            checked={filters.minRating === null}
            onChange={() => onChange({ ...filters, minRating: null })}
          />
          Any rating
        </label>
      </div>
    </div>
  );
}