import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';

const allowedRoles = new Set(['student', 'teacher', 'assistant', 'admin']);
const allowedStatuses = new Set(['active', 'inactive']);

function sanitizeUser(user: {
  id: number;
  username: string;
  fullName: string | null;
  email: string | null;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = Number(params.id);

  if (!Number.isInteger(userId)) {
    return NextResponse.json({ message: 'ID người dùng không hợp lệ.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { password, ...rest } = body ?? {};

    const data: Record<string, unknown> = {};

    if (typeof rest.username === 'string') {
      const trimmedUsername = rest.username.trim();
      if (!trimmedUsername) {
        return NextResponse.json(
          { message: 'Tên đăng nhập không được để trống.' },
          { status: 400 }
        );
      }
      data.username = trimmedUsername;
    }

    if (typeof rest.fullName === 'string') {
      const trimmedFullName = rest.fullName.trim();
      data.fullName = trimmedFullName || null;
    }

    if (rest.fullName === null) {
      data.fullName = null;
    }

    if (typeof rest.email === 'string') {
      const trimmedEmail = rest.email.trim();
      data.email = trimmedEmail || null;
    }

    if (rest.email === null) {
      data.email = null;
    }

    if (typeof rest.role === 'string') {
      if (!allowedRoles.has(rest.role)) {
        return NextResponse.json(
          { message: 'Vai trò không hợp lệ.' },
          { status: 400 }
        );
      }
      data.role = rest.role;
    }

    if (typeof rest.status === 'string') {
      if (!allowedStatuses.has(rest.status)) {
        return NextResponse.json(
          { message: 'Trạng thái không hợp lệ.' },
          { status: 400 }
        );
      }
      data.status = rest.status;
    }

    if (password && typeof password === 'string') {
      if (password.length < 6) {
        return NextResponse.json(
          { message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' },
          { status: 400 }
        );
      }
      data.password = await hash(password, 10);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { message: 'Không có dữ liệu cập nhật.' },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ user: sanitizeUser(updated) });
  } catch (error: unknown) {
    console.error(`Failed to update user ${params.id}`, error);

    if (typeof error === 'object' && error && 'code' in error) {
      const prismaCode = (error as { code?: string }).code;
      if (prismaCode === 'P2002') {
        return NextResponse.json(
          { message: 'Tên đăng nhập hoặc email đã tồn tại.' },
          { status: 409 }
        );
      }
      if (prismaCode === 'P2025') {
        return NextResponse.json(
          { message: 'Không tìm thấy người dùng để cập nhật.' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Không thể cập nhật người dùng.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const userId = Number(params.id);

  if (!Number.isInteger(userId)) {
    return NextResponse.json({ message: 'ID người dùng không hợp lệ.' }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ message: 'Đã xóa người dùng.' });
  } catch (error: unknown) {
    console.error(`Failed to delete user ${params.id}`, error);

    if (typeof error === 'object' && error && 'code' in error) {
      const prismaCode = (error as { code?: string }).code;
      if (prismaCode === 'P2025') {
        return NextResponse.json(
          { message: 'Người dùng không tồn tại.' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Không thể xóa người dùng.' },
      { status: 500 }
    );
  }
}
