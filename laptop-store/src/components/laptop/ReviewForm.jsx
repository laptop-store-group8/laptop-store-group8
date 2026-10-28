import { useState } from 'react'
import { Alert, Button, ButtonGroup, Form } from 'react-bootstrap'

function getErrors(rating, comment) {
  const errors = {}
  if (!rating) errors.rating = 'Vui lòng chọn số sao.'
  if (comment.trim().length < 10) {
    errors.comment = 'Nội dung đánh giá phải có ít nhất 10 ký tự.'
  }
  return errors
}

export default function ReviewForm({ onSubmit }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const errors = getErrors(rating, comment)

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
    setSubmitError('')
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    try {
      await onSubmit({ rating, comment: comment.trim() })
      setRating(0)
      setComment('')
      setTouched({})
      setSubmitted(false)
    } catch (error) {
      setSubmitError(error?.message || 'Không thể gửi đánh giá.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form className="mt-4" onSubmit={handleSubmit} noValidate>
      <h3 className="h5">Viết đánh giá</h3>
      {submitError && <Alert variant="danger">{submitError}</Alert>}
      <Form.Group className="mb-3">
        <Form.Label>Số sao</Form.Label>
        <div>
          <ButtonGroup aria-label="Chọn số sao">
            {[1, 2, 3, 4, 5].map((value) => (
              <Button
                key={value}
                type="button"
                variant={rating === value ? 'warning' : 'outline-secondary'}
                aria-label={`${value} sao`}
                aria-pressed={rating === value}
                onClick={() => setRating(value)}
                onBlur={() => setTouched((current) => ({ ...current, rating: true }))}
              >
                {value} ★
              </Button>
            ))}
          </ButtonGroup>
        </div>
        {(touched.rating || submitted) && errors.rating && (
          <Form.Control.Feedback type="invalid" className="d-block">
            {errors.rating}
          </Form.Control.Feedback>
        )}
      </Form.Group>
      <Form.Group className="mb-3" controlId="review-comment">
        <Form.Label>Nội dung đánh giá</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={comment}
          isInvalid={(touched.comment || submitted) && Boolean(errors.comment)}
          onChange={(event) => setComment(event.target.value)}
          onBlur={() => setTouched((current) => ({ ...current, comment: true }))}
          aria-describedby="review-comment-error"
        />
        {(touched.comment || submitted) && errors.comment && (
          <Form.Control.Feedback
            id="review-comment-error"
            type="invalid"
          >
            {errors.comment}
          </Form.Control.Feedback>
        )}
      </Form.Group>
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
      </Button>
    </Form>
  )
}
