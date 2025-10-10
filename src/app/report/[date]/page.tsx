// app/report/[date]/page.tsx
"use client";

import HomeButton from "@/components/HomeButton";
import { useEffect, useState } from "react";
import Image from "next/image";

interface SubjectEntry {
  subjectName: string;
  content: string;
  imageUrls: string[];
}

interface HomeworkReport {
  id: number;
  reportDate: string;
  isImportant: boolean;
  SubjectEntry: SubjectEntry[];
}

function normalizeDateParam(dateParam: string) {
  return dateParam.split("T")[0];
}

export default function ReportPage({ params }: { params: { date: string } }) {
  const [reports, setReports] = useState<HomeworkReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [displayDate, setDisplayDate] = useState("");

  useEffect(() => {
    async function fetchReports() {
      try {
        const dateToFetch = normalizeDateParam(params.date);
        setDisplayDate(dateToFetch);

        const response = await fetch(`/api/reports/${dateToFetch}`);

        if (response.ok) {
          const data = await response.json();
          setReports(Array.isArray(data) ? data : data ? [data] : []);
          setError(null);
        } else if (response.status === 404) {
          setReports([]);
          setError(null);
        } else {
          setError(`Lỗi khi tải báo cáo: ${response.statusText}`);
          setReports([]);
        }
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setError("Không thể kết nối đến server để tải báo cáo.");
        setReports([]);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [params.date]);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
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
        <h1 className="text-3xl font-bold text-center my-8">
          Báo bài ngày {displayDate}
        </h1>
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
        {reports.some((item) => item.isImportant) && (
          <p className="text-red-600 font-semibold text-center mb-4 text-xl">
            🚨 Đây là ngày quan trọng!
          </p>
        )}

        {reports.map((reportItem) =>
          reportItem.SubjectEntry.map((entry, subjectIndex) => (
            <div
              key={`${reportItem.id}-${subjectIndex}`}
              className="mb-6 p-4 border border-gray-200 rounded-lg shadow-sm last:mb-0"
            >
              <h2 className="text-xl font-bold text-blue-600 mb-2">
                {entry.subjectName}
              </h2>
              <p className="text-gray-700 mb-2 whitespace-pre-wrap">
                {entry.content}
              </p>

              {entry.imageUrls.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-4 justify-center">
                  {entry.imageUrls.map((url, imgIndex) => (
                    <div
                      key={`${reportItem.id}-${subjectIndex}-${imgIndex}`}
                      className="relative cursor-pointer hover:opacity-80 transition-opacity duration-200"
                      onClick={() => handleImageClick(url)}
                    >
                      <img
                        src={url}
                        alt={`Ảnh minh họa ${imgIndex + 1} của môn ${entry.subjectName}`}
                        className="max-w-full h-auto rounded-lg shadow-md max-h-60 object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )),
        )}
      </div>

      {modalOpen && selectedImage && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="relative bg-white p-2 rounded-lg shadow-xl max-w-3xl max-h-full overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-700 bg-white border border-gray-300 rounded-full p-1 hover:bg-gray-100 z-10 shadow-md"
              onClick={handleCloseModal}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <Image
              src={selectedImage}
              alt="Ảnh phóng to"
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
