import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout/AppLayout';
import { HomePage } from '../../pages/HomePage';
import { SignupPage } from '../../pages/SignupPage';
import { LoginPage } from '../../pages/LoginPage';
import { ForgotPasswordPage } from '../../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../../pages/ResetPasswordPage';
import { SearchResultsPage } from '../../pages/SearchResultsPage';
import { BusDetailsPage } from '../../pages/BusDetailsPage';
import { SeatSelectionPage } from '../../pages/SeatSelectionPage';
import { PassengersPage } from '../../pages/PassengersPage';
import { ReviewPage } from '../../pages/ReviewPage';
import { PaymentPage } from '../../pages/PaymentPage';
import { ProtectedRoute } from './ProtectedRoute';

function ConfirmationPlaceholderPage() {
  return <main><h1>Booking Confirmation (placeholder — built in Phase 17)</h1></main>;
}

function MyTripsPlaceholderPage() {
  return <main><h1>My Trips (placeholder — built in Phase 18)</h1></main>;
}

function NotFoundPage() {
  return (
    <main style={{ padding: 48, textAlign: 'center' }}>
      <h1>404 — Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
    </main>
  );
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
        <Route path="/bus/:tripId" element={<BusDetailsPage />} />
        <Route path="/trip/:tripId/seats" element={<SeatSelectionPage />} />
        <Route path="/trip/:tripId/passengers" element={<PassengersPage />} />
        <Route path="/trip/:tripId/review" element={<ReviewPage />} />
        <Route path="/trip/:tripId/payment" element={<PaymentPage />} />
        <Route path="/trip/:tripId/confirmation" element={<ConfirmationPlaceholderPage />} />
        <Route
          path="/my-trips"
          element={
            <ProtectedRoute>
              <MyTripsPlaceholderPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}