import { Button, Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <Container as="main" className="py-5 text-center">
      <h1 className="h3">Không tìm thấy dữ liệu</h1>
      <p className="text-secondary mb-4">
        Trang hoặc laptop bạn đang tìm không tồn tại.
      </p>
      <Button as={Link} to="/laptops" variant="primary">
        Về danh sách laptop
      </Button>
    </Container>
  )
}
