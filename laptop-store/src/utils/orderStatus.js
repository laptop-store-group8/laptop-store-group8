export const ORDER_STATUS = {
  pending: { label: 'Chờ xác nhận', variant: 'warning' },
  confirmed: { label: 'Đã xác nhận', variant: 'info' },
  shipping: { label: 'Đang giao', variant: 'primary' },
  done: { label: 'Hoàn thành', variant: 'success' },
  cancelled: { label: 'Đã hủy', variant: 'secondary' },
}

export const NEXT_STATUS = {
  pending: 'confirmed',
  confirmed: 'shipping',
  shipping: 'done',
}

export function getStatus(status) {
  return ORDER_STATUS[status] ?? {
    label: status || 'Không xác định',
    variant: 'secondary',
  }
}
