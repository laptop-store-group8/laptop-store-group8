import { useState } from 'react'
import { Button, Form, InputGroup } from 'react-bootstrap'

const RAM_OPTIONS = [8, 16, 32]

export default function LaptopFilter({
  brands = [],
  categories = [],
  filters,
  onChange,
  onReset,
  idPrefix = 'filter',
}) {
  const [priceMin, setPriceMin] = useState(filters.priceMin || '')
  const [priceMax, setPriceMax] = useState(filters.priceMax || '')
  const priceInvalid =
    priceMin !== '' && priceMax !== '' && Number(priceMin) > Number(priceMax)

  function applyPrice(event) {
    event.preventDefault()
    if (!priceInvalid) {
      onChange({ priceMin, priceMax })
    }
  }

  return (
    <div className="laptop-filter">
      <h2 className="h6 fw-bold">Hãng</h2>
      <Form.Check
        type="radio"
        id={`${idPrefix}-brand-all`}
        name={`${idPrefix}-brand`}
        label="Tất cả"
        checked={!filters.brandId}
        onChange={() => onChange({ brandId: '' })}
      />
      {brands.map((brand) => (
        <Form.Check
          key={brand.id}
          type="radio"
          id={`${idPrefix}-brand-${brand.id}`}
          name={`${idPrefix}-brand`}
          label={brand.name}
          checked={filters.brandId === String(brand.id)}
          onChange={() => onChange({ brandId: String(brand.id) })}
        />
      ))}

      <hr />
      <h2 className="h6 fw-bold">Loại laptop</h2>
      <Form.Check
        type="radio"
        id={`${idPrefix}-category-all`}
        name={`${idPrefix}-category`}
        label="Tất cả"
        checked={!filters.categoryId}
        onChange={() => onChange({ categoryId: '' })}
      />
      {categories.map((category) => (
        <Form.Check
          key={category.id}
          type="radio"
          id={`${idPrefix}-category-${category.id}`}
          name={`${idPrefix}-category`}
          label={category.name}
          checked={filters.categoryId === String(category.id)}
          onChange={() => onChange({ categoryId: String(category.id) })}
        />
      ))}

      <hr />
      <h2 className="h6 fw-bold">Khoảng giá (VND)</h2>
      <Form onSubmit={applyPrice}>
        <InputGroup size="sm" className="mb-2">
          <InputGroup.Text>Từ</InputGroup.Text>
          <Form.Control
            type="number"
            min={0}
            step={1000000}
            aria-label="Giá từ"
            value={priceMin}
            onChange={(event) => setPriceMin(event.target.value)}
            isInvalid={priceInvalid}
          />
        </InputGroup>
        <InputGroup size="sm" className="mb-2" hasValidation>
          <InputGroup.Text>Đến</InputGroup.Text>
          <Form.Control
            type="number"
            min={0}
            step={1000000}
            aria-label="Giá đến"
            value={priceMax}
            onChange={(event) => setPriceMax(event.target.value)}
            isInvalid={priceInvalid}
          />
          <Form.Control.Feedback type="invalid">
            Giá từ phải nhỏ hơn hoặc bằng giá đến
          </Form.Control.Feedback>
        </InputGroup>
        <Button
          type="submit"
          size="sm"
          variant="outline-primary"
          className="w-100"
          disabled={priceInvalid}
        >
          Áp dụng
        </Button>
      </Form>

      <hr />
      <h2 className="h6 fw-bold">RAM tối thiểu</h2>
      <Form.Select
        size="sm"
        aria-label="RAM tối thiểu"
        value={filters.ramMin}
        onChange={(event) => onChange({ ramMin: event.target.value })}
      >
        <option value="">Không yêu cầu</option>
        {RAM_OPTIONS.map((ram) => (
          <option key={ram} value={ram}>
            Từ {ram}GB
          </option>
        ))}
      </Form.Select>

      <Button
        variant="outline-secondary"
        size="sm"
        className="w-100 mt-4"
        onClick={onReset}
      >
        Xóa bộ lọc
      </Button>
    </div>
  )
}
