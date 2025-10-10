/* eslint-disable @typescript-eslint/no-explicit-any */
// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EventClickArg } from '@fullcalendar/core/index.js';

export default function HomePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchReports() {
      try {
        const response = await fetch('/api/reports');
        if (response.ok) {
          const data = await response.json();
          const formattedEvents = data.map((report: any) => ({
            title: report.isImportant ? 'Báo bài quan trọng' : 'Có báo bài',
            date: report.reportDate.split('T')[0],
            backgroundColor: report.isImportant ? '#dc2626' : '#16a34a',
            borderColor: report.isImportant ? '#dc2626' : '#16a34a',
            textColor: '#ffffff'
          }));
          setEvents(formattedEvents);
        }
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const handleDateClick = (info: any) => {
    const formattedDate = info.dateStr;
    router.push(`/report/${formattedDate}`);
  };
  const handleEventClick = (info: EventClickArg) => {
    // Hành vi khi click vào một sự kiện (ví dụ: "Có báo bài")
    const clickedDate = info.event.startStr; // Lấy ngày của sự kiện đã click
    router.push(`/report/${clickedDate}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold text-center my-8 text-gray-800">
        Lịch Báo Bài
      </h1>
      <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4">
        <Link href="/report-input" passHref legacyBehavior>
          <button
            className={`py-2 px-4 rounded-lg text-white font-semibold shadow-md transition duration-200
                  bg-indigo-600 hover:bg-indigo-700
              `}
          >
            ➕ Nhập Báo Bài
          </button>
        </Link>
      </div>
      <div className="mx-auto mt-4 w-full max-w-2xl px-4 md:max-w-3xl">
        <div className="flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-white/90 p-4 text-sm text-gray-700 shadow-md md:flex-row md:items-center md:justify-between">
          <div className="space-y-2 md:max-w-sm">
            <h2 className="text-base font-semibold text-gray-900">Giải thích ký hiệu lịch</h2>
            <p>
              Lịch sử dụng màu sắc để giúp bạn biết nhanh trạng thái của từng ngày báo bài.
              Những ngày không hiển thị nghĩa là chưa có báo bài được giao.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <span className="inline-flex h-3 w-3 rounded-full bg-[#16a34a]" aria-hidden />
              <div>
                <p className="text-sm font-medium text-gray-900">Có báo bài</p>
                <p className="text-xs text-gray-600">Ngày có báo bài thông thường.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <span className="inline-flex h-3 w-3 rounded-full bg-[#dc2626]" aria-hidden />
              <div>
                <p className="text-sm font-medium text-gray-900">Báo bài quan trọng</p>
                <p className="text-xs text-gray-600">Ngày cần ưu tiên hoặc nội dung quan trọng.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {loading ? (
        <p className="text-center">Đang tải lịch...</p>
      ) : (
        // Thêm div này để bao quanh lịch và đặt màu trắng
        <div className="flex-1 p-2 md:p-4">
          <div className="bg-white p-4 rounded-xl shadow-2xl h-full">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              eventDidMount={(info) => {
                info.el.style.backgroundColor = info.event.backgroundColor;
                info.el.style.borderColor = info.event.borderColor;
                info.el.style.color = info.event.textColor || 'white';
              }}
              height="auto"
              contentHeight="auto"
              titleFormat={{ year: 'numeric', month: '2-digit' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
