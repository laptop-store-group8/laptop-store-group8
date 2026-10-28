export default function EmptyState({
  icon = '🔍',
  message = 'Không tìm thấy laptop phù hợp',
  children,
}) {
  return (
    <div className="text-center py-5" role="status">
      <div className="display-5 mb-3" aria-hidden="true">
        {icon}
      </div>
      <p className="text-secondary mb-0">{message}</p>
      {children}
    </div>
  );
}
