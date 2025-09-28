// app/api/upload-s3/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { verify } from 'jsonwebtoken';

// Khởi tạo S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1', // Thay đổi region của bạn
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const uploadFileToS3 = async (file: Buffer, fileName: string, fileType: string): Promise<string> => {
  const bucketName = process.env.AWS_S3_BUCKET_NAME || '';

  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET_NAME is not defined');
  }

  // Tên file trên S3 (có thể thêm timestamp hoặc UUID để tránh trùng lặp)
  const key = `uploads/${Date.now()}-${fileName}`; 

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: file,
    ContentType: fileType,
    // Ví dụ: Nếu bạn muốn ảnh có thể truy cập công khai qua URL
     ACL: "public-read",
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);

  // Trả về URL của ảnh đã upload
  // Cần đảm bảo bucket của bạn có cấu hình public access hoặc dùng pre-signed URL
  const imageUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return imageUrl;
};

export async function POST(req: NextRequest) {
  try {
    // 1. Kiểm tra xác thực người dùng (Rất quan trọng cho API upload)
    // Tùy thuộc vào cách bạn quản lý session (ví dụ: token trong cookie)
    // Bạn cần kiểm tra nó ở đây. Ví dụ:
    const token = req.cookies.get('session_token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    try {
      verify(token, process.env.JWT_SECRET || '');
    } catch (e) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // 2. Phân tích FormData
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'Không tìm thấy file' }, { status: 400 });
    }

    // Đọc file thành Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // 3. Upload lên S3
    const imageUrl = await uploadFileToS3(buffer, file.name, file.type);

    return NextResponse.json({ message: 'Upload thành công', imageUrl }, { status: 200 });
  } catch (error) {
    console.error('S3 Upload Error:', error);
    return NextResponse.json(
      { message: 'Lỗi khi upload ảnh', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Lưu ý: Cần thêm một API Route để xóa ảnh nếu bạn có chức năng đó.