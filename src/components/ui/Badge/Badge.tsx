import { type HTMLAttributes } from 'react';
import styles from './Badge.module.scss';

type BadgeVariant = 'success' | 'warning' | 'error' | 'neutral';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = 'neutral', className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={[styles.badge, styles[variant], className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </span>
  );
}