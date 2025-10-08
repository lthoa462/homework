import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';

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

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
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

    return NextResponse.json({ users: users.map(sanitizeUser) });
  } catch (error) {
    console.error('Failed to fetch users', error);
    return NextResponse.json(
      { message: 'Không thể tải danh sách người dùng.' },
      { status: 500 }
    );
  }
}

const allowedRoles = new Set(['student', 'teacher', 'assistant', 'admin']);
const allowedStatuses = new Set(['active', 'inactive']);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      username,
      password,
      role = 'student',
      fullName,
      email,
      status = 'active'
    } = body ?? {};

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { message: 'Vui lòng nhập tên đăng nhập hợp lệ.' },
        { status: 400 }
      );
    }

    const normalizedUsername = username.trim();

    if (!normalizedUsername) {
      return NextResponse.json(
        { message: 'Tên đăng nhập không được để trống.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { message: 'Mật khẩu phải có ít nhất 6 ký tự.' },
        { status: 400 }
      );
    }

    if (!allowedRoles.has(role)) {
      return NextResponse.json(
        { message: 'Vai trò không hợp lệ.' },
        { status: 400 }
      );
    }

    if (!allowedStatuses.has(status)) {
      return NextResponse.json(
        { message: 'Trạng thái không hợp lệ.' },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const created = await prisma.user.create({
      data: {
        username: normalizedUsername,
        password: hashedPassword,
        role,
        fullName:
          typeof fullName === 'string' ? fullName.trim() || null : null,
        email: typeof email === 'string' ? email.trim() || null : null,
        status
      },
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

    return NextResponse.json({ user: sanitizeUser(created) }, { status: 201 });
  } catch (error: unknown) {
    console.error('Failed to create user', error);

    if (typeof error === 'object' && error && 'code' in error) {
      const prismaCode = (error as { code?: string }).code;
      if (prismaCode === 'P2002') {
        return NextResponse.json(
          { message: 'Tên đăng nhập hoặc email đã tồn tại.' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Không thể tạo người dùng mới.' },
      { status: 500 }
    );
  }
}
