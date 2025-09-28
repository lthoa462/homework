import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
    { params }: { params: Promise<{ date: string }> }
) {
  const {date} = await params;

  if (!date) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 });
  }

  const reportDate = new Date(date);
  const startOfDay = new Date(reportDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(reportDate);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const report = await prisma.homeworkReport.findMany({
      where: {
        reportDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        SubjectEntry: true,
      },
    });

    if (report.length === 0) {
      return NextResponse.json(
        { error: 'Report not found for this date' },
        { status: 404 }
      );
    }

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}
