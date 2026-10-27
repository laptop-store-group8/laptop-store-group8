import { Col, Row } from 'react-bootstrap'
import EmptyState from '../common/EmptyState'
import LaptopCardSkeleton from './LaptopCardSkeleton'
import LaptopCard from './LaptopCard'

const DEFAULT_COLUMNS = { xs: 1, sm: 2, md: 3, lg: 4 }

export default function LaptopGrid({
  laptops = [],
  loading = false,
  skeletonCount = 8,
  cols = DEFAULT_COLUMNS,
}) {
  if (loading) {
    return (
      <Row {...cols} className="g-3">
        {Array.from({ length: skeletonCount }, (_, index) => (
          <Col key={index}>
            <LaptopCardSkeleton />
          </Col>
        ))}
      </Row>
    )
  }

  if (!laptops || laptops.length === 0) {
    return <EmptyState />
  }

  return (
    <Row {...cols} className="g-3">
      {laptops.map((laptop) => (
        <Col key={laptop.id}>
          <LaptopCard laptop={laptop} />
        </Col>
      ))}
    </Row>
  )
}
