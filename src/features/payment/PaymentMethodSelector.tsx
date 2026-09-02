import type { PaymentMethod } from './types';

const METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'upi', label: 'UPI', icon: '📱' },
  { value: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { value: 'netbanking', label: 'Net Banking', icon: '🏦' },
  { value: 'wallet', label: 'Wallet', icon: '👛' },
];

interface PaymentMethodSelectorProps {
  selected: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
  disabled: boolean;
}

export function PaymentMethodSelector({ selected, onChange, disabled }: PaymentMethodSelectorProps) {
  return (
    <div role="radiogroup" aria-label="Payment method" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {METHODS.map((method) => (
        <label
          key={method.value}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 16px',
            border: '1px solid',
            borderColor: selected === method.value ? 'var(--color-primary)' : 'var(--color-border)',
            borderRadius: 10,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
          }}
        >
          <input
            type="radio"
            name="paymentMethod"
            checked={selected === method.value}
            onChange={() => onChange(method.value)}
            disabled={disabled}
          />
          <span style={{ fontSize: '1.25rem' }}>{method.icon}</span>
          <span style={{ fontWeight: 600 }}>{method.label}</span>
        </label>
      ))}
    </div>
  );
}