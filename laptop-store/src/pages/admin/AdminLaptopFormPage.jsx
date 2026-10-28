import { useEffect, useState } from 'react'
import { Alert, Breadcrumb, Card } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'
import catalogApi from '../../api/catalogApi'
import laptopApi from '../../api/laptopApi'
import ErrorAlert from '../../components/common/ErrorAlert'
import Loading from '../../components/common/Loading'
import LaptopForm, {
  EMPTY_LAPTOP,
  toFormValues,
} from '../../components/laptop/LaptopForm'

export default function AdminLaptopFormPage() {
  const { id } = useParams()

  if (id !== undefined && !/^\d+$/.test(id)) {
    return <ErrorAlert message="Không tìm thấy dữ liệu laptop." />
  }

  return <AdminLaptopFormScreen id={id} />
}

function AdminLaptopFormScreen({ id }) {
  const isEdit = id !== undefined
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [pageData, setPageData] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadData() {
      try {
        const [brands, categories, laptop] = await Promise.all([
          catalogApi.getBrands(controller.signal),
          catalogApi.getCategories(controller.signal),
          isEdit ? laptopApi.getById(id, controller.signal) : Promise.resolve(null),
        ])

        if (!controller.signal.aborted) {
          setPageData({ brands, categories, laptop })
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setPageData({
            brands: [],
            categories: [],
            laptop: null,
            error: error?.message || 'Không thể tải dữ liệu quản trị.',
          })
        }
      }
    }

    loadData()
    return () => controller.abort()
  }, [id, isEdit])

  async function handleSubmit(payload) {
    setSubmitting(true)
    setSubmitError('')

    try {
      const savedLaptop = isEdit
        ? await laptopApi.update(id, { ...pageData.laptop, ...payload, id: pageData.laptop.id })
        : await laptopApi.create(payload)

      navigate('/admin/laptops', {
        state: { message: `Đã lưu ${savedLaptop.name}` },
      })
    } catch (error) {
      setSubmitError(error?.message || 'Không thể lưu laptop.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!pageData) return <Loading text="Đang tải form laptop..." />
  if (pageData.error) return <ErrorAlert message={pageData.error} />

  return (
    <>
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/admin/laptops' }}>
          Quản lý laptop
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{isEdit ? `Sửa #${id}` : 'Thêm mới'}</Breadcrumb.Item>
      </Breadcrumb>

      <h1 className="h3 fw-bold mb-3">
        {isEdit ? `Chỉnh sửa laptop #${id}` : 'Thêm laptop mới'}
      </h1>

      {submitError && <Alert variant="danger">{submitError}</Alert>}

      <Card className="shadow-sm">
        <Card.Body>
          <LaptopForm
            initialValues={isEdit ? toFormValues(pageData.laptop) : EMPTY_LAPTOP}
            brands={pageData.brands}
            categories={pageData.categories}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitText={isEdit ? 'Cập nhật laptop' : 'Thêm laptop'}
          />
        </Card.Body>
      </Card>
    </>
  )
}
