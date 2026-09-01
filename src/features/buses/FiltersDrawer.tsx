import { useEffect, useRef } from 'react';
import { FiltersPanel } from './FiltersPanel';
import { Button } from '../../components/ui/Button/Button';
import type { TripFilters } from './types';

interface FiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: TripFilters;
  onChange: (filters: TripFilters) => void;
  resultCount: number;
}

export function FiltersDrawer({ isOpen, onClose, filters, onChange, resultCount }: FiltersDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50 }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter results"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: '85vh',
          overflowY: 'auto',
          background: 'var(--color-bg)',
          borderRadius: '16px 16px 0 0',
          padding: 24,
          zIndex: 51,
        }}
      >
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close filters"
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}
        >
          ✕
        </button>

        <FiltersPanel filters={filters} onChange={onChange} />

        <Button size="lg" style={{ width: '100%', marginTop: 16 }} onClick={onClose}>
          Show {resultCount} results
        </Button>
      </div>
    </>
  );
}