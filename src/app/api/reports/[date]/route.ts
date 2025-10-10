import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildUtcDateRange, normalizeToUtcDate } from "@/lib/date";

export async function GET(
  _request: NextRequest,
  { params }: { params: { date: string } },
) {
  const { date } = params;

  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  const normalizedDate = normalizeToUtcDate(date);
  if (!normalizedDate) {
    return NextResponse.json({ error: "Invalid date provided" }, { status: 400 });
  }

  const { start, end } = buildUtcDateRange(normalizedDate);

  try {
    const report = await prisma.homeworkReport.findMany({
      where: {
        reportDate: {
          gte: start,
          lt: end,
        },
      },
      include: {
        SubjectEntry: true,
      },
      orderBy: { id: "asc" },
    });

    if (report.length === 0) {
      return NextResponse.json(
        { error: "Report not found for this date" },
        { status: 404 },
      );
    }

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 },
    );
  }
}
