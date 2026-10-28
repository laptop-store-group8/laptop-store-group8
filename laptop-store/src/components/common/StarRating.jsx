export default function StarRating({ value = 0, showValue = true }) {
  const rating = Number(value);
  const safeValue = Number.isFinite(rating)
    ? Math.max(0, Math.min(5, rating))
    : 0;
  const rounded = Math.round(safeValue);

  return (
    <span className="text-warning" title={`${safeValue}/5`}>
      {'★'.repeat(rounded)}
      <span className="text-body-tertiary">{'★'.repeat(5 - rounded)}</span>
      {showValue && (
        <span className="text-secondary small ms-1">{safeValue.toFixed(1)}</span>
      )}
    </span>
  );
}
