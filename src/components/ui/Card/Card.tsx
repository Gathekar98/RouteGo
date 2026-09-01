import { type HTMLAttributes, forwardRef, type KeyboardEvent } from 'react';
import styles from './Card.module.scss';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ interactive = false, className, children, onClick, onKeyDown, ...rest }, ref) => {
    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
      onKeyDown?.(event);
      if (interactive && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onClick?.(event as unknown as React.MouseEvent<HTMLDivElement>);
      }
    }

    return (
      <div
        ref={ref}
        className={[styles.card, interactive && styles.interactive, className]
          .filter(Boolean)
          .join(' ')}
        tabIndex={interactive ? 0 : undefined}
        role={interactive ? 'button' : undefined}
        onClick={onClick}
        onKeyDown={interactive ? handleKeyDown : onKeyDown}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';