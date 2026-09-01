import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../features/auth/useAuth';
import { signOut } from '../../../features/auth/api';
import { Button } from '../../ui/Button/Button';
import { MobileNav } from '../MobileNav/MobileNav';
import styles from './Header.module.scss';

export function Header() {
  const { session, user, isLoading } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  async function handleLogout() {
    await signOut();
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          Route<span>Go</span>
        </Link>

        <nav className={styles.desktopNav} aria-label="Main navigation">
          <Link to="/" className={styles.navLink}>Home</Link>
          {session && (
            <>
              <Link to="/my-trips" className={styles.navLink}>My Trips</Link>
              <Link to="/favourites" className={styles.navLink}>Favourites</Link>
            </>
          )}
        </nav>

        <div className={styles.actions}>
          {!isLoading && (
            <div className={styles.userMenu}>
              {session ? (
                <>
                  <span>Hi, {user?.user_metadata?.full_name?.split(' ')[0] ?? 'there'}</span>
                  <Button variant="secondary" size="sm" onClick={handleLogout}>
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Log In</Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="primary" size="sm">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          )}

          <button
            className={styles.hamburger}
            aria-label="Open menu"
            aria-expanded={isMobileNavOpen}
            onClick={() => setIsMobileNavOpen(true)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        session={session}
        onLogout={handleLogout}
      />
    </header>
  );
}