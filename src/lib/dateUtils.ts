// lib/dateUtils.ts

/**
 * Chuẩn hóa ngày về 00:00:00.000 để chỉ so sánh ngày, tháng, năm.
 */
export const normalizeDate = (dateString: string | Date): Date => {
  const d = new Date(dateString);
  // Đặt giờ, phút, giây, mili giây về 0
  d.setHours(0, 0, 0, 0); 
  return d;
};

/**
 * Định dạng ngày thành chuỗi dễ đọc (ví dụ: 27/10/2023)
 */
export const formatDate = (dateString: string | Date): string => {
    const d = new Date(dateString);
    return d.toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    });
};