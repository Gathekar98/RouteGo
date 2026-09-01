import styles from './SeatMap.module.scss';

export function SeatLegend() {
  return (
    <div style={{ display: 'flex', gap: 16, fontSize: '0.8125rem', marginBottom: 16, flexWrap: 'wrap' }}>
      <span><span className={`${styles.seat} ${styles.available}`} style={{ display: 'inline-flex', width: 20, height: 20, marginRight: 4 }} /> Available</span>
      <span><span className={`${styles.seat} ${styles.selected}`} style={{ display: 'inline-flex', width: 20, height: 20, marginRight: 4 }} /> Selected</span>
      <span><span className={`${styles.seat} ${styles.booked}`} style={{ display: 'inline-flex', width: 20, height: 20, marginRight: 4 }} /> Booked</span>
      <span><span className={`${styles.seat} ${styles.ladiesOnly}`} style={{ display: 'inline-flex', width: 20, height: 20, marginRight: 4 }} /> Ladies Only</span>
    </div>
  );
}