import { Button, Card, Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function AdminDashboardPage() {
  return (
    <Container as="main" className="py-4">
      <h1 className="h3 fw-bold mb-4">Bảng điều khiển quản trị</h1>
      <Row className="g-3">
        <Col md={6} lg={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Quản lý laptop</Card.Title>
              <Card.Text className="text-secondary">
                Thêm mới, chỉnh sửa và quản lý danh sách sản phẩm.
              </Card.Text>
              <Button as={Link} to="/admin/laptops">
                Mở danh sách
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
