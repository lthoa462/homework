import { headers } from 'next/headers';

interface OverviewResponse {
  totals: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    reportsThisWeek: number;
    importantReports: number;
  };
  usageByDay: { date: string; count: number }[];
  recentUsers: {
    id: number;
    username: string;
    fullName: string | null;
    role: string;
    status: string;
    createdAt: string;
  }[];
  topSubjects: { subject: string; count: number }[];
}

const roleLabels: Record<string, string> = {
  admin: 'Quản trị viên',
  teacher: 'Giáo viên',
  assistant: 'Trợ giảng',
  student: 'Học sinh'
};

const statusLabels: Record<string, string> = {
  active: 'Hoạt động',
  inactive: 'Tạm khóa'
};

const dayFormatter = new Intl.DateTimeFormat('vi-VN', { weekday: 'short' });
const fullDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

async function getOverviewData(): Promise<OverviewResponse> {
  const headerList = headers();
  const host = headerList.get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (host ? `${protocol}://${host}` : `${protocol}://localhost:3000`);

  const response = await fetch(`${baseUrl}/api/admin/overview`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('Không thể tải dữ liệu tổng quan');
  }

  return response.json();
}

function formatDayLabel(dateIso: string) {
  const date = new Date(dateIso);
  return `${dayFormatter.format(date)}`;
}

function formatFullDate(dateIso: string) {
  return fullDateFormatter.format(new Date(dateIso));
}

export default async function AdminOverviewPage() {
  let data: OverviewResponse | null = null;

  try {
    data = await getOverviewData();
  } catch (error) {
    console.error('Không thể tải tổng quan quản trị', error);
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
        Không thể tải dữ liệu tổng quan. Vui lòng thử lại sau.
      </div>
    );
  }

  const usageMax = Math.max(...data.usageByDay.map((item) => item.count), 1);

  return (
    <div className="space-y-10">
      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Tổng số người dùng</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">
            {data.totals.totalUsers}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {data.totals.activeUsers} đang hoạt động
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Báo cáo trong tuần</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">
            {data.totals.reportsThisWeek}
          </p>
          <p className="mt-2 text-xs font-semibold text-indigo-600">
            {data.totals.importantReports} báo cáo được đánh dấu quan trọng
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Tài khoản tạm khóa</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">
            {data.totals.inactiveUsers}
          </p>
          <p className="mt-2 text-xs text-slate-500">Quản lý quyền truy cập hệ thống</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Môn học nổi bật</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">
            {data.topSubjects[0]?.subject ?? 'Đang cập nhật'}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {data.topSubjects.length > 0
              ? `${data.topSubjects[0]?.count} lượt ghi nhận`
              : 'Chưa có dữ liệu gần đây'}
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Tần suất lập báo cáo 7 ngày qua
            </h2>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Cập nhật hàng ngày
            </span>
          </div>
          <div className="mt-8 flex items-end gap-4">
            {data.usageByDay.map((item) => (
              <div key={item.date} className="flex flex-1 flex-col items-center gap-3">
                <div
                  className="flex h-40 w-full items-end rounded-xl bg-indigo-50"
                  aria-hidden="true"
                >
                  <div
                    className="w-full rounded-xl bg-indigo-600 transition-all"
                    style={{ height: `${(item.count / usageMax) * 100}%` }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700">
                    {item.count} lượt
                  </p>
                  <p className="text-xs text-slate-500">{formatDayLabel(item.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Môn học được quan tâm</h2>
          <ul className="mt-6 space-y-4">
            {data.topSubjects.length === 0 ? (
              <li className="text-sm text-slate-500">Chưa có dữ liệu.</li>
            ) : (
              data.topSubjects.map((subject) => (
                <li key={subject.subject} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {subject.subject}
                    </p>
                    <p className="text-xs text-slate-500">Từ báo cáo gần đây</p>
                  </div>
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {subject.count}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Người dùng mới nhất</h2>
            <p className="text-sm text-slate-500">
              Theo dõi các tài khoản được tạo gần đây để đảm bảo phân quyền phù hợp.
            </p>
          </div>
          <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600">
            Xuất danh sách
          </button>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Tên đầy đủ
                </th>
                <th scope="col" className="px-4 py-3">
                  Tên đăng nhập
                </th>
                <th scope="col" className="px-4 py-3">
                  Vai trò
                </th>
                <th scope="col" className="px-4 py-3">
                  Trạng thái
                </th>
                <th scope="col" className="px-4 py-3">
                  Ngày tạo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data.recentUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    Chưa có tài khoản nào được tạo gần đây.
                  </td>
                </tr>
              ) : (
                data.recentUsers.map((user) => (
                  <tr key={user.id} className="transition hover:bg-indigo-50/40">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {user.fullName ?? '—'}
                    </td>
                    <td className="px-4 py-3">{user.username}</td>
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
                    <td className="px-4 py-3">{formatFullDate(user.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
