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
            title: 'Có báo bài',
            date: report.reportDate.split('T')[0],
            backgroundColor: 'green',
            borderColor: 'green'
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
      <Link href="/report-input" passHref legacyBehavior>
          <button
              className={`py-2 px-4 rounded-lg text-white font-semibold shadow-md transition duration-200 
                  bg-indigo-600 hover:bg-indigo-700
              `}
          >
              ➕ Nhập Báo Bài
          </button>
      </Link>
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
                info.el.style.color = 'white';
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