import { Badge } from 'react-bootstrap';
import { formatPrice, getDiscountPercent, hasSale } from '../../utils/format';

export default function Price({ laptop, size = 'md' }) {
  const discounted = hasSale(laptop);
  const mainClass = size === 'lg' ? 'fs-3' : 'fs-5';

  if (!discounted) {
    return (
      <div className={`fw-bold text-danger ${mainClass}`}>
        {formatPrice(laptop?.price)}
      </div>
    );
  }

  return (
    <div>
      <span className={`fw-bold text-danger ${mainClass} me-2`}>
        {formatPrice(laptop.salePrice)}
      </span>
      <Badge bg="danger">-{getDiscountPercent(laptop)}%</Badge>
      <div className="text-secondary text-decoration-line-through small">
        {formatPrice(laptop.price)}
      </div>
    </div>
  );
}
