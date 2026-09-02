import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCoupon } from '../booking/bookingSlice';
import { validateCoupon } from './api';
import type { Coupon } from '../pricing/calculateBookingTotal';
import { Input } from '../../components/ui/Input/Input';
import { Button } from '../../components/ui/Button/Button';

interface CouponInputProps {
  bookingAmount: number;
  onApplied: (coupon: Coupon | null) => void;
}

export function CouponInput({ bookingAmount, onApplied }: CouponInputProps) {
  const dispatch = useDispatch();
  const [code, setCode] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  async function handleApply() {
    if (!code.trim()) return;
    setIsChecking(true);
    setMessage(null);

    try {
      const result = await validateCoupon(code, bookingAmount);
      if (!result.isValid || !result.coupon) {
        setMessage({ type: 'error', text: result.errorMessage ?? 'Invalid coupon.' });
        onApplied(null);
        dispatch(setCoupon(null));
        setAppliedCode(null);
      } else {
        setMessage({ type: 'success', text: `Coupon "${result.coupon.code}" applied!` });
        onApplied(result.coupon);
        dispatch(setCoupon(result.coupon.code));
        setAppliedCode(result.coupon.code);
      }
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setIsChecking(false);
    }
  }

  function handleRemove() {
    setCode('');
    setAppliedCode(null);
    setMessage(null);
    onApplied(null);
    dispatch(setCoupon(null));
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <Input
            label="Coupon Code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            disabled={!!appliedCode}
            placeholder="e.g. FIRST100"
          />
        </div>
        {appliedCode ? (
          <Button variant="secondary" onClick={handleRemove}>Remove</Button>
        ) : (
          <Button onClick={handleApply} isLoading={isChecking} disabled={!code.trim()}>
            Apply
          </Button>
        )}
      </div>
      {message && (
        <p
          role="alert"
          style={{
            fontSize: '0.8125rem',
            marginTop: 6,
            color: message.type === 'error' ? 'var(--color-error)' : 'var(--color-success)',
          }}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}