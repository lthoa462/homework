// app/report/[date]/page.tsx
'use client';

import HomeButton from '@/components/HomeButton';
import { useEffect, useState } from 'react';
import Image from 'next/image'; // Sử dụng Image component của Next.js

// --- Định nghĩa Types (Interfaces) ---


interface SubjectEntry {
  subjectName: string;
  content: string;
  imageUrls: string[]; // Vẫn là mảng URL ảnh
}

interface HomeworkReport {
  id: number;
  reportDate: string; 
  isImportant: boolean;
  SubjectEntry: SubjectEntry[]; 
}

// --- Component chính ---

export default function  ReportPage({ params }: { params: Promise<{ date: string }> }) {
  const [reports, setReports] = useState<HomeworkReport[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State để quản lý ảnh được click và hiển thị trong modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [displayDate, setDisplayDate] = useState<string|null>("")

  useEffect(() => {


    async function fetchReports() {
      try {
        const param = await params;
        
        const dateToFetch = param.date.split('T')[0]; 
        setDisplayDate(dateToFetch);
        const response = await fetch(`/api/reports/${dateToFetch}`);
        
        if (response.ok) {
          const data = await response.json();
          // API GET /api/reports/:date trả về MẢNG các báo cáo cho ngày đó
          // Điều chỉnh logic: nếu API trả về một mảng, chúng ta setReports trực tiếp
          // Nếu API trả về một object duy nhất, bạn cần bọc nó trong mảng: setReports([data]);
          // Dựa trên "API GET: Lấy danh sách ngày có báo bài" và "if (data && data.length > 0)", 
          // có vẻ API GET /api/reports/:date của bạn trả về một MẢNG.
          if (Array.isArray(data)) {
            setReports(data); 
          } else { // Trường hợp API chỉ trả về một object, bọc nó trong mảng
            setReports(data ? [data] : []);
          }
        } else if (response.status === 404) {
            setReports([]); // Không tìm thấy báo cáo
            setError(null); // Xóa lỗi nếu chỉ là không tìm thấy
        }
        else {
          setError(`Lỗi khi tải báo cáo: ${response.statusText}`);
          setReports([]);
        }
      } catch (err) {
        console.error('Failed to fetch reports:', err);
        setError('Không thể kết nối đến server để tải báo cáo.');
        setReports([]);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, [params]); 

  // Hàm xử lý khi click vào ảnh nhỏ
  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    // setModalOpen(true);
  };

  // Hàm đóng modal
  const  handleCloseModal = async () => {
    setModalOpen(false);
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">Đang tải báo bài...</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="w-full p-4 mx-auto max-w-xl">
        <HomeButton />
        <h1 className="text-3xl font-bold text-center my-8">Báo bài ngày {displayDate}</h1>
        {error ? (
            <p className="text-center text-lg text-red-600">{error}</p>
        ) : (
            <p className="text-center text-lg text-gray-500">
                Không có báo bài cho ngày này.
            </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full p-4 mx-auto max-w-xl">
      <HomeButton />
      
      <h1 className="text-3xl md:text-4xl font-bold text-center my-8">
        Báo bài ngày {displayDate}
      </h1>
      
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        {reports.some(item => item.isImportant) && (
          <p className="text-red-600 font-semibold text-center mb-4 text-xl">
            🚨 Đây là ngày quan trọng!
          </p>
        )}
        
        {reports.length > 0 ? (
          reports.map(reportItem => ( // Lặp qua từng báo cáo nếu có nhiều báo cáo trong ngày
            reportItem.SubjectEntry.map((entry: SubjectEntry, subjectIndex: number) => (
              <div key={`${reportItem.id}-${subjectIndex}`} className="mb-6 p-4 border border-gray-200 rounded-lg shadow-sm last:mb-0">
                <h2 className="text-xl font-bold text-blue-600 mb-2">{entry.subjectName}</h2>
                <p className="text-gray-700 mb-2 whitespace-pre-wrap">{entry.content}</p>
                
                {entry.imageUrls.length > 0 && (
                  <div className="flex flex-wrap gap-4 mt-4 justify-center">
                    {entry.imageUrls.map((url: string, imgIndex: number) => (
                      <div 
                        key={`${reportItem.id}-${subjectIndex}-${imgIndex}`}
                        className="relative cursor-pointer hover:opacity-80 transition-opacity duration-200"
                        onClick={() => handleImageClick(url)} // Thêm onClick vào đây
                      >
                       <img key={imgIndex} src={url} alt={`Ảnh minh họa ${imgIndex + 1} của môn ${entry.subjectName}`} className="max-w-full h-auto rounded-lg shadow-md max-h-60 object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ))
        ) : (
          <p className="text-center text-gray-500">Không có môn học nào được ghi nhận.</p>
        )}
      </div>

      {/* Modal/Lightbox Component */}
      {modalOpen && selectedImage && (
        <div 
          // Không còn làm tối toàn bộ nền, nhưng vẫn cố định và căn giữa
          className="fixed inset-0 flex items-center justify-center z-50 p-4" 
          onClick={handleCloseModal} // Đóng modal khi click ra ngoài nội dung ảnh
        >
          <div 
            className="relative bg-white p-2 rounded-lg shadow-xl max-w-3xl max-h-full overflow-auto"
            onClick={(e) => e.stopPropagation()} // Ngăn chặn sự kiện click lan truyền ra ngoài
          >
            <button
              className="absolute top-2 right-2 text-gray-700 bg-white border border-gray-300 rounded-full p-1 hover:bg-gray-100 z-10 shadow-md" // Nút đóng màu sắc sáng hơn
              onClick={handleCloseModal}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <Image
              src={selectedImage}
              alt="Ảnh phóng to"
              layout="responsive"
              width={800} 
              height={600}
              className="rounded-lg"
              priority 
            />
          </div>
        </div>
      )}
    </div>
  );
}