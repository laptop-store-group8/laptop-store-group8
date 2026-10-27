import { useEffect, useState } from 'react'
import { Badge, Button, Carousel, Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import ErrorAlert from '../components/common/ErrorAlert'
import LaptopGrid from '../components/laptop/LaptopGrid'
import homeApi from '../api/homeApi'

const BANNERS = [
  {
    title: 'Laptop Gaming – Chiến mọi tựa game',
    text: 'RTX 40 series, màn hình 240Hz. Giảm đến 10%.',
    to: '/laptops?categoryId=2',
    background: 'linear-gradient(135deg, #1a1a2e, #e94560)',
  },
  {
    title: 'Mỏng nhẹ – Mang theo mọi nơi',
    text: 'Dưới 1.4kg, pin cả ngày cho sinh viên và dân văn phòng.',
    to: '/laptops?categoryId=4',
    background: 'linear-gradient(135deg, #0f4c75, #3282b8)',
  },
  {
    title: 'Máy trạm cho dân Đồ họa – Kỹ thuật',
    text: 'RAM đến 64GB, màn hình OLED chuẩn màu.',
    to: '/laptops?categoryId=3',
    background: 'linear-gradient(135deg, #2d4059, #ea5455)',
  },
]

async function loadParallel(signal) {
  const start = performance.now()
  const [newest, bestsellers, brands, categories] = await Promise.all([
    homeApi.getNewest(signal),
    homeApi.getBestsellers(signal),
    homeApi.getBrands(signal),
    homeApi.getCategories(signal),
  ])

  return {
    newest,
    bestsellers,
    brands,
    categories,
    parallelMs: Math.round(performance.now() - start),
  }
}

async function loadSequential(signal) {
  const start = performance.now()
  await homeApi.getNewest(signal)
  await homeApi.getBestsellers(signal)
  await homeApi.getBrands(signal)
  await homeApi.getCategories(signal)
  return Math.round(performance.now() - start)
}

export default function HomePage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [benchmark, setBenchmark] = useState(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const result = await loadParallel(controller.signal)
        setData(result)
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setData(null)
          setError(loadError.message || 'Không thể tải dữ liệu trang chủ.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    load()
    return () => controller.abort()
  }, [retry])

  useEffect(() => {
    if (!import.meta.env.DEV || !data) {
      return undefined
    }

    const controller = new AbortController()

    async function measureSequentialLoad() {
      try {
        const duration = await loadSequential(controller.signal)
        if (!controller.signal.aborted) {
          setBenchmark({ data, sequentialMs: duration })
        }
      } catch {
        if (!controller.signal.aborted) {
          setBenchmark({ data, sequentialUnavailable: true })
        }
      }
    }

    measureSequentialLoad()
    return () => controller.abort()
  }, [data])

  function retryLoad() {
    setData(null)
    setLoading(true)
    setError('')
    setRetry((currentRetry) => currentRetry + 1)
  }

  const currentBenchmark = benchmark?.data === data ? benchmark : null

  return (
    <Container as="main" className="py-4">
      <Carousel className="home-carousel mb-4 rounded overflow-hidden shadow-sm">
        {BANNERS.map((banner) => (
          <Carousel.Item key={banner.title}>
            <div
              className="home-banner d-flex align-items-center"
              style={{ background: banner.background }}
            >
              <div className="text-white px-4 px-md-5">
                <h2 className="fw-bold">{banner.title}</h2>
                <p className="lead mb-3">{banner.text}</p>
                <Button as={Link} to={banner.to} variant="warning">
                  Xem ngay
                </Button>
              </div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>

      {import.meta.env.DEV && data && (
        <div className="mb-3 text-end">
          <Badge bg="dark" className="fw-normal">
            Tuần tự:{' '}
            {currentBenchmark?.sequentialUnavailable
              ? 'không đo được'
              : currentBenchmark?.sequentialMs ?? '...'}
            ms | Song song: {data.parallelMs}ms
          </Badge>
        </div>
      )}

      {error ? (
        <ErrorAlert
          message={error}
          onRetry={retryLoad}
        />
      ) : (
        <>
          <section className="mb-4">
            <h2 className="h5 fw-bold mb-3">Mua theo hãng</h2>
            <div className="d-flex flex-wrap gap-2">
              {(data?.brands ?? []).map((brand) => (
                <Button
                  key={brand.id}
                  as={Link}
                  to={`/laptops?brandId=${encodeURIComponent(brand.id)}`}
                  variant="outline-dark"
                >
                  {brand.name}
                </Button>
              ))}
            </div>
          </section>

          <section className="mb-4">
            <h2 className="h5 fw-bold mb-3">Danh mục laptop</h2>
            <div className="d-flex flex-wrap gap-2">
              {(data?.categories ?? []).map((category) => (
                <Button
                  key={category.id}
                  as={Link}
                  to={`/laptops?categoryId=${encodeURIComponent(category.id)}`}
                  variant="outline-primary"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </section>

          <section className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h4 fw-bold mb-0">🔥 Bán chạy</h2>
              <Link to="/laptops?sort=bestseller">Xem tất cả →</Link>
            </div>
            <LaptopGrid
              laptops={data?.bestsellers}
              loading={loading}
              skeletonCount={4}
            />
          </section>

          <section>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h4 fw-bold mb-0">🆕 Mới về</h2>
              <Link to="/laptops">Xem tất cả →</Link>
            </div>
            <LaptopGrid
              laptops={data?.newest}
              loading={loading}
              skeletonCount={8}
            />
          </section>
        </>
      )}
    </Container>
  )
}
