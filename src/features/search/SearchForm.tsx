import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button/Button';
import { CitySearchInput } from './CitySearchInput';
import { searchSchema } from './schemas';
import styles from './SearchForm.module.scss';

interface FormState {
  fromCity: string;
  toCity: string;
  travelDate: string;
}

interface FormErrors {
  fromCity?: string;
  toCity?: string;
  travelDate?: string;
}

const todayIsoDate = new Date().toISOString().split('T')[0];

export function SearchForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({ fromCity: '', toCity: '', travelDate: '' });
  const [errors, setErrors] = useState<FormErrors>({});

  function handleSwap() {
    setForm((prev) => ({ ...prev, fromCity: prev.toCity, toCity: prev.fromCity }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const result = searchSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormErrors;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    const params = new URLSearchParams({
      from: form.fromCity,
      to: form.toCity,
      date: form.travelDate,
    });
    navigate(`/search-results?${params.toString()}`);
  }

  const swapIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.fieldGroup}>
        <CitySearchInput
          label="From"
          value={form.fromCity}
          onChange={(city) => setForm((prev) => ({ ...prev, fromCity: city }))}
          error={errors.fromCity}
        />
        <button
          type="button"
          className={styles.swapButton}
          onClick={handleSwap}
          aria-label="Swap source and destination"
        >
          {swapIcon}
        </button>
      </div>

      <div className={styles.mobileSwapRow}>
        <button type="button" className={styles.mobileSwapButton} onClick={handleSwap}>
          {swapIcon} Swap
        </button>
      </div>

      <div className={styles.fieldGroup}>
        <CitySearchInput
          label="To"
          value={form.toCity}
          onChange={(city) => setForm((prev) => ({ ...prev, toCity: city }))}
          error={errors.toCity}
        />
      </div>

      <div className={styles.dateField}>
        <label htmlFor="travelDate" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 4 }}>
          Travel Date
        </label>
        <input
          id="travelDate"
          type="date"
          min={todayIsoDate}
          value={form.travelDate}
          onChange={(e) => setForm((prev) => ({ ...prev, travelDate: e.target.value }))}
          aria-invalid={!!errors.travelDate}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
        />
        {errors.travelDate && <p role="alert" style={{ color: 'var(--color-error)', fontSize: '0.8125rem' }}>{errors.travelDate}</p>}
      </div>

      <Button type="submit" size="lg">Search Buses</Button>
    </form>
  );
}