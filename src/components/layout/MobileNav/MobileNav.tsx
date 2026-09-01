import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { Button } from '../../ui/Button/Button';
import styles from './MobileNav.module.scss';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  onLogout: () => void;
}

export function MobileNav({ isOpen, onClose, session, onLogout }: MobileNavProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll while the panel is open, and move focus into it
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

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <button ref={closeButtonRef} className={styles.closeButton} onClick={onClose} aria-label="Close menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <Link to="/" className={styles.navLink} onClick={onClose}>Home</Link>
        {session && (
          <>
            <Link to="/my-trips" className={styles.navLink} onClick={onClose}>My Trips</Link>
            <Link to="/favourites" className={styles.navLink} onClick={onClose}>Favourites</Link>
            <Link to="/profile" className={styles.navLink} onClick={onClose}>Profile</Link>
          </>
        )}

        <div className={styles.actions}>
          {session ? (
            <Button variant="secondary" onClick={() => { onLogout(); onClose(); }}>
              Log Out
            </Button>
          ) : (
            <>
              <Link to="/login" onClick={onClose}>
                <Button variant="ghost" style={{ width: '100%' }}>Log In</Button>
              </Link>
              <Link to="/signup" onClick={onClose}>
                <Button variant="primary" style={{ width: '100%' }}>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}