/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/reports/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SubjectEntry } from '@prisma/client';

type ReportInput = {
  reportDate: string;
  isImportant: boolean;
  subjectEntries: Omit<SubjectEntry, 'id' | 'reportId'>[];
  createdBy: number;
};

// API POST: Tạo báo bài mới
export async function POST(request: Request) {
  try {
    const { reportDate, isImportant, subjectEntries, createdBy } = (await request.json()) as ReportInput;

    const newReport = await prisma.homeworkReport.create({
      data: {
        reportDate: new Date(reportDate),
        isImportant,
        createdBy,
        SubjectEntry: {
          create: subjectEntries.map(entry => ({
            subjectName: entry.subjectName,
            content: entry.content,
            imageUrls: entry.imageUrls || [],
            isHomework: entry.isHomework
          })),
        },
      },
      include: {
        SubjectEntry: true,
      },
    });

    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}

// API PUT: Cập nhật báo bài
export async function PUT(request: Request) {
  try {
    const { id, isImportant, subjectEntries } = await request.json();

    // Lấy thông tin báo bài cũ để ghi log (nếu cần)
    const oldReport = await prisma.homeworkReport.findUnique({
      where: { id },
      include: { SubjectEntry: true },
    });

    if (!oldReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Xóa các SubjectEntry cũ liên quan đến báo bài này
    await prisma.subjectEntry.deleteMany({
      where: { reportId: id },
    });

    // Cập nhật báo bài chính và tạo SubjectEntry mới
    const updatedReport = await prisma.homeworkReport.update({
      where: { id },
      data: {
        isImportant,
        SubjectEntry: {
          create: subjectEntries.map((entry: any) => ({
            subjectName: entry.subjectName,
            content: entry.content,
            imageUrls: entry.imageUrls || [],
            isHomework: entry.isHomework,
          })),
        },
      },
      include: {
        SubjectEntry: true,
      },
    });

    return NextResponse.json(updatedReport, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}

// API GET: Lấy danh sách ngày có báo bài
export async function GET() {
  try {
    const reports = await prisma.homeworkReport.findMany({
      select: {
        reportDate: true,
        isImportant: true // Lấy thêm trường này để phân biệt ngày quan trọng
      },
    });

    const formattedReports = reports.map(report => ({
      reportDate: report.reportDate,
      isImportant: report.isImportant,
      // Thêm các trường khác cần thiết
    }));

    return NextResponse.json(formattedReports);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch report dates' }, { status: 500 });
  }
}