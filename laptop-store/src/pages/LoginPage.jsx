import { useState } from 'react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/axiosClient';
import usePageTitle from '../hooks/usePageTitle';
import useAuth from '../hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  usePageTitle('Đăng nhập');

  const emailError =
    !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ? 'Vui lòng nhập email hợp lệ'
      : '';
  const passwordError = password.trim() ? '' : 'Vui lòng nhập mật khẩu';
  const showEmailError = (touched.email || submitted) && emailError;
  const showPasswordError = (touched.password || submitted) && passwordError;

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setError('');

    if (emailError || passwordError) {
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      const requestedPath =
        location.state?.from?.pathname ?? location.state?.from ?? '/';
      const destination =
        typeof requestedPath === 'string' &&
        requestedPath.startsWith('/') &&
        !requestedPath.startsWith('//')
          ? requestedPath
          : '/';
      navigate(destination, { replace: true });
    } catch (loginError) {
      setError(getErrorMessage(loginError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 440 }}>
      <h1 className="h3 mb-4 text-center">Đăng nhập</h1>
      <Form noValidate onSubmit={handleSubmit}>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form.Group className="mb-3" controlId="login-email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setTouched((current) => ({ ...current, email: true }))}
            isInvalid={Boolean(showEmailError)}
            required
          />
          <Form.Control.Feedback type="invalid">
            {showEmailError}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="login-password">
          <Form.Label>Mật khẩu</Form.Label>
          <Form.Control
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onBlur={() =>
              setTouched((current) => ({ ...current, password: true }))
            }
            isInvalid={Boolean(showPasswordError)}
            required
          />
          <Form.Control.Feedback type="invalid">
            {showPasswordError}
          </Form.Control.Feedback>
        </Form.Group>
        <Button className="w-100" type="submit" disabled={loading}>
          {loading ? (
            <>
              <Spinner
                animation="border"
                aria-hidden="true"
                className="me-2"
                size="sm"
              />
              Đang đăng nhập...
            </>
          ) : (
            'Đăng nhập'
          )}
        </Button>
      </Form>
    </div>
  );
}
