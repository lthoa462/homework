import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET() {
  try {
    const today = startOfDay(new Date());
    const rangeStart = new Date(today);
    rangeStart.setDate(rangeStart.getDate() - 6);

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      reportsThisWeek,
      importantReports,
      usageByDayRaw,
      recentUsers,
      topSubjects
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'active' } }),
      prisma.user.count({ where: { NOT: { status: 'active' } } }),
      prisma.homeworkReport.count({
        where: {
          reportDate: {
            gte: rangeStart,
            lte: today
          }
        }
      }),
      prisma.homeworkReport.count({ where: { isImportant: true } }),
      prisma.homeworkReport.groupBy({
        by: ['reportDate'],
        where: {
          reportDate: {
            gte: rangeStart,
            lte: today
          }
        },
        _count: { _all: true },
        orderBy: {
          reportDate: 'asc'
        }
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
          status: true,
          createdAt: true
        }
      }),
      prisma.subjectEntry.groupBy({
        by: ['subjectName'],
        _count: { _all: true },
        orderBy: {
          _count: {
            _all: 'desc'
          }
        },
        take: 5
      })
    ]);

    const usageByDay = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(rangeStart);
      date.setDate(rangeStart.getDate() + index);
      const match = usageByDayRaw.find((item) =>
        startOfDay(item.reportDate).getTime() === date.getTime()
      );

      return {
        date: date.toISOString(),
        count: match?._count._all ?? 0
      };
    });

    return NextResponse.json({
      totals: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        reportsThisWeek,
        importantReports
      },
      usageByDay,
      recentUsers,
      topSubjects: topSubjects.map((subject) => ({
        subject: subject.subjectName,
        count: subject._count._all
      }))
    });
  } catch (error) {
    console.error('Failed to load admin overview', error);
    return NextResponse.json(
      { message: 'Không thể tải dữ liệu tổng quan quản trị.' },
      { status: 500 }
    );
  }
}
