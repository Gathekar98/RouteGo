import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../../pages/HomePage';
import { SignupPage } from '../../pages/SignupPage';
import { LoginPage } from '../../pages/LoginPage';
import { ForgotPasswordPage } from '../../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../../pages/ResetPasswordPage';
import { ProtectedRoute } from './ProtectedRoute';

function MyTripsPlaceholderPage() {
  return <main><h1>My Trips (placeholder — built in Phase 18)</h1></main>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/my-trips"
        element={
          <ProtectedRoute>
            <MyTripsPlaceholderPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}