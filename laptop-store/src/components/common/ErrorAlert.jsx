import { Alert, Button } from 'react-bootstrap';

export default function ErrorAlert({ message, onRetry, title = 'Đã xảy ra lỗi' }) {
  return (
    <Alert variant="danger" className="my-3">
      <Alert.Heading as="h5">{title}</Alert.Heading>
      <p className="mb-0">{message}</p>
      {onRetry && (
        <div className="mt-3">
          <Button variant="outline-danger" size="sm" onClick={onRetry}>
            ↻ Thử lại
          </Button>
        </div>
      )}
    </Alert>
  );
}
