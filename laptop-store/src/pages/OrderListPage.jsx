import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Table,
} from 'react-bootstrap'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import orderApi from '../api/orderApi'
import ConfirmModal from '../components/common/ConfirmModal'
import EmptyState from '../components/common/EmptyState'
import ErrorAlert from '../components/common/ErrorAlert'
import Loading from '../components/common/Loading'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { formatDateTime, formatPrice } from '../utils/format'
import { getStatus } from '../utils/orderStatus'
import useAxios from '../hooks/useAxios'

function sortNewestFirst(orders) {
  return [...orders].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime(),
  )
}

export default function OrderListPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const consumedLocationKey = useRef(null)
  const [orderToCancel, setOrderToCancel] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const userId = user?.id === undefined ? null : String(user.id)
  const fetchOrders = useCallback(async (signal) => {
    if (!userId) return []

    const data = await orderApi.getByUser(userId, signal)
    return sortNewestFirst(data)
  }, [userId])
  const {
    data: orders,
    loading: ordersLoading,
    error,
    refetch,
    setData,
  } = useAxios(fetchOrders, [userId])
  const loading = Boolean(userId) && ordersLoading

  useEffect(() => {
    const message = location.state?.message
    if (!message || consumedLocationKey.current === location.key) return

    consumedLocationKey.current = location.key
    showToast(message, 'success')
    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: null,
    })
  }, [location, navigate, showToast])

  async function confirmCancel() {
    const order = orderToCancel
    if (!order || order.status !== 'pending') return

    setCancelling(true)
    try {
      const updatedOrder = await orderApi.updateStatus(order.id, 'cancelled')
      const stockResults = await Promise.allSettled(
        (order.items || []).map((item) => orderApi.restoreStock(item)),
      )
      const failedRestocks = stockResults.filter(
        (stockResult) => stockResult.status === 'rejected',
      )

      setData((currentOrders) =>
        currentOrders
          ? currentOrders.map((currentOrder) =>
            currentOrder.id === order.id ? updatedOrder : currentOrder,
            )
          : currentOrders,
      )

      if (failedRestocks.length > 0) {
        showToast(
          `Đơn #${order.id} đã hủy nhưng không thể hoàn kho cho ${failedRestocks.length} sản phẩm.`,
          'danger',
        )
      } else {
        showToast(`Đã hủy đơn #${order.id} và hoàn lại tồn kho.`, 'success')
      }
    } catch (error) {
      showToast(error?.message || 'Không thể hủy đơn hàng.', 'danger')
    } finally {
      setCancelling(false)
      setOrderToCancel(null)
    }
  }

  if (!userId) {
    return (
      <Container as="main" className="py-5">
        <Alert variant="info" className="mb-0">
          Vui lòng đăng nhập để xem đơn hàng của bạn.
        </Alert>
      </Container>
    )
  }

  if (loading) return <Loading text="Đang tải đơn hàng..." />
  if (error) {
    return (
      <Container as="main" className="py-4">
        <ErrorAlert
          message={error.message || 'Không thể tải đơn hàng.'}
          onRetry={refetch}
        />
      </Container>
    )
  }

  return (
    <Container as="main" className="py-4">
      <h1 className="h3 fw-bold mb-3">Đơn hàng của tôi</h1>
      {orders?.length === 0 ? (
        <EmptyState icon="📦" message="Bạn chưa có đơn hàng nào">
          <Button as={Link} to="/laptops" className="mt-3">
            Mua sắm ngay
          </Button>
        </EmptyState>
      ) : (
        orders?.map((order) => {
          const status = getStatus(order.status)
          return (
            <Card key={order.id} className="mb-3 shadow-sm">
              <Card.Header className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                <span>
                  <strong>Đơn #{order.id}</strong>
                  <span className="text-secondary ms-2 small">
                    {formatDateTime(order.createdAt)}
                  </span>
                </span>
                <Badge bg={status.variant}>{status.label}</Badge>
              </Card.Header>
              <Table responsive className="mb-0 align-middle" size="sm">
                <tbody>
                  {(order.items || []).map((item) => (
                    <tr key={item.laptopId}>
                      <td className="ps-3">
                        <Link
                          to={`/laptops/${item.laptopId}`}
                          className="text-decoration-none"
                        >
                          {item.name}
                        </Link>
                      </td>
                      <td className="text-end text-nowrap">
                        {formatPrice(item.price)} × {item.quantity}
                      </td>
                      <td className="text-end text-nowrap pe-3">
                        {formatPrice(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Card.Footer className="d-flex flex-wrap justify-content-between align-items-center gap-2 bg-white">
                <small className="text-secondary">
                  {[
                    order.customer?.fullName,
                    order.customer?.phone,
                    order.customer?.address,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </small>
                <div className="d-flex align-items-center gap-3">
                  <span>
                    Tổng:{' '}
                    <strong className="text-danger">
                      {formatPrice(order.total)}
                    </strong>
                  </span>
                  {order.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => setOrderToCancel(order)}
                    >
                      Hủy đơn
                    </Button>
                  )}
                </div>
              </Card.Footer>
            </Card>
          )
        })
      )}
      <ConfirmModal
        show={Boolean(orderToCancel)}
        title="Hủy đơn hàng"
        message={
          orderToCancel &&
          `Bạn có chắc muốn hủy đơn #${orderToCancel.id}? Tồn kho sản phẩm trong đơn sẽ được hoàn lại.`
        }
        confirmText="Hủy đơn"
        cancelText="Không"
        loading={cancelling}
        onConfirm={confirmCancel}
        onCancel={() => setOrderToCancel(null)}
      />
    </Container>
  )
}
