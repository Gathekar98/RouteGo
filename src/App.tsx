import { AppProviders } from './app/providers/AppProviders';
import { AppRoutes } from './app/routes/AppRoutes';
import { ErrorBoundary } from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;