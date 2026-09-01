import type { SortOption } from './types';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'departure_asc', label: 'Earliest Departure' },
  { value: 'departure_desc', label: 'Latest Departure' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'duration_asc', label: 'Shortest Journey' },
  { value: 'rating_desc', label: 'Best Rating' },
];

interface SortBarProps {
  sort: SortOption;
  onChange: (sort: SortOption) => void;
}

export function SortBar({ sort, onChange }: SortBarProps) {
  return (
    <select
      value={sort}
      onChange={(e) => onChange(e.target.value as SortOption)}
      style={{ padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
      aria-label="Sort results by"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}