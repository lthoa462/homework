// app/report-input/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import ImageUploader from '@/components/ImageUploader';
import HomeButton from '@/components/HomeButton';
import { useRouter } from 'next/navigation';

interface SubjectEntryInput {
  subjectName: string;
  content: string;
  imageUrls: string[] | null; // Chỉ 1 URL ảnh
}

export default function ReportInputPage() {
  const router = useRouter();
  const [reportDate, setReportDate] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [subjectEntries, setSubjectEntries] = useState<SubjectEntryInput[]>([
    { subjectName: '', content: '', imageUrls: null }, // Mặc định có một mục môn học rỗng
  ]);
  const [loading, setLoading] = useState(false); // Dành cho việc submit form chính
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Ref để lưu trữ trạng thái `subjectEntries` mới nhất cho `handleSubmit`
  const latestSubjectEntries = useRef(subjectEntries); 
  useEffect(() => {
    latestSubjectEntries.current = subjectEntries;
  }, [subjectEntries]);

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    setReportDate(`${year}-${month}-${day}`);
  }, []);

  const handleAddSubjectEntry = () => {
    setSubjectEntries((prevEntries) => [
      ...prevEntries,
      { subjectName: '', content: '', imageUrls: null },
    ]);
  };

  const handleRemoveSubjectEntry = (index: number) => {
    setSubjectEntries((prevEntries) => prevEntries.filter((_, i) => i !== index));
  };

  const handleSubjectEntryChange = (
    index: number,
    field: keyof SubjectEntryInput,
    value: string | null
  ) => {
    setSubjectEntries((prevEntries) =>
      prevEntries.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      )
    );
  };

  // --- Xử lý khi ImageUploader thay đổi ảnh (thêm, xóa, upload thành công) ---
  const handleImageChangeForSubject = (subjectEntryIndex: number, imageUrl: string | null) => {
    setSubjectEntries((prevEntries) =>
      prevEntries.map((entry, i) =>
        i === subjectEntryIndex
          ? { ...entry, imageUrls: imageUrl ? [imageUrl] : null } // Cập nhật URL ảnh cho môn học này
          : entry
      )
    );
    if (imageUrl) {
        setSuccess('Ảnh đã được tải lên thành công!');
        setTimeout(() => setSuccess(null), 3000);
    } else {
        setSuccess('Ảnh đã được xóa.');
        setTimeout(() => setSuccess(null), 3000);
    }
  };

  // --- Hàm Submit Form chính (chỉ gọi sau khi ảnh đã được upload tự động) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    const finalSubjectEntries = latestSubjectEntries.current; 

    // Kiểm tra dữ liệu cơ bản
    if (!reportDate || finalSubjectEntries.some(entry => !entry.subjectName || !entry.content)) {
      setError('Vui lòng điền đầy đủ ngày và tên/nội dung cho tất cả các môn.');
      setLoading(false); 
      return;
    }

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportDate: new Date(reportDate).toISOString(),
          isImportant,
          subjectEntries: finalSubjectEntries,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Báo bài đã được lưu thành công!');
        // Reset form
        setReportDate(new Date().toISOString().split('T')[0]);
        setIsImportant(false);
        setSubjectEntries([{ subjectName: '', content: '', imageUrls: null }]);
        // Có thể chuyển hướng về trang chủ hoặc trang báo bài cụ thể
        router.push(`/`); 
      } else {
        setError(data.message || 'Lỗi khi lưu báo bài.');
      }
    } catch (err) {
      console.error('Submit report error:', err);
      setError('Không thể kết nối đến server để lưu báo bài.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-8 max-w-2xl mx-auto bg-white rounded-xl shadow-lg mt-8 mb-8">
      <HomeButton />

      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">📝 Nhập Báo Bài Mới</h1>

      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="reportDate" className="block text-sm font-medium text-gray-700">
            Ngày Báo Bài
          </label>
          <input
            id="reportDate"
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            required
            className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            disabled={loading}
          />
        </div>

        <div className="flex items-center">
          <input
            id="isImportant"
            type="checkbox"
            checked={isImportant}
            onChange={(e) => setIsImportant(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            disabled={loading}
          />
          <label htmlFor="isImportant" className="ml-2 block text-sm font-medium text-gray-900">
            Đây là báo bài quan trọng
          </label>
        </div>

        <h2 className="text-xl font-bold text-gray-700 mt-6 mb-4">Danh sách Môn học:</h2>
        {subjectEntries.map((entry, index) => (
          <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-inner border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Môn học #{index + 1}</h3>
              {subjectEntries.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSubjectEntry(index)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded-full transition duration-150"
                  disabled={loading}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              )}
            </div>

            <div>
              <label htmlFor={`subjectName-${index}`} className="block text-sm font-medium text-gray-700">
                Tên môn học
              </label>
              <input
                id={`subjectName-${index}`}
                type="text"
                value={entry.subjectName}
                onChange={(e) => handleSubjectEntryChange(index, 'subjectName', e.target.value)}
                required
                className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                disabled={loading}
              />
            </div>

            <div className="mt-4">
              <label htmlFor={`content-${index}`} className="block text-sm font-medium text-gray-700">
                Nội dung báo bài
              </label>
              <textarea
                id={`content-${index}`}
                rows={4}
                value={entry.content}
                onChange={(e) => handleSubjectEntryChange(index, 'content', e.target.value)}
                required
                className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                disabled={loading}
              />
            </div>

            {/* Component Upload Ảnh cho từng môn */}
            <div className="mt-4">
              <ImageUploader
                onImageChange={(imageUrl) => handleImageChangeForSubject(index, imageUrl)}
                onUploadError={(err) => setError(`Lỗi upload ảnh cho môn ${index + 1}: ${err}`)}
                initialImageUrl={entry.imageUrls ? entry.imageUrls[0] ?? null : null} // Truyền URL ảnh hiện tại vào ImageUploader
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddSubjectEntry}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
          disabled={loading}
        >
          ➕ Thêm Môn Học Khác
        </button>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 mt-6 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Đang lưu báo bài...' : 'Lưu Báo Bài'}
        </button>
      </form>
    </div>
  );
}