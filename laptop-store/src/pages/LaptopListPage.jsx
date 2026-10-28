import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Col, Container, Form, Offcanvas, Row } from 'react-bootstrap'
import { useSearchParams } from 'react-router-dom'
import laptopListApi, { buildLaptopListParams } from '../api/laptopListApi'
import AppPagination from '../components/common/AppPagination'
import ErrorAlert from '../components/common/ErrorAlert'
import LaptopFilter from '../components/laptop/LaptopFilter'
import LaptopGrid from '../components/laptop/LaptopGrid'
import DebouncedLaptopSearch from '../components/laptop/DebouncedLaptopSearch'

const FILTER_KEYS = [
  'brandId',
  'categoryId',
  'priceMin',
  'priceMax',
  'ramMin',
  'sort',
  'q',
  'page',
]
const SORT_OPTIONS = {
  newest: 'Mới nhất',
  price_asc: 'Giá tăng dần',
  price_desc: 'Giá giảm dần',
  bestseller: 'Bán chạy',
}
const PAGE_SIZE = 8
const EMPTY_CATALOG = { brands: [], categories: [] }

function isAbortError(error) {
  return error?.name === 'AbortError'
}

export default function LaptopListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilter, setShowFilter] = useState(false)
  const queryString = searchParams.toString()
  const filters = useMemo(
    () =>
      Object.fromEntries(
        FILTER_KEYS.map((key) => [key, searchParams.get(key) || '']),
      ),
    [searchParams],
  )
  const page = Math.max(1, Number(filters.page) || 1)
  const sort = SORT_OPTIONS[filters.sort] ? filters.sort : 'newest'
  const [result, setResult] = useState(null)
  const [catalogResult, setCatalogResult] = useState(null)
  const [retry, setRetry] = useState(0)

  const updateParams = useCallback(
    (patch, { resetPage = true } = {}) => {
      const next = new URLSearchParams(searchParams)
      Object.entries(patch).forEach(([key, value]) => {
        if (value === '' || value === null || value === undefined) {
          next.delete(key)
        } else {
          next.set(key, String(value))
        }
      })
      if (resetPage) next.delete('page')
      setSearchParams(next)
      setShowFilter(false)
    },
    [searchParams, setSearchParams],
  )

  const updateKeyword = useCallback(
    (keyword) => {
      if (keyword !== filters.q) {
        updateParams({ q: keyword })
      }
    },
    [filters.q, updateParams],
  )

  useEffect(() => {
    const controller = new AbortController()

    async function loadCatalog() {
      try {
        const [brands, categories] = await Promise.all([
          laptopListApi.getBrands(controller.signal),
          laptopListApi.getCategories(controller.signal),
        ])
        if (!controller.signal.aborted) {
          setCatalogResult({ retry, data: { brands, categories }, error: null })
        }
      } catch (error) {
        if (!controller.signal.aborted && !isAbortError(error)) {
          setCatalogResult({
            retry,
            data: EMPTY_CATALOG,
            error: error.message || 'Không thể tải danh mục bộ lọc.',
          })
        }
      }
    }

    loadCatalog()
    return () => controller.abort()
  }, [retry])

  useEffect(() => {
    const controller = new AbortController()
    const params = buildLaptopListParams({ ...filters, sort, page })

    async function loadLaptops() {
      try {
        const data = await laptopListApi.getAll(
          params,
          controller.signal,
        )
        if (!controller.signal.aborted) {
          setResult({ queryString, retry, data, error: null })
        }
      } catch (error) {
        if (!controller.signal.aborted && !isAbortError(error)) {
          setResult({
            queryString,
            retry,
            data: null,
            error: error.message || 'Không thể tải danh sách laptop.',
          })
        }
      }
    }

    loadLaptops()
    return () => controller.abort()
  }, [filters, page, queryString, retry, sort])

  const currentResult =
    result?.queryString === queryString && result.retry === retry ? result : null
  const currentCatalog =
    catalogResult?.retry === retry ? catalogResult : null
  const loading = !currentResult
  const data = currentResult?.data
  const error = currentResult?.error || currentCatalog?.error
  const catalog = currentCatalog?.data || EMPTY_CATALOG
  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0

  const filterProps = {
    ...catalog,
    filters,
    onChange: (patch) => updateParams(patch),
    onReset: () => {
      setSearchParams({})
      setShowFilter(false)
    },
  }

  return (
    <Container as="main" className="py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h3 fw-bold mb-0">Laptop</h1>
        {data && (
          <span className="text-secondary">Tìm thấy {data.total} laptop</span>
        )}
      </div>

      <Row>
        <Col lg={3} className="d-none d-lg-block">
          <div className="bg-body-tertiary rounded p-3 sticky-lg-top filter-sticky">
            <LaptopFilter
              key={`side:${filters.priceMin}:${filters.priceMax}`}
              {...filterProps}
              idPrefix="side"
            />
          </div>
        </Col>

        <Col lg={9}>
          <Row className="g-2 mb-3">
            <Col xs={12} md>
              <DebouncedLaptopSearch
                key={filters.q}
                initialValue={filters.q}
                onCommit={updateKeyword}
              />
            </Col>
            <Col xs={6} md="auto">
              <Form.Select
                aria-label="Sắp xếp"
                value={sort}
                onChange={(event) =>
                  updateParams({
                    sort: event.target.value === 'newest' ? '' : event.target.value,
                  })
                }
              >
                {Object.entries(SORT_OPTIONS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={6} md="auto" className="d-lg-none">
              <Button
                variant="outline-dark"
                className="w-100"
                onClick={() => setShowFilter(true)}
              >
                ⚙ Bộ lọc
              </Button>
            </Col>
          </Row>

          {error ? (
            <ErrorAlert
              message={error}
              onRetry={() => setRetry((currentRetry) => currentRetry + 1)}
            />
          ) : (
            <LaptopGrid
              laptops={data?.items}
              loading={loading}
              cols={{ xs: 1, sm: 2, md: 3 }}
            />
          )}

          {!loading && !error && (
            <AppPagination
              page={page}
              totalPages={totalPages}
              onChange={(nextPage) =>
                updateParams(
                  { page: nextPage === 1 ? '' : nextPage },
                  { resetPage: false },
                )
              }
            />
          )}
        </Col>
      </Row>

      <Offcanvas
        show={showFilter}
        onHide={() => setShowFilter(false)}
        placement="start"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Bộ lọc</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <LaptopFilter
            key={`mobile:${filters.priceMin}:${filters.priceMax}`}
            {...filterProps}
            idPrefix="mobile"
          />
        </Offcanvas.Body>
      </Offcanvas>

    </Container>
  )
}
