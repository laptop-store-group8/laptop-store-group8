import { useEffect, useMemo, useState } from 'react'
import { Badge, Button, ButtonGroup, Card, Container, Form, Table } from 'react-bootstrap'
import { useSearchParams } from 'react-router-dom'
import orderApi from '../../api/orderApi'
import ErrorAlert from '../../components/common/ErrorAlert'
import Loading from '../../components/common/Loading'
import useToast from '../../hooks/useToast'
import { formatDate, formatPrice } from '../../utils/format'
import { getStatus, NEXT_STATUS, ORDER_STATUS } from '../../utils/orderStatus'

const STATUS_FILTERS = [
  { value: '', label: 'Tất cả' },
  ...Object.entries(ORDER_STATUS).map(([value, status]) => ({
    value,
    label: status.label,
  })),
]

function getCustomerName(order) {
  return (
    order.customer?.fullName ||
    order.customer?.name ||
    order.customerName ||
    '—'
  )
}

function getCustomerPhone(order) {
  return order.customer?.phone || order.phone || '—'
}

export default function AdminOrderListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { showToast } = useToast()
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState(null)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const selectedStatus = searchParams.get('status') || ''

  useEffect(() => {
    const controller = new AbortController()

    async function loadOrders() {
      try {
        const data = await orderApi.getAll(
          { _sort: 'createdAt', _order: 'desc' },
          controller.signal,
        )
        if (!controller.signal.aborted) {
          if (!Array.isArray(data)) {
            throw new Error('Dữ liệu danh sách đơn hàng không hợp lệ.')
          }
          setOrders(data)
          setError(null)
        }
      } catch (fetchError) {
        if (!controller.signal.aborted) setError(fetchError)
      }
    }

    loadOrders()

    return () => controller.abort()
  }, [])

  const visibleOrders = useMemo(() => {
    if (!orders) return []
    return selectedStatus
      ? orders.filter((order) => order.status === selectedStatus)
      : orders
  }, [orders, selectedStatus])

  function selectStatus(status) {
    const nextParams = new URLSearchParams(searchParams)
    if (status) nextParams.set('status', status)
    else nextParams.delete('status')
    setSearchParams(nextParams)
  }

  async function handleStatusChange(order, nextStatus) {
    if (NEXT_STATUS[order.status] !== nextStatus || updatingOrderId !== null) {
      return
    }

    setUpdatingOrderId(order.id)
    try {
      const updatedOrder = await orderApi.updateStatus(order.id, nextStatus)
      setOrders((currentOrders) =>
        currentOrders?.map((currentOrder) =>
          currentOrder.id === order.id
            ? { ...currentOrder, ...updatedOrder }
            : currentOrder,
        ) ?? currentOrders,
      )
      showToast(`Đơn #${order.id} đã chuyển sang "${getStatus(nextStatus).label}".`, 'success')
    } catch (updateError) {
      showToast(updateError?.message || 'Không thể cập nhật trạng thái đơn hàng.', 'danger')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  if (orders === null && !error) {
    return <Loading text="Đang tải danh sách đơn hàng..." />
  }

  if (error) {
    return (
      <Container as="main" className="py-4">
        <ErrorAlert message={error.message || 'Không thể tải danh sách đơn hàng.'} />
      </Container>
    )
  }

  return (
    <Container as="main" className="py-4">
      <h1 className="h3 fw-bold mb-3">Quản lý đơn hàng</h1>

      <ButtonGroup className="flex-wrap mb-3" aria-label="Lọc đơn hàng theo trạng thái">
        {STATUS_FILTERS.map((filter) => (
          <Button
            key={filter.value || 'all'}
            variant={selectedStatus === filter.value ? 'primary' : 'outline-primary'}
            aria-pressed={selectedStatus === filter.value}
            onClick={() => selectStatus(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </ButtonGroup>

      <Card className="shadow-sm">
        <Table responsive hover className="mb-0 align-middle">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Số điện thoại</th>
              <th>Tổng tiền</th>
              <th>Ngày đặt</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {visibleOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-center text-secondary">
                  Không có đơn hàng phù hợp.
                </td>
              </tr>
            ) : (
              visibleOrders.map((order) => {
                const status = getStatus(order.status)
                const nextStatus = NEXT_STATUS[order.status]
                const isUpdating = updatingOrderId === order.id

                return (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{getCustomerName(order)}</td>
                    <td>{getCustomerPhone(order)}</td>
                    <td className="text-nowrap">{formatPrice(order.total)}</td>
                    <td className="text-nowrap">{formatDate(order.createdAt)}</td>
                    <td>
                      {nextStatus ? (
                        <Form.Select
                          aria-label={`Trạng thái đơn hàng ${order.id}`}
                          value={order.status}
                          disabled={isUpdating || updatingOrderId !== null}
                          onChange={(event) =>
                            handleStatusChange(order, event.target.value)
                          }
                        >
                          <option value={order.status} disabled>
                            {status.label}
                          </option>
                          <option value={nextStatus}>
                            {getStatus(nextStatus).label}
                          </option>
                        </Form.Select>
                      ) : (
                        <Badge bg={status.variant}>{status.label}</Badge>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </Table>
      </Card>
    </Container>
  )
}
