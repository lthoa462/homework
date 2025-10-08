'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

interface AdminUser {
  id: number;
  username: string;
  fullName: string | null;
  email: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface FormState {
  username: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  password: string;
}

const roleOptions = [
  { value: 'teacher', label: 'Giáo viên' },
  { value: 'assistant', label: 'Trợ giảng' },
  { value: 'admin', label: 'Quản trị viên' },
  { value: 'student', label: 'Học sinh' }
];

const roleLabels = roleOptions.reduce<Record<string, string>>((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

const statusOptions = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Tạm khóa' }
];

const statusLabels = statusOptions.reduce<Record<string, string>>((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

const initialFormState: FormState = {
  username: '',
  fullName: '',
  email: '',
  role: 'teacher',
  status: 'active',
  password: ''
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/users', { cache: 'no-store' });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? 'Không thể tải danh sách người dùng');
      }
      const data = (await response.json()) as { users: AdminUser[] };
      setUsers(data.users);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) =>
      [
        user.username,
        user.fullName ?? '',
        user.email ?? '',
        roleLabels[user.role] ?? user.role,
        statusLabels[user.status] ?? user.status
      ]
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [searchTerm, users]);

  const resetForm = () => {
    setFormState(initialFormState);
    setEditingId(null);
    setFormError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const payload = {
      username: formState.username.trim(),
      fullName: formState.fullName.trim() || null,
      email: formState.email.trim() || null,
      role: formState.role,
      status: formState.status,
      password: formState.password
    };

    if (!payload.username) {
      setFormError('Tên đăng nhập là bắt buộc.');
      setIsSubmitting(false);
      return;
    }

    if (!editingId && !payload.password) {
      setFormError('Vui lòng đặt mật khẩu cho tài khoản mới.');
      setIsSubmitting(false);
      return;
    }

    if (!payload.password) {
      delete (payload as { password?: string }).password;
    }

    try {
      const endpoint = editingId
        ? `/api/admin/users/${editingId}`
        : '/api/admin/users';
      const response = await fetch(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? 'Không thể lưu người dùng');
      }

      const data = (await response.json()) as { user: AdminUser };

      if (editingId) {
        setUsers((prev) =>
          prev.map((user) => (user.id === editingId ? data.user : user))
        );
      } else {
        setUsers((prev) => [data.user, ...prev]);
      }

      resetForm();
    } catch (err) {
      console.error(err);
      setFormError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: AdminUser) => {
    setEditingId(user.id);
    setFormState({
      username: user.username,
      fullName: user.fullName ?? '',
      email: user.email ?? '',
      role: user.role,
      status: user.status,
      password: ''
    });
    setFormError(null);
  };

  const handleDelete = async (id: number) => {
    setFormError(null);
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? 'Không thể xóa người dùng');
      }

      setUsers((prev) => prev.filter((user) => user.id !== id));
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      console.error(err);
      setFormError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Quản lý người dùng</h2>
            <p className="text-sm text-slate-500">
              Thêm, chỉnh sửa hoặc tạm khóa tài khoản trong hệ thống.
            </p>
          </div>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm kiếm theo tên, email..."
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:w-80"
          />
        </div>

        <div className="mt-4">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Họ và tên
                </th>
                <th scope="col" className="px-4 py-3">
                  Tên đăng nhập
                </th>
                <th scope="col" className="px-4 py-3">
                  Email
                </th>
                <th scope="col" className="px-4 py-3">
                  Vai trò
                </th>
                <th scope="col" className="px-4 py-3">
                  Trạng thái
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                    Đang tải dữ liệu người dùng...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                    Không tìm thấy người dùng phù hợp.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="transition hover:bg-indigo-50/40">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {user.fullName ?? '—'}
                    </td>
                    <td className="px-4 py-3">{user.username}</td>
                    <td className="px-4 py-3">{user.email ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                        {roleLabels[user.role] ?? user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          user.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {statusLabels[user.status] ?? user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(user)}
                          className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user.id)}
                          className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-indigo-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          {editingId ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Nhập thông tin cơ bản để {editingId ? 'cập nhật tài khoản hiện tại.' : 'tạo tài khoản mới.'}
        </p>

        {formError && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">
            {formError}
          </div>
        )}

        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="sm:col-span-1">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="username">
              Tên đăng nhập
            </label>
            <input
              id="username"
              type="text"
              value={formState.username}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, username: event.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Ví dụ: nguyen.maianh"
              required
            />
          </div>

          <div className="sm:col-span-1">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="fullName">
              Họ và tên
            </label>
            <input
              id="fullName"
              type="text"
              value={formState.fullName}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, fullName: event.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Ví dụ: Nguyễn Mai Anh"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formState.email}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, email: event.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="name@example.com"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="role">
              Vai trò
            </label>
            <select
              id="role"
              value={formState.role}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, role: event.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-1">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="status">
              Trạng thái
            </label>
            <select
              id="status"
              value={formState.status}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, status: event.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-1">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
              {editingId ? 'Đặt lại mật khẩu (tùy chọn)' : 'Mật khẩu'}
            </label>
            <input
              id="password"
              type="password"
              value={formState.password}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, password: event.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder={editingId ? 'Để trống nếu không thay đổi' : 'Ít nhất 6 ký tự'}
              required={!editingId}
              minLength={editingId ? undefined : 6}
            />
          </div>

          <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting
                ? 'Đang xử lý...'
                : editingId
                  ? 'Lưu thay đổi'
                  : 'Thêm người dùng'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
              >
                Hủy chỉnh sửa
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
