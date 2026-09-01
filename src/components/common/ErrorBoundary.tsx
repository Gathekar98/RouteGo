import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // In a real production app this would also send to an error-tracking service
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ padding: 48, textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>We hit an unexpected error. Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: 16 }}>
            Refresh
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}