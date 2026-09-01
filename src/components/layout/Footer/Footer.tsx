import { Link } from 'react-router-dom';
import styles from './Footer.module.scss';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <p className={styles.columnTitle}>RouteGo</p>
          <Link to="/" className={styles.link}>Home</Link>
          <Link to="/about" className={styles.link}>About Us</Link>
        </div>
        <div>
          <p className={styles.columnTitle}>Support</p>
          <Link to="/faq" className={styles.link}>FAQ</Link>
          <Link to="/contact" className={styles.link}>Contact</Link>
        </div>
        <div>
          <p className={styles.columnTitle}>Legal</p>
          <Link to="/terms" className={styles.link}>Terms of Service</Link>
          <Link to="/privacy" className={styles.link}>Privacy Policy</Link>
        </div>
        <div>
          <p className={styles.columnTitle}>Follow Us</p>
          <a href="#" className={styles.link}>Twitter</a>
          <a href="#" className={styles.link}>Instagram</a>
        </div>
      </div>
      <p className={styles.bottom}>
        © {new Date().getFullYear()} RouteGo. A portfolio project — not a real booking service.
      </p>
    </footer>
  );
}