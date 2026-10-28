import { useEffect, useState } from 'react'
import { Button, Card, Container, Table } from 'react-bootstrap'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import laptopApi from '../../api/laptopApi'
import ConfirmModal from '../../components/common/ConfirmModal'
import ErrorAlert from '../../components/common/ErrorAlert'
import Loading from '../../components/common/Loading'
import useToast from '../../hooks/useToast'
import { formatPrice } from '../../utils/format'

export default function AdminLaptopListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const [laptops, setLaptops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [laptopToDelete, setLaptopToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const message = location.state?.message
    if (message) {
      showToast(message, 'success')
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location, navigate, showToast])

  useEffect(() => {
    const controller = new AbortController()

    async function loadLaptops() {
      try {
        const { items } = await laptopApi.getAll({}, controller.signal)
        if (!controller.signal.aborted) {
          setLaptops(items)
          setError('')
        }
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          setError(fetchError?.message || 'Không thể tải danh sách laptop.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadLaptops()

    return () => controller.abort()
  }, [])

  async function handleDelete() {
    if (!laptopToDelete) return

    setDeleting(true)
    try {
      await laptopApi.delete(laptopToDelete.id)
      setLaptops((current) =>
        current.filter((item) => item.id !== laptopToDelete.id),
      )
      showToast('Đã xóa laptop thành công.', 'success')
    } catch (deleteError) {
      showToast(deleteError?.message || 'Không thể xóa laptop.', 'danger')
    } finally {
      setDeleting(false)
      setLaptopToDelete(null)
    }
  }

  if (loading) return <Loading text="Đang tải danh sách laptop..." />
  if (error) return <ErrorAlert message={error} />

  return (
    <Container as="main" className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3 gap-3 flex-wrap">
        <div>
          <h1 className="h3 fw-bold mb-1">Quản lý laptop</h1>
          <small className="text-secondary">Danh sách sản phẩm đang bán</small>
        </div>
        <Button as={Link} to="/admin/laptops/new">
          + Thêm laptop
        </Button>
      </div>

      <Card className="shadow-sm">
        <Table responsive hover className="mb-0 align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>Tên</th>
              <th>Hãng</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {laptops.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-secondary py-4">
                  Chưa có laptop nào.
                </td>
              </tr>
            ) : (
              laptops.map((laptop) => (
                <tr key={laptop.id}>
                  <td>{laptop.id}</td>
                  <td>{laptop.name}</td>
                  <td>{laptop.brandName || laptop.brandId || '—'}</td>
                  <td>{formatPrice(laptop.salePrice ?? laptop.price)}</td>
                  <td>{laptop.stock ?? 0}</td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <Button
                        as={Link}
                        to={`/admin/laptops/${laptop.id}/edit`}
                        variant="outline-primary"
                        size="sm"
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => setLaptopToDelete(laptop)}
                        disabled={deleting}
                      >
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
      <ConfirmModal
        show={Boolean(laptopToDelete)}
        title="Xác nhận xóa laptop"
        message={`Bạn có chắc chắn muốn xóa "${laptopToDelete?.name}"?`}
        confirmText="Xóa"
        loading={deleting}
        onCancel={() => setLaptopToDelete(null)}
        onConfirm={handleDelete}
      />
    </Container>
  )
}
