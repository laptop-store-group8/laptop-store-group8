import { useState } from 'react';
import { Card, Container } from 'react-bootstrap';
import LaptopFilter from '../components/catalog/LaptopFilter';
import usePageTitle from '../hooks/usePageTitle';

const BRANDS = [
  { id: 1, name: 'Dell' },
  { id: 2, name: 'Apple' },
  { id: 3, name: 'Asus' },
  { id: 4, name: 'Lenovo' },
];

const CATEGORIES = [
  { id: 1, name: 'Văn phòng' },
  { id: 2, name: 'Gaming' },
  { id: 3, name: 'Đồ họa – Kỹ thuật' },
  { id: 4, name: 'Mỏng nhẹ' },
];

export default function LaptopFilterDemoPage() {
  const [filters, setFilters] = useState({});

  usePageTitle('Demo bộ lọc laptop');

  function handleChange(patch) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  function handleReset() {
    setFilters({});
  }

  return (
    <Container className="py-2">
      <h1 className="h3 mb-4">Demo bộ lọc laptop</h1>
      <Card className="p-3" style={{ maxWidth: 360 }}>
        <LaptopFilter
          filters={filters}
          onChange={handleChange}
          onReset={handleReset}
          brands={BRANDS}
          categories={CATEGORIES}
          idPrefix="demo-filter"
        />
      </Card>
      <pre className="mt-3 mb-0" aria-live="polite">
        {JSON.stringify(filters, null, 2)}
      </pre>
    </Container>
  );
}
