// lib/logger.ts
import fs from 'fs';
import path from 'path';
import moment from 'moment';

const LOGS_DIR = path.join(process.cwd(), 'logs'); // Thư mục lưu log: project_root/logs

// Đảm bảo thư mục logs tồn tại
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

export function writeAccessLog(
  ip: string | undefined,
  method: string,
  pathname: string,
  userAgent: string | undefined,
  message: string = ''
) {
  const date = moment();
  const fileName = `info-${date.format('DDMMYYYY')}.log`;
  const filePath = path.join(LOGS_DIR, fileName);

  const logEntry = `[${date.format('YYYY-MM-DD HH:mm:ss')}] IP: ${ip || 'N/A'} | Method: ${method} | Path: ${pathname} | User-Agent: ${userAgent || 'N/A'} | Message: ${message}\n`;

  // Ghi log không đồng bộ
  fs.appendFile(filePath, logEntry, (err) => {
    if (err) {
      console.error('Failed to write access log:', err);
    }
  });
}