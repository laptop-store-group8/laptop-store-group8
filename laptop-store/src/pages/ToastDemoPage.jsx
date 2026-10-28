import { useState } from 'react';
import { Button, ButtonGroup, Stack } from 'react-bootstrap';
import ConfirmModal from '../components/common/ConfirmModal';
import usePageTitle from '../hooks/usePageTitle';
import useToast from '../hooks/useToast';

const TOAST_VARIANTS = ['success', 'danger', 'warning', 'info'];

export default function ToastDemoPage() {
  const { showToast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  usePageTitle('Demo thông báo');

  async function confirmDemo() {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setLoading(false);
    setShowConfirm(false);
    showToast('Đã xác nhận thao tác mẫu.', 'success');
  }

  return (
    <>
      <Stack gap={3}>
        <div>
          <h1 className="h3">Demo Toast và ConfirmModal</h1>
          <p className="text-secondary">
            Bấm từng nút để xem đủ bốn loại thông báo; các Toast tự ẩn sau 3
            giây và xếp chồng ở góc trên bên phải.
          </p>
        </div>
        <ButtonGroup className="flex-wrap align-self-start">
          {TOAST_VARIANTS.map((variant) => (
            <Button
              key={variant}
              variant={variant}
              onClick={() => showToast(`Đây là thông báo ${variant}.`, variant)}
            >
              {variant}
            </Button>
          ))}
        </ButtonGroup>
        <div>
          <Button onClick={() => setShowConfirm(true)}>
            Mở hộp thoại xác nhận
          </Button>
        </div>
      </Stack>
      <ConfirmModal
        show={showConfirm}
        title="Xác nhận thao tác mẫu"
        message="Bạn có muốn thử trạng thái đang xử lý của hộp thoại?"
        confirmText="Xác nhận"
        loading={loading}
        onConfirm={confirmDemo}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
