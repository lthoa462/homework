// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { writeAccessLog } from '@/lib/logger'; // Import logger của bạn

const JWT_SECRET = 'your_super_secret_key_that_must_be_long'; 

export function middleware(request: NextRequest) {
  // === GHI LOG TRUY CẬP ĐẦU TIÊN ===
  const ip = request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for') ?? 'UNKNOWN';
  const method = request.method;
  const pathname = request.nextUrl.pathname;
  const userAgent = request.headers.get('user-agent') ?? undefined;
  
  writeAccessLog(ip ?? undefined, method, pathname, userAgent, 'Access granted by middleware'); // Ghi log ngay khi request đến
  // ==============================

  const protectedRoutes = ['/report-input', '/api/reports/create', '/api/upload-s3']; 
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  const token = request.cookies.get('session_token')?.value; 
  
  if (!token) {
    writeAccessLog(ip, method, pathname, userAgent, 'Authentication failed - No token'); // Ghi log khi authentication fail
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  try {
    verify(token, JWT_SECRET);
    // Nếu xác thực thành công, có thể ghi log thêm
    writeAccessLog(ip, method, pathname, userAgent, 'Authentication successful');
    return NextResponse.next();
  } catch (error) {
    console.error('Token verification failed:', error); // Ghi log lỗi token vào console server
    writeAccessLog(ip, method, pathname, userAgent, `Authentication failed - Invalid token: ${error instanceof Error ? error.message : String(error)}`); // Ghi log lỗi token vào file
    
    const url = new URL('/login', request.url);
    const response = NextResponse.redirect(url);
    response.cookies.set('session_token', '', { expires: new Date(0) }); 
    return response;
  }
}

export const config = {
  matcher: ['/:path*'], // 🎯 Áp dụng middleware cho TẤT CẢ các request
  runtime: 'nodejs', 
};