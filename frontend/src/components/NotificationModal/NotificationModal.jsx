// components/NotificationModal.jsx
// Lightweight toast notification — appears at bottom-center, auto-dismisses.
//
// Usage (from a parent):
//   const [toast, setToast] = useState(null);
//
//   // show
//   setToast({ message: 'Tersimpan!', type: 'success' });
//
//   // hide (also happens automatically after `duration` ms)
//   setToast(null);
//
// Props:
//   message    — string to display
//   type       — 'default' | 'success' | 'error'  (controls background)
//   duration   — ms before auto-dismiss (default 2800)
//   onDismiss  — callback when toast hides (use to clear parent state)

import { useEffect } from 'react';

export default function NotificationModal({
  message,
  type = 'default',
  duration = 2800,
  onDismiss,
}) {
  if (!message) return null;

  // Auto-dismiss
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onDismiss?.(), duration);
    return () => clearTimeout(t);
  }, [message, duration]);

  return (
    <div
      className={`toast ${type}`}
      role="status"
      aria-live="polite"
      onClick={() => onDismiss?.()}
      style={{ cursor: 'pointer' }}
    >
      {message}
    </div>
  );
}