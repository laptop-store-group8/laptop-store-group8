import { Toast, ToastContainer as BootstrapToastContainer } from 'react-bootstrap';

const TOAST_TITLES = {
  success: 'Thành công',
  danger: 'Lỗi',
  warning: 'Cảnh báo',
  info: 'Thông tin',
};

const LIGHT_TEXT_VARIANTS = new Set(['success', 'danger']);

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <BootstrapToastContainer
      className="p-3"
      position="top-end"
      style={{ position: 'fixed', zIndex: 1080 }}
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map(({ id, message, variant }) => {
        const toastVariant = TOAST_TITLES[variant] ? variant : 'info';

        return (
          <Toast
            key={id}
            bg={toastVariant}
            autohide
            delay={3000}
            onClose={() => onDismiss(id)}
          >
            <Toast.Header>
              <strong className="me-auto">{TOAST_TITLES[toastVariant]}</strong>
            </Toast.Header>
            <Toast.Body
              className={
                LIGHT_TEXT_VARIANTS.has(toastVariant) ? 'text-white' : ''
              }
            >
              {message}
            </Toast.Body>
          </Toast>
        );
      })}
    </BootstrapToastContainer>
  );
}
