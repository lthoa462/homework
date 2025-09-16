// app/api/reports/[date]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const { date } =await params;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // `date` will be a string like '2025-09-16'. Convert it to a Date object.
    const reportDate = new Date(date);

    const report = await prisma.homeworkReport.findMany({
      where: {
        reportDate,
      },
      include: {
        SubjectEntry: true,
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found for this date' },
        { status: 404 }
      );
    }

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}