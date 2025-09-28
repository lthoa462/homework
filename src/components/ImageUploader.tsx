// components/ImageUploader.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

// Định nghĩa props
interface ImageUploaderProps {
  // Hàm này sẽ được gọi khi ảnh được upload thành công hoặc xóa
  // Nó sẽ trả về URL ảnh (nếu thêm) hoặc null (nếu xóa)
  // và id của ImageUploader để component cha biết ảnh thuộc về môn học nào.
  onImageChange: (imageUrl: string | null) => void; 
  onUploadError?: (error: string) => void;
  // Bổ sung để hiển thị ảnh ban đầu nếu có (ví dụ: khi edit báo bài)
  initialImageUrl?: string | null;
}

export default function ImageUploader({ 
  onImageChange, 
  onUploadError,
  initialImageUrl 
}: ImageUploaderProps) {
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(initialImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // useEffect để cập nhật uploadedImageUrl và previewUrl nếu initialImageUrl thay đổi từ prop
  // Điều này hữu ích khi chỉnh sửa báo bài và hiển thị ảnh cũ
  // Đảm bảo chỉ chạy khi initialImageUrl thực sự thay đổi và không phải lần render đầu tiên
  const initialLoadRef = useRef(true);
  useEffect(() => {
    if (initialLoadRef.current) {
        initialLoadRef.current = false;
        return;
    }
    if (initialImageUrl !== uploadedImageUrl) { // Tránh loop vô hạn nếu onImageChange cũng cập nhật parent state
        setUploadedImageUrl(initialImageUrl || null);
        setPreviewUrl(initialImageUrl || null);
        setFileToUpload(null); // Reset fileToUpload nếu có ảnh ban đầu
    }
  }, [initialImageUrl]); // eslint-disable-line react-hooks/exhaustive-deps


  // Hàm upload ảnh lên S3
  const uploadFileToS3 = async (file: File) => {
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-s3', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadedImageUrl(data.imageUrl); // Lưu URL ảnh đã upload
        onImageChange(data.imageUrl); // Báo cho component cha biết URL mới
        setFileToUpload(null); // Xóa file đã chọn sau khi upload
        return data.imageUrl;
      } else {
        setError(data.message || 'Upload thất bại');
        onUploadError?.(data.message || 'Upload thất bại');
        setPreviewUrl(null); // Xóa preview nếu upload lỗi
        return null;
      }
    } catch (err) {
      console.error('Client upload error:', err);
      setError('Lỗi kết nối server hoặc upload.');
      onUploadError?.('Lỗi kết nối server hoặc upload.');
      setPreviewUrl(null); // Xóa preview nếu upload lỗi
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileToUpload(null); // Reset file cũ
    setPreviewUrl(null);
    setError(null);

    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn một file ảnh.');
        return;
      }
      setFileToUpload(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url); // Hiển thị preview ngay lập tức
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input để có thể chọn lại cùng 1 file
      }

      // Tự động upload ngay sau khi chọn file
      await uploadFileToS3(file);
    } else {
      setUploadedImageUrl(null); // Xóa ảnh đã upload nếu không còn file nào
      onImageChange(null); // Báo cho cha biết không còn ảnh
    }
  };

  const handleRemoveImage = () => {
    // Xóa URL ảnh đã upload
    setUploadedImageUrl(null);
    setFileToUpload(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset input file
    }
    onImageChange(null); // Báo cho component cha biết ảnh đã bị xóa
  };

  return (
    <div className="border p-4 rounded-lg shadow-sm bg-gray-50 mb-4">
      <h3 className="text-lg font-semibold mb-3">Upload Ảnh</h3>
      
      {/* Input file - chỉ cho phép 1 file */}
      {!uploadedImageUrl && !isUploading && ( // Chỉ hiển thị input nếu chưa có ảnh và không đang upload
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          disabled={isUploading}
          ref={fileInputRef}
        />
      )}

      {/* Hiển thị trạng thái upload */}
      {isUploading && (
        <div className="text-center py-4">
          <p className="text-indigo-600 font-semibold">Đang tải ảnh lên...</p>
          <div className="mt-2 h-2 bg-indigo-200 rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-indigo-600 animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Xem trước ảnh (đã upload hoặc đang chờ upload) */}
      {previewUrl && (
        <div className="mt-4 relative group">
          <img src={previewUrl} alt="Xem trước ảnh" className="max-w-full h-auto rounded-lg shadow-md max-h-40 object-contain mx-auto" />
          
          {/* Nút xóa ảnh đã upload hoặc ảnh đang preview */}
          {!isUploading && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              title="Xóa ảnh này"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          )}
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}