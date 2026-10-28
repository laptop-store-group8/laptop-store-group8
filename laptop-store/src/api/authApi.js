import axiosClient from './axiosClient';

export async function login(email, password) {
  const response = await axiosClient.get('/users', {
    params: { email: email.trim(), password },
  });
  const [record] = response.data;

  if (!record) {
    throw new Error('Sai email hoặc mật khẩu');
  }

  const user = { ...record };
  delete user.password;

  const token = btoa(`${user.id}:${Date.now()}`);
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));

  return user;
}
