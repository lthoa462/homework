import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Đảm bảo đường dẫn import đúng

// Hàm xử lý phương thức GET
export async function GET() {
  try {
    const schedules = await prisma.schedule.findMany({
      orderBy: { dayOfWeek: 'asc' },
    });
    return NextResponse.json(schedules, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
  }
}

// Hàm xử lý phương thức POST
export async function POST(req: Request) {
  try {
    const { dayOfWeek, subjectName, startTime, endTime } = await req.json();

    const newSchedule = await prisma.schedule.create({
      data: {
        dayOfWeek,
        subjectName,
        startTime: startTime ? new Date(`1970-01-01T${startTime}:00Z`) : null,
        endTime: endTime ? new Date(`1970-01-01T${endTime}:00Z`) : null,
      },
    });
    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
  }
}