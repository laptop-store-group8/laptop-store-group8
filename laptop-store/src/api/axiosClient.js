import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 8000,
  headers: { 'Content-Type': 'application/json' },
  paramsSerializer: { indexes: null },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.metadata = { start: performance.now() };

  if (import.meta.env.DEV) {
    console.log(
      `[API] ${config.method?.toUpperCase() ?? 'GET'} ${config.url ?? ''}`,
      config.params ?? '',
    );
  }

  return config;
});

const getDuration = (config) =>
  config?.metadata ? Math.round(performance.now() - config.metadata.start) : 0;

const STATUS_MESSAGES = {
  400: 'Dữ liệu gửi lên không hợp lệ',
  401: 'Phiên đăng nhập đã hết hạn',
  403: 'Bạn không có quyền thực hiện thao tác này',
  404: 'Không tìm thấy dữ liệu',
};

axiosClient.interceptors.response.use(
  (response) => {
    response.duration = getDuration(response.config);

    if (import.meta.env.DEV) {
      console.log(
        `[API] ${response.status} ${response.config.method?.toUpperCase() ?? 'GET'} ${response.config.url ?? ''} – ${response.duration}ms`,
      );
    }

    return response;
  },
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status ?? null;
    let message;

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      message = 'Yêu cầu quá thời gian, vui lòng thử lại';
    } else if (!error.response) {
      message = 'Không kết nối được máy chủ. Kiểm tra json-server đã chạy chưa?';
    } else if (status >= 500) {
      message = 'Máy chủ đang gặp sự cố';
    } else {
      message = STATUS_MESSAGES[status] ?? `Có lỗi xảy ra (mã ${status})`;
    }

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:logout'));
    }

    if (import.meta.env.DEV) {
      console.warn(
        `[API] Lỗi ${status ?? ''} ${error.config?.url ?? ''} – ${message}`,
      );
    }

    return Promise.reject({ status, message });
  },
);

export const isCancel = axios.isCancel;

export const getErrorMessage = (error) =>
  error?.message || 'Có lỗi xảy ra, vui lòng thử lại';

export default axiosClient;
