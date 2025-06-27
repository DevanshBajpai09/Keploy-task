import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validate the request body using Zod
const updateSchema = z.object({
  notificationId: z.string().min(1, "notificationId is required"),
  newMessage: z.string().min(1, "newMessage cannot be empty"),
});

export async function PATCH(req) {
  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

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

    const { notificationId, newMessage } = parsed.data;

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

    const updated = await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        message: newMessage,
      },
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Notification updated successfully",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
