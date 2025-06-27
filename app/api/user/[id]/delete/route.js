import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Define schema
const deleteSchema = z.object({
  notificationId: z.string().min(1, "notificationId is required"),
});

export async function DELETE(req) {
  try {
    const body = await req.json();
    const parsed = deleteSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      return NextResponse.json(
        {
          status: "fail",
          message: "Validation error",
          errors,
        },
        { status: 400 }
      );
    }

    const { notificationId } = parsed.data;

    // Check existence
    const existing = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!existing) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Notification not found",
        },
        { status: 404 }
      );
    }

    await prisma.notification.delete({
      where: {
        id: notificationId,
      },
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Notification deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
