import { Button, Modal, Spinner } from 'react-bootstrap';

export default function ConfirmModal({
  show,
  title = 'Xác nhận',
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      show={show}
      centered
      onHide={onCancel}
      backdrop={loading ? 'static' : true}
      keyboard={!loading}
      aria-labelledby="confirm-modal-title"
    >
      <Modal.Header closeButton={!loading}>
        <Modal.Title id="confirm-modal-title">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm} disabled={loading}>
          {loading && (
            <Spinner
              animation="border"
              aria-hidden="true"
              className="me-2"
              size="sm"
            />
          )}
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
