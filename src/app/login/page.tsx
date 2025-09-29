// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HomeButton from '@/components/HomeButton';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const REDIRECT_PATH = '/report-input'; 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // API call sẽ tự động gửi Cookies nếu trình duyệt có
      // và nhận Cookie Set-Cookie mới từ response
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.redirected) {
        window.location.href = response.url;
        return
      }

      if (response.ok) {
        // Đăng nhập thành công, chuyển hướng về trang nhập liệu
        router.push(REDIRECT_PATH);
      } else {
        const data = await response.json();
        setError(data.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Đăng Nhập Hệ Thống
        </h2>
        <HomeButton />
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Input cho Username và Password (được giữ nguyên) */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white bg-indigo-600 rounded-md font-semibold hover:bg-indigo-700 transition duration-200 disabled:bg-indigo-300"
          >
            {loading ? 'Đang kiểm tra...' : 'Đăng Nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}