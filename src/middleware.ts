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
 // 🎯 THÊM LOGIC LOẠI TRỪ CÁC ROUTE STATIC 🎯
  // Các đường dẫn cần loại trừ khỏi log (static assets, favicon, Next.js internal paths)
  const excludedLogPaths = [
    '/_next/static',     // Các tệp tĩnh của Next.js (JS, CSS, hình ảnh)
    '/favicon.ico',      // Favicon
    '/_next/image',      // Next.js Image optimization requests
    '/_next/data',       // Dữ liệu pre-fetched bởi Next.js (nếu bạn sử dụng)
    '/manifest.json',    // Manifest cho PWA
    // Thêm các đường dẫn khác nếu cần
  ];

  // Kiểm tra nếu đường dẫn hiện tại bắt đầu bằng bất kỳ đường dẫn nào trong excludedLogPaths
  const isStaticAsset = excludedLogPaths.some(excludedPath => 
    pathname.startsWith(excludedPath)
  );

  // Nếu là tài nguyên tĩnh, bỏ qua việc ghi log và chuyển tiếp request ngay lập tức
  if (isStaticAsset) {
    return NextResponse.next();
  }
  // ===========================================

  // === GHI LOG TRUY CẬP ĐẦU TIÊN (chỉ cho các route không phải static) ===
  writeAccessLog(ip, method, pathname, userAgent, 'Access granted by middleware'); 
  // ===============================================================

  // Các đường dẫn cần bảo vệ
  const protectedRoutes = ['/report-input', '/api/reports/create', '/api/upload-s3']; 
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Nếu không phải route được bảo vệ VÀ không phải route tĩnh đã bị loại trừ
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  // Logic kiểm tra token (chỉ chạy cho các route được bảo vệ)
  const token = request.cookies.get('session_token')?.value; 
  
  if (!token) {
    writeAccessLog(ip, method, pathname, userAgent, 'Authentication failed - No token'); 
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  try {
    verify(token, JWT_SECRET);
    writeAccessLog(ip, method, pathname, userAgent, 'Authentication successful');
    return NextResponse.next();
  } catch (error) {
    console.error('Token verification failed:', error); 
    writeAccessLog(ip, method, pathname, userAgent, `Authentication failed - Invalid token: ${error instanceof Error ? error.message : String(error)}`); 
    
    const url = new URL('/login', request.url);
    const response = NextResponse.redirect(url);
    response.cookies.set('session_token', '', { expires: new Date(0) }); 
    return response;
  }
}

export const config = {
  // `matcher` vẫn phải bao gồm tất cả các request để Middleware có thể loại trừ chúng
  matcher: ['/:path*'], 
  runtime: 'nodejs', 
};