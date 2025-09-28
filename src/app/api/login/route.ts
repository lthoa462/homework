// app/api/login/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie'; // Thư viện giúp tạo chuỗi Cookie hợp lệ

// Cần cài đặt: npm install cookie
// Thay thế bằng secret key mạnh mẽ của bạn
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_that_must_be_long'; 

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Vui lòng cung cấp đầy đủ tên đăng nhập và mật khẩu.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Tên đăng nhập hoặc mật khẩu không đúng.' },
        { status: 401 }
      );
    }
    
    // So sánh mật khẩu (Giả định mật khẩu đã được hash)
    const isPasswordValid = password == user.password
    console.log("🚀 ~ POST ~ password:", password)
    console.log(user);
    console.log(username);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Tên đăng nhập hoặc mật khẩu không đúng.' },
        { status: 401 }
      );
    }
    
    // 1. Tạo Session Token (JWT)
    const token = sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' } // Token có giá trị trong 1 giờ
    );
    
    // 2. Thiết lập Cookie HttpOnly
    const serializedCookie = serialize('session_token', token, {
      httpOnly: true, // CHỈ có thể truy cập bởi server, bảo vệ khỏi XSS
      secure: process.env.NODE_ENV === 'production', // Chỉ gửi qua HTTPS trong môi trường production
      sameSite: 'strict', // Bảo vệ khỏi CSRF
      maxAge: 60 * 60, // 1 giờ (tính bằng giây)
      path: '/', // Áp dụng cho toàn bộ domain
    });

    // 3. Trả về phản hồi và thiết lập Cookie
    const response = NextResponse.json(
      { message: 'Đăng nhập thành công.' }, 
      { status: 200 }
    );
    
    // Gán Cookie vào header của response
    response.headers.set('Set-Cookie', serializedCookie);
    
    return response;

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { message: 'Lỗi máy chủ trong quá trình đăng nhập.' },
      { status: 500 }
    );
  }
}