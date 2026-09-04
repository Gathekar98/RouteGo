import { useState } from 'react';
import { Modal } from '../../components/ui/Modal/Modal';
import { Button } from '../../components/ui/Button/Button';
import { estimateRefund } from './cancellationApi';

interface CancelBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  totalAmount: number;
  departureTime: string;
}

export function CancelBookingDialog({
  isOpen,
  onClose,
  onConfirm,
  totalAmount,
  departureTime,
}: CancelBookingDialogProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const estimate = estimateRefund(totalAmount, departureTime);

  async function handleConfirm() {
    setIsCancelling(true);
    try {
      await onConfirm();
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cancel Booking">
      <p style={{ marginBottom: 12 }}>
        Are you sure you want to cancel this booking? This cannot be undone.
      </p>

      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          fontSize: '0.9375rem',
        }}
      >
        <p style={{ fontWeight: 700, marginBottom: 4 }}>Cancellation Policy</p>
        <p>Free cancellation up to 6 hours before departure. 50% refund between 6–2 hours. No refund within 2 hours.</p>
        <p style={{ marginTop: 8 }}>
          Estimated refund: <strong>₹{estimate.amount}</strong> ({estimate.percentage}%)
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={onClose} disabled={isCancelling}>
          Keep Booking
        </Button>
        <Button variant="danger" onClick={handleConfirm} isLoading={isCancelling}>
          Confirm Cancellation
        </Button>
      </div>
    </Modal>
  );
}