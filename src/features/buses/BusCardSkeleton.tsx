import { Card } from '../../components/ui/Card/Card';

export function BusCardSkeleton() {
  return (
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="skeleton-bar" style={{ width: '40%', height: 18 }} />
        <div className="skeleton-bar" style={{ width: '60%', height: 14 }} />
        <div className="skeleton-bar" style={{ width: '30%', height: 14 }} />
      </div>
    </Card>
  );
}