import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout/AppLayout';
import { HomePage } from '../../pages/HomePage';
import { SignupPage } from '../../pages/SignupPage';
import { LoginPage } from '../../pages/LoginPage';
import { ForgotPasswordPage } from '../../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../../pages/ResetPasswordPage';
import { SearchResultsPage } from '../../pages/SearchResultsPage';
import { ProtectedRoute } from './ProtectedRoute';

function MyTripsPlaceholderPage() {
  return <main><h1>My Trips (placeholder — built in Phase 18)</h1></main>;
}

function BusDetailsPlaceholderPage() {
  return <main><h1>Bus Details (placeholder — built in Phase 10)</h1></main>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/search-results" element={<SearchResultsPage />} />
        <Route path="/bus/:tripId" element={<BusDetailsPlaceholderPage />} />
        <Route
          path="/my-trips"
          element={
            <ProtectedRoute>
              <MyTripsPlaceholderPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}