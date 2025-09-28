// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

// PHẢI GIỮ SECRET KEY NÀY NHẤT QUÁN VỚI API LOGIN!
const JWT_SECRET = 'your_super_secret_key_that_must_be_long'; 

export function middleware(request: NextRequest) {
  // Các đường dẫn cần bảo vệ
  const protectedRoutes = ['/report-input', '/api/reports/create']; 
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  // Lấy token từ cookies
  const token = request.cookies.get('session_token')?.value; 
  
  if (!token) {
    // Không có token: Chuyển hướng về trang đăng nhập
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  try {
    // Kiểm tra tính hợp lệ của Token
    verify(token, JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    console.log(error)
    // Token không hợp lệ: Xóa token (nếu có) và chuyển hướng về trang đăng nhập
    const url = new URL('/login', request.url);
    const response = NextResponse.redirect(url);
    // Xóa cookie hết hạn
    response.cookies.set('session_token', '', { expires: new Date(0) }); 
    return response;
  }
}

export const config = {
  // Áp dụng cho trang nhập liệu và API tạo báo cáo
  matcher: ['/report-input/:path*', '/api/reports/create'],
   runtime: 'nodejs', 
};