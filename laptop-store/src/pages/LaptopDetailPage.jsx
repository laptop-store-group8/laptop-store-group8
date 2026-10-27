import { useEffect, useState } from 'react'
import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Col,
  Container,
  Image,
  Row,
  Spinner,
  Tab,
  Table,
  Tabs,
} from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'
import laptopDetailApi from '../api/laptopDetailApi'
import ErrorAlert from '../components/common/ErrorAlert'
import Loading from '../components/common/Loading'
import Price from '../components/common/Price'
import StarRating from '../components/common/StarRating'
import LaptopGrid from '../components/laptop/LaptopGrid'
import useAddToCart from '../hooks/useAddToCart'
import { formatDate } from '../utils/format'
import { FALLBACK_IMAGE, handleImageError } from '../utils/image'
import NotFoundPage from './NotFoundPage'

async function loadLaptop(id, signal) {
  const laptop = await laptopDetailApi.getById(id, signal)

  const [reviewsResult, relatedResult] = await Promise.allSettled([
    laptopDetailApi.getReviews(id, signal),
    laptopDetailApi.getRelated(laptop, signal),
  ])

  return {
    laptop,
    reviews:
      reviewsResult.status === 'fulfilled' ? reviewsResult.value : [],
    reviewsError:
      reviewsResult.status === 'rejected' ? reviewsResult.reason : null,
    related:
      relatedResult.status === 'fulfilled' ? relatedResult.value : [],
    relatedError:
      relatedResult.status === 'rejected' ? relatedResult.reason : null,
  }
}

function storageLabel(gigabytes) {
  return gigabytes >= 1024
    ? `${gigabytes / 1024} TB`
    : `${gigabytes} GB`
}

function errorMessage(error) {
  if (error?.status === 404) {
    return 'Không tìm thấy dữ liệu'
  }
  return error?.message || 'Không thể tải thông tin laptop.'
}

export default function LaptopDetailPage() {
  const { id } = useParams()

  if (!/^\d+$/.test(id || '')) {
    return <NotFoundPage />
  }

  return <LaptopDetail key={id} id={id} />
}

function LaptopDetail({ id }) {
  const navigate = useNavigate()
  const { add, adding } = useAddToCart()
  const [result, setResult] = useState(null)
  const [retry, setRetry] = useState(0)
  const [notFound, setNotFound] = useState(false)
  const data = result?.id === id && result.retry === retry ? result.data : null
  const error =
    result?.id === id && result.retry === retry ? result.error : null
  const loading = !data && !error && !notFound
  const laptop = data?.laptop

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const detail = await loadLaptop(id, controller.signal)
        if (!controller.signal.aborted) {
          setNotFound(false)
          setResult({ id, retry, data: detail, error: null })
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          if (loadError?.status === 404 || /HTTP 404/.test(loadError?.message)) {
            setNotFound(true)
          } else {
            setResult({
              id,
              retry,
              data: null,
              error: errorMessage(loadError),
            })
          }
        }
      }
    }

    load()
    return () => controller.abort()
  }, [id, retry])

  useEffect(() => {
    document.title = laptop ? `${laptop.name} | LaptopStore` : 'Chi tiết laptop'
  }, [laptop])

  if (notFound) {
    return <NotFoundPage />
  }

  if (loading) {
    return <Loading text="Đang tải thông tin laptop..." />
  }

  if (error) {
    return (
      <Container as="main" className="py-4">
        <ErrorAlert
          message={error}
          onRetry={() => setRetry((currentRetry) => currentRetry + 1)}
        />
        <Button variant="link" onClick={() => navigate('/laptops')}>
          ← Về danh sách laptop
        </Button>
      </Container>
    )
  }

  const outOfStock = laptop.stock <= 0

  return (
    <Container as="main" className="py-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
          Trang chủ
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/laptops' }}>
          Laptop
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{laptop.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Row className="g-4 mb-4">
        <Col md={5}>
          <Image
            src={laptop.image || FALLBACK_IMAGE}
            alt={laptop.name}
            fluid
            rounded
            className="border w-100"
            onError={handleImageError}
          />
        </Col>
        <Col md={7}>
          <h1 className="h2 fw-bold">{laptop.name}</h1>
          <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
            {laptop.brand && (
              <Badge
                as={Link}
                to={`/laptops?brandId=${laptop.brandId}`}
                bg="dark"
                className="text-decoration-none"
              >
                {laptop.brand.name}
              </Badge>
            )}
            {laptop.category && (
              <Badge
                as={Link}
                to={`/laptops?categoryId=${laptop.categoryId}`}
                bg="primary"
                className="text-decoration-none"
              >
                {laptop.category.name}
              </Badge>
            )}
            <StarRating value={laptop.rating} />
            <span className="text-secondary small">· Đã bán {laptop.sold}</span>
          </div>

          <div className="my-3">
            <Price laptop={laptop} size="lg" />
          </div>
          {laptop.description && <p>{laptop.description}</p>}

          <p className="mb-3">
            Tình trạng:{' '}
            {outOfStock ? (
              <Badge bg="secondary">Hết hàng</Badge>
            ) : (
              <Badge bg="success">Còn {laptop.stock} sản phẩm</Badge>
            )}
          </p>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <Button
              size="lg"
              disabled={outOfStock || adding}
              onClick={() => add(laptop)}
            >
              {adding && <Spinner size="sm" className="me-2" />}
              🛒 Thêm vào giỏ
            </Button>
            <Button
              variant="outline-secondary"
              size="lg"
              onClick={() => navigate(-1)}
            >
              ← Quay lại
            </Button>
          </div>
        </Col>
      </Row>

      <Tabs defaultActiveKey="specs" className="mb-3" id="laptop-tabs">
        <Tab eventKey="specs" title="Thông số kỹ thuật">
          <Table striped bordered responsive>
            <tbody>
              <tr>
                <th scope="row">CPU</th>
                <td>{laptop.cpu || '—'}</td>
              </tr>
              <tr>
                <th scope="row">RAM</th>
                <td>{laptop.ram ? `${laptop.ram} GB` : '—'}</td>
              </tr>
              <tr>
                <th scope="row">Ổ cứng</th>
                <td>{laptop.storage ? `SSD ${storageLabel(laptop.storage)}` : '—'}</td>
              </tr>
              <tr>
                <th scope="row">Màn hình</th>
                <td>{laptop.screen || '—'}</td>
              </tr>
              <tr>
                <th scope="row">Card đồ họa</th>
                <td>{laptop.gpu || '—'}</td>
              </tr>
              <tr>
                <th scope="row">Cân nặng</th>
                <td>{laptop.weight ? `${laptop.weight} kg` : '—'}</td>
              </tr>
              <tr>
                <th scope="row">Hãng</th>
                <td>{laptop.brand?.name || '—'}</td>
              </tr>
              <tr>
                <th scope="row">Loại</th>
                <td>{laptop.category?.name || '—'}</td>
              </tr>
            </tbody>
          </Table>
        </Tab>
        <Tab eventKey="reviews" title={`Đánh giá (${data.reviews.length})`}>
          {data.reviewsError ? (
            <Alert variant="warning">
              Không tải được đánh giá
            </Alert>
          ) : data.reviews.length === 0 ? (
            <p className="text-secondary py-3">Chưa có đánh giá.</p>
          ) : (
            <div className="list-group list-group-flush">
              {data.reviews.map((review) => (
                <div className="list-group-item px-0" key={review.id}>
                  <strong>{review.userName ?? 'Khách hàng'}</strong>{' '}
                  <small className="text-secondary">
                    {formatDate(review.createdAt)}
                  </small>
                  <div>
                    <StarRating value={review.rating} showValue={false} />
                  </div>
                  <p className="mb-0">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </Tab>
      </Tabs>

      <section className="mt-5">
        <h2 className="h4 fw-bold mb-3">Laptop liên quan</h2>
        {data.relatedError ? (
          <Alert variant="warning">Không tải được laptop liên quan.</Alert>
        ) : (
          <LaptopGrid laptops={data.related} loading={false} />
        )}
      </section>
    </Container>
  )
}
