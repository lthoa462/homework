// app/report/[date]/page.tsx
'use client';

import { useEffect, useState } from 'react';

interface ReportPageProps {
  params: {
    date: string;
  };
}

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

export default function ReportPage({ params }: ReportPageProps) {
  const [reports, setReports] = useState<HomeworkReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { date } = params;

    async function fetchReports() {
      try {
        const response = await fetch(`/api/reports/${date}`);
        if (response.ok) {
          const data = await response.json();
          setReports(data);
        } else {
          setReports([]);
        }
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, [params]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">Đang tải...</p>
      </div>
    );
  }

  const date = params.date;
  if (!reports || reports.length === 0) {
    return (
      <div className="w-full p-4 mx-auto max-w-xl">
        <h1 className="text-3xl font-bold text-center my-8">Báo bài ngày {date}</h1>
        <p className="text-center text-lg text-gray-500">
          Không có báo bài cho ngày này.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full p-4 mx-auto max-w-xl">
      <h1 className="text-3xl md:text-4xl font-bold text-center my-8">
        Báo bài ngày {date}
      </h1>
      {reports.map((report, reportIndex) => (
        <div key={report.id || reportIndex} className="bg-white p-6 rounded-xl shadow-lg mb-6">
          {report.isImportant && (
            <p className="text-red-600 font-semibold text-center mb-4">
              Đây là ngày quan trọng!
            </p>
          )}
          {report.SubjectEntry.length > 0 ? (
            report.SubjectEntry.map((entry: SubjectEntry, subjectIndex: number) => (
              <div key={subjectIndex} className="mb-6 p-4 border border-gray-200 rounded-lg shadow-sm last:mb-0">
                <h2 className="text-xl font-bold text-blue-600 mb-2">{entry.subjectName}</h2>
                <p className="text-gray-700 mb-2">{entry.content}</p>
                {entry.imageUrls.length > 0 && (
                  <div className="flex flex-wrap gap-4 mt-4">
                    {entry.imageUrls.map((url: string, imgIndex: number) => (
                      <img
                        key={imgIndex}
                        src={url}
                        alt={`Ảnh minh họa ${imgIndex + 1}`}
                        className="max-w-full h-auto rounded-lg shadow-md"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">Không có môn học nào.</p>
          )}
        </div>
      ))}
    </div>
  );
}