import { useCallback, useEffect, useState } from 'react'
import {
  Button,
  Card,
  Container,
  Form,
  Image,
  Spinner,
  Table,
} from 'react-bootstrap'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import laptopApi from '../../api/laptopApi'
import laptopListApi from '../../api/laptopListApi'
import AppPagination from '../../components/common/AppPagination'
import ConfirmModal from '../../components/common/ConfirmModal'
import EmptyState from '../../components/common/EmptyState'
import ErrorAlert from '../../components/common/ErrorAlert'
import Loading from '../../components/common/Loading'
import { useToast } from '../../contexts/ToastContext'
import useAxios from '../../hooks/useAxios'
import useDebounce from '../../hooks/useDebounce'
import { FALLBACK_IMAGE, handleImageError } from '../../utils/image'
import { formatPrice } from '../../utils/format'

const PAGE_SIZE = 10

function getActionErrorMessage(error, fallback) {
  if (error?.name === 'TypeError' && error.message === 'Failed to fetch') {
    return fallback
  }

  return error?.message || fallback
}

export default function AdminLaptopListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editingStockId, setEditingStockId] = useState(null)
  const [stockDraft, setStockDraft] = useState('')
  const [savingStockId, setSavingStockId] = useState(null)
  const [laptopToDelete, setLaptopToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const debouncedSearch = useDebounce(search.trim(), 400)
  const fetchLaptops = useCallback(
    (signal) =>
      laptopListApi.getAll(
        {
          ...(debouncedSearch ? { q: debouncedSearch } : {}),
          _page: String(page),
          _limit: String(PAGE_SIZE),
        },
        signal,
      ),
    [debouncedSearch, page],
  )
  const {
    data: result,
    loading,
    error,
    refetch,
    setData,
  } = useAxios(fetchLaptops, [debouncedSearch, page])

  useEffect(() => {
    const message = location.state?.message
    if (typeof message === 'string' && message.trim()) {
      showToast(message, 'success')
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location, navigate, showToast])

  function handleSearchChange(event) {
    setSearch(event.target.value)
    setPage(1)
    setEditingStockId(null)
  }

  function beginStockEdit(laptop) {
    setEditingStockId(laptop.id)
    setStockDraft(String(laptop.stock ?? 0))
  }

  function cancelStockEdit() {
    setEditingStockId(null)
    setStockDraft('')
  }

  async function saveStock(laptop) {
    const stock = Number(stockDraft)
    if (!stockDraft.trim() || !Number.isInteger(stock) || stock < 0) {
      showToast('Tồn kho phải là số nguyên không âm.', 'warning')
      return
    }

    setSavingStockId(laptop.id)
    try {
      const savedLaptop = await laptopApi.patch(laptop.id, { stock })
      setData((current) =>
        current
          ? {
              ...current,
              items: current.items.map((item) =>
                item.id === laptop.id
                  ? { ...item, stock: savedLaptop.stock ?? stock }
                  : item,
              ),
            }
          : current,
      )
      cancelStockEdit()
      showToast('Đã cập nhật tồn kho.', 'success')
    } catch (saveError) {
      showToast(
        getActionErrorMessage(
          saveError,
          'Không thể cập nhật tồn kho. Vui lòng kiểm tra kết nối và thử lại.',
        ),
        'danger',
      )
    } finally {
      setSavingStockId(null)
    }
  }

  function handleStockKeyDown(event, laptop) {
    if (event.key === 'Enter') {
      event.preventDefault()
      saveStock(laptop)
    } else if (event.key === 'Escape') {
      cancelStockEdit()
    }
  }

  async function handleDelete() {
    if (!laptopToDelete || !result) {
      return
    }

    const deletedLaptop = laptopToDelete
    const previousResult = result
    setData((current) =>
      current
        ? {
            ...current,
            items: current.items.filter((item) => item.id !== deletedLaptop.id),
            total: Math.max(0, current.total - 1),
          }
        : current,
    )
    setDeleting(true)

    try {
      await laptopApi.delete(deletedLaptop.id)
      showToast('Đã xóa laptop thành công.', 'success')
    } catch (deleteError) {
      setData(previousResult)
      showToast(
        getActionErrorMessage(
          deleteError,
          'Không thể xóa laptop. Vui lòng kiểm tra kết nối và thử lại.',
        ),
        'danger',
      )
    } finally {
      setDeleting(false)
      setLaptopToDelete(null)
    }
  }

  if (loading && !result) {
    return <Loading text="Đang tải danh sách laptop..." />
  }

  if (error && !result) {
    return (
      <ErrorAlert
        message={getActionErrorMessage(
          error,
          'Không thể tải danh sách laptop. Vui lòng thử lại.',
        )}
        onRetry={refetch}
      />
    )
  }

  const laptops = result?.items ?? []
  const totalPages = Math.ceil((result?.total ?? 0) / PAGE_SIZE)

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

      <Form className="mb-3" role="search">
        <Form.Control
          type="search"
          aria-label="Tìm laptop trong trang quản trị"
          placeholder="Tìm theo tên, hãng..."
          value={search}
          onChange={handleSearchChange}
        />
      </Form>

      {error && (
        <ErrorAlert
          message={getActionErrorMessage(
            error,
            'Không thể tải danh sách laptop. Vui lòng thử lại.',
          )}
          onRetry={refetch}
        />
      )}

      <Card className="shadow-sm">
        <Table responsive hover className="mb-0 align-middle">
          <thead>
            <tr>
              <th scope="col">Ảnh</th>
              <th scope="col">Tên</th>
              <th scope="col">Hãng</th>
              <th scope="col">Giá</th>
              <th scope="col">Tồn kho</th>
              <th scope="col" className="text-end">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {laptops.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState message="Không tìm thấy laptop phù hợp." />
                </td>
              </tr>
            ) : (
              laptops.map((laptop) => {
                const stock = laptop.stock ?? 0
                const isEditingStock = editingStockId === laptop.id

                return (
                  <tr key={laptop.id}>
                    <td>
                      <Image
                        src={laptop.image || FALLBACK_IMAGE}
                        alt={laptop.name}
                        width={64}
                        height={48}
                        rounded
                        className="object-fit-cover"
                        onError={handleImageError}
                      />
                    </td>
                    <td>{laptop.name}</td>
                    <td>
                      {laptop.brand?.name ||
                        laptop.brandName ||
                        laptop.brandId ||
                        '—'}
                    </td>
                    <td>{formatPrice(laptop.salePrice ?? laptop.price)}</td>
                    <td>
                      {isEditingStock ? (
                        <Form.Control
                          type="number"
                          min="0"
                          step="1"
                          aria-label={`Tồn kho ${laptop.name}`}
                          value={stockDraft}
                          autoFocus
                          disabled={savingStockId === laptop.id}
                          onChange={(event) => setStockDraft(event.target.value)}
                          onKeyDown={(event) =>
                            handleStockKeyDown(event, laptop)
                          }
                        />
                      ) : (
                        <Button
                          variant="link"
                          className={`p-0 fw-semibold text-decoration-none ${
                            stock < 5 ? 'text-danger' : 'text-body'
                          }`}
                          aria-label={`Sửa tồn kho ${laptop.name}: ${stock}`}
                          onClick={() => beginStockEdit(laptop)}
                          disabled={deleting || savingStockId !== null}
                        >
                          {stock}
                        </Button>
                      )}
                    </td>
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
                          disabled={deleting || savingStockId !== null}
                        >
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </Table>
      </Card>

      {loading && result && (
        <div className="text-center text-secondary py-2" role="status">
          <Spinner size="sm" className="me-2" />
          Đang cập nhật danh sách...
        </div>
      )}

      <AppPagination page={page} totalPages={totalPages} onChange={setPage} />

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
