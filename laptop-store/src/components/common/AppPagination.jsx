import { Pagination } from 'react-bootstrap';

export default function AppPagination({ page, totalPages, onChange, maxButtons = 5 }) {
  if (totalPages <= 1) return null;

  let start = Math.max(1, page - Math.floor(maxButtons / 2));
  const end = Math.min(totalPages, start + maxButtons - 1);
  start = Math.max(1, end - maxButtons + 1);
  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index);
  const go = (nextPage) => {
    if (nextPage >= 1 && nextPage <= totalPages && nextPage !== page) {
      onChange(nextPage);
    }
  };

  return (
    <Pagination className="justify-content-center mt-4 flex-wrap">
      <Pagination.First disabled={page === 1} onClick={() => go(1)} />
      <Pagination.Prev disabled={page === 1} onClick={() => go(page - 1)} />
      {start > 1 && <Pagination.Ellipsis disabled />}
      {pages.map((pageNumber) => (
        <Pagination.Item
          key={pageNumber}
          active={pageNumber === page}
          onClick={() => go(pageNumber)}
        >
          {pageNumber}
        </Pagination.Item>
      ))}
      {end < totalPages && <Pagination.Ellipsis disabled />}
      <Pagination.Next disabled={page === totalPages} onClick={() => go(page + 1)} />
      <Pagination.Last disabled={page === totalPages} onClick={() => go(totalPages)} />
    </Pagination>
  );
}
