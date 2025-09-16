// app/report-input/page.tsx
'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface SubjectEntryInput {
  subjectName: string;
  content: string;
  isHomework: boolean;
  imageFiles: File[];
  imageUrls: string[];
}

export default function ReportInputPage() {
  const [reportDate, setReportDate] = useState<Date | null>(new Date());
  const [isImportant, setIsImportant] = useState(false);
  const [subjects, setSubjects] = useState<SubjectEntryInput[]>([
    {
      subjectName: '',
      content: '',
      isHomework: true,
      imageFiles: [],
      imageUrls: [],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Các hàm xử lý sự kiện
  const handleAddSubject = () => {
    setSubjects([
      ...subjects,
      {
        subjectName: '',
        content: '',
        isHomework: true,
        imageFiles: [],
        imageUrls: [],
      },
    ]);
  };

  const handleRemoveSubject = (index: number) => {
    const newSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(newSubjects);
  };

  const handleSubjectChange = (index: number, field: keyof SubjectEntryInput, value: any) => {
    const newSubjects = [...subjects];
    // @ts-ignore
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newSubjects = [...subjects];
      newSubjects[index].imageFiles = Array.from(e.target.files);
      setSubjects(newSubjects);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!reportDate) {
      setMessage('Lỗi: Ngày báo bài không được để trống.');
      setLoading(false);
      return;
    }

    try {
      const subjectEntries = subjects.map((subject) => {
        // Here, you would upload the subject.imageFiles and get the URLs
        // For this example, we'll just generate mock URLs
        const uploadedUrls = subject.imageFiles.map(() => `https://picsum.photos/id/237/200/300`);
        return {
          subjectName: subject.subjectName,
          content: subject.content,
          imageUrls: uploadedUrls,
          isHomework: subject.isHomework,
        };
      });

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportDate: reportDate.toISOString(),
          isImportant,
          subjectEntries,
          createdBy: 1, // Thay thế bằng ID người dùng thực tế
        }),
      });

      if (response.ok) {
        setMessage('Báo bài đã được gửi thành công!');
        // Reset form
        setReportDate(new Date());
        setIsImportant(false);
        setSubjects([
          {
            subjectName: '',
            content: '',
            isHomework: true,
            imageFiles: [],
            imageUrls: [],
          },
        ]);
      } else {
        const errorData = await response.json();
        setMessage(`Lỗi: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Lỗi khi gửi báo bài:', error);
      setMessage('Lỗi khi gửi báo bài. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // app/report-input/page.tsx
// ... (các import và state đã cập nhật)

return (
  <div className="container mx-auto p-4 md:p-8">
    <h1 className="text-3xl font-bold text-center my-8">Nhập Báo Bài</h1>
    <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto">
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Ngày Báo Bài</label>
        <DatePicker
          selected={reportDate}
          onChange={(date: Date | null) => setReportDate(date)}
          dateFormat="yyyy/MM/dd"
          className="w-full border rounded py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id="isImportant"
          checked={isImportant}
          onChange={(e) => setIsImportant(e.target.checked)}
          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="text-gray-700" htmlFor="isImportant">Đánh dấu là ngày quan trọng</label>
      </div>

      {subjects.map((subject, index) => (
        <div key={index} className="border-t border-gray-200 mt-6 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Môn Học #{index + 1}</h2>
            {subjects.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveSubject(index)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Xóa
              </button>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor={`subjectName-${index}`}>Tên Môn Học</label>
            <input
              type="text"
              id={`subjectName-${index}`}
              value={subject.subjectName}
              onChange={(e) => handleSubjectChange(index, 'subjectName', e.target.value)}
              className="w-full border rounded py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor={`content-${index}`}>Nội Dung</label>
            <textarea
              id={`content-${index}`}
              value={subject.content}
              onChange={(e) => handleSubjectChange(index, 'content', e.target.value)}
              className="w-full border rounded py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
              rows={4}
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor={`imageFiles-${index}`}>Ảnh Đính Kèm</label>
            <input
              type="file"
              id={`imageFiles-${index}`}
              onChange={(e) => handleImageChange(index, e)}
              multiple
              accept="image/*"
              className="w-full text-gray-700"
            />
          </div>
        </div>
      ))}

      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={handleAddSubject}
          className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-300"
        >
          Thêm Môn Học
        </button>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 mt-4"
      >
        {loading ? 'Đang Gửi...' : 'Gửi Báo Bài'}
      </button>
      {message && (
        <p className={`mt-4 text-center ${message.startsWith('Lỗi') ? 'text-red-500' : 'text-green-500'}`}>
          {message}
        </p>
      )}
    </form>
  </div>
);
}