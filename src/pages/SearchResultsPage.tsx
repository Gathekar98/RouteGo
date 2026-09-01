import { useSearchParams } from 'react-router-dom';

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');

  return (
    <main style={{ padding: 24 }}>
      <h1>Search Results</h1>
      <p>
        {from} → {to} on {date}
      </p>
      <p style={{ fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>
        Real bus results, filters, and sorting are built in Phase 9.
      </p>
    </main>
  );
}