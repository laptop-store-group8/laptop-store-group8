import StarRating from '../common/StarRating'
import { formatDate } from '../../utils/format'

export default function ReviewList({ reviews }) {
  const newestFirst = [...reviews].sort((first, second) => {
    const firstDate = new Date(first.createdAt).getTime()
    const secondDate = new Date(second.createdAt).getTime()
    return (
      (Number.isFinite(secondDate) ? secondDate : 0) -
      (Number.isFinite(firstDate) ? firstDate : 0)
    )
  })

  if (newestFirst.length === 0) {
    return <p className="text-secondary py-3">Chưa có đánh giá.</p>
  }

  return (
    <div className="list-group list-group-flush">
      {newestFirst.map((review) => (
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
  )
}
