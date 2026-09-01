import { useEffect, useId, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '../../hooks/useDebounce';
import { searchCities, type City } from './api';
import styles from './CitySearchInput.module.scss';

interface CitySearchInputProps {
  label: string;
  value: string;
  onChange: (cityName: string) => void;
  error?: string;
}

export function CitySearchInput({ label, value, onChange, error }: CitySearchInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const listboxId = `${inputId}-listbox`;

  const debouncedInput = useDebounce(inputValue, 300);

  const { data: cities = [] } = useQuery({
    queryKey: ['cities-search', debouncedInput],
    queryFn: () => searchCities(debouncedInput),
    enabled: debouncedInput.trim().length > 0,
  });

  // Keep local input in sync if the parent resets the value (e.g. after swap)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close the dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectCity(city: City) {
    setInputValue(city.name);
    onChange(city.name);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || cities.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % cities.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? cities.length - 1 : prev - 1));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      selectCity(cities[activeIndex]);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <label htmlFor={inputId} className={styles.label}>{label}</label>
      <input
        id={inputId}
        className={styles.input}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
        aria-invalid={!!error}
        autoComplete="off"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange(''); // clear the "committed" value until a real city is picked
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {isOpen && cities.length > 0 && (
        <ul id={listboxId} role="listbox" className={styles.listbox}>
          {cities.map((city, index) => (
            <li
              key={city.id}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={[styles.option, index === activeIndex && styles.active]
                .filter(Boolean)
                .join(' ')}
              onMouseDown={() => selectCity(city)}
            >
              {city.name} <span className={styles.citySub}>({city.state})</span>
            </li>
          ))}
        </ul>
      )}
      {error && <p role="alert" className={styles.error}>{error}</p>}
    </div>
  );
}