import { useId } from 'react';
import { Button, Form, Stack } from 'react-bootstrap';

export default function LaptopFilter({
  filters = {},
  onChange,
  onReset,
  brands = [],
  categories = [],
  idPrefix,
}) {
  const generatedId = useId().replace(/:/g, '');
  const prefix = idPrefix || `laptop-filter-${generatedId}`;
  const invalidPriceRange =
    filters.priceMin !== '' &&
    filters.priceMin != null &&
    filters.priceMax !== '' &&
    filters.priceMax != null &&
    Number(filters.priceMin) > Number(filters.priceMax);

  function updateField(event) {
    onChange({ [event.target.name]: event.target.value });
  }

  return (
    <Stack as="section" gap={3} aria-label="Bộ lọc laptop">
      <fieldset className="border-0 p-0 m-0">
        <legend className="h6">Hãng</legend>
        <Stack gap={2}>
          <Form.Check
            id={`${prefix}-brand-all`}
            type="radio"
            name={`${prefix}-brand`}
            label="Tất cả hãng"
            value=""
            checked={!filters.brandId}
            onChange={() => onChange({ brandId: '' })}
          />
          {brands.map((brand) => (
            <Form.Check
              key={brand.id}
              id={`${prefix}-brand-${brand.id}`}
              type="radio"
              name={`${prefix}-brand`}
              label={brand.name}
              value={String(brand.id)}
              checked={String(filters.brandId ?? '') === String(brand.id)}
              onChange={() => onChange({ brandId: String(brand.id) })}
            />
          ))}
        </Stack>
      </fieldset>

      <Form.Group controlId={`${prefix}-category`}>
        <Form.Label className="fw-semibold">Loại laptop</Form.Label>
        <Form.Select
          name="categoryId"
          value={filters.categoryId ?? ''}
          onChange={updateField}
        >
          <option value="">Tất cả loại</option>
          {categories.map((category) => (
            <option key={category.id} value={String(category.id)}>
              {category.name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <fieldset className="border-0 p-0 m-0">
        <legend className="h6">Khoảng giá</legend>
        <Stack direction="horizontal" gap={2} className="align-items-start">
          <Form.Group controlId={`${prefix}-price-min`} className="flex-fill">
            <Form.Label className="small">Từ</Form.Label>
            <Form.Control
              type="number"
              name="priceMin"
              min="0"
              step="any"
              placeholder="Thấp nhất"
              value={filters.priceMin ?? ''}
              onChange={updateField}
              isInvalid={invalidPriceRange}
              aria-describedby={
                invalidPriceRange ? `${prefix}-price-error` : undefined
              }
            />
          </Form.Group>
          <Form.Group controlId={`${prefix}-price-max`} className="flex-fill">
            <Form.Label className="small">Đến</Form.Label>
            <Form.Control
              type="number"
              name="priceMax"
              min="0"
              step="any"
              placeholder="Cao nhất"
              value={filters.priceMax ?? ''}
              onChange={updateField}
              isInvalid={invalidPriceRange}
              aria-describedby={
                invalidPriceRange ? `${prefix}-price-error` : undefined
              }
            />
          </Form.Group>
        </Stack>
        {invalidPriceRange && (
          <Form.Control.Feedback
            id={`${prefix}-price-error`}
            className="d-block"
            type="invalid"
          >
            Giá tối thiểu không được lớn hơn giá tối đa.
          </Form.Control.Feedback>
        )}
      </fieldset>

      <Form.Group controlId={`${prefix}-ram`}>
        <Form.Label className="fw-semibold">RAM tối thiểu</Form.Label>
        <Form.Select
          name="ramMin"
          value={filters.ramMin ?? ''}
          onChange={updateField}
        >
          <option value="">Không giới hạn</option>
          {[8, 16, 32].map((ram) => (
            <option key={ram} value={ram}>
              {ram} GB trở lên
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Button type="button" variant="outline-secondary" onClick={onReset}>
        Xóa bộ lọc
      </Button>
    </Stack>
  );
}
