import { Card } from '../components/ui/Card/Card';
import { SearchForm } from '../features/search/SearchForm';
import styles from './HomePage.module.scss';

export function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Plan. Book. Go.</h1>
        <p className={styles.heroSubtitle}>
          RouteGo makes it easy to find and book bus tickets across the country.
        </p>
        <div className={styles.searchWrapper}>
          <SearchForm />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Popular Routes</h2>
        <p className={styles.placeholder}>
          Popular route cards will be built once real trip search data is wired up in Phase 9.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Why Choose RouteGo</h2>
        <div className={styles.grid}>
          <Card>
            <h3>Verified Operators</h3>
            <p>Every bus operator on RouteGo is vetted for safety and reliability.</p>
          </Card>
          <Card>
            <h3>Live Seat Selection</h3>
            <p>See real-time seat availability before you book — no surprises.</p>
          </Card>
          <Card>
            <h3>Easy Cancellations</h3>
            <p>Change of plans? Cancel eligible bookings in a couple of taps.</p>
          </Card>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
        <p className={styles.placeholder}>
          FAQ accordion will be added as a dedicated component in a later polish pass.
        </p>
      </section>
    </>
  );
}