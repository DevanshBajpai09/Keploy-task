import { prisma } from "@/lib/prisma.js";
import { NextResponse } from "next/server";
import { z } from "zod";

// Helper to get userId from URL
function getUserIdFromUrl(req) {
  const parts = req.nextUrl.pathname.split("/");
  return parts[3] || null;
}

// Validation for PATCH body
const patchSchema = z.object({
  notificationId: z.string().optional(),
});

export async function GET(req) {
  const userId = getUserIdFromUrl(req);

  if (!userId) {
    return NextResponse.json(
      { status: "fail", message: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Notifications fetched",
        data: notifications,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  const userId = getUserIdFromUrl(req);

  if (!userId) {
    return NextResponse.json(
      { status: "fail", message: "User ID is required in URL" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      return NextResponse.json(
        {
          status: "fail",
          message: "Invalid request body",
          errors,
        },
        { status: 400 }
      );
    }

    if (parsed.data.notificationId) {
      const notif = await prisma.notification.findUnique({
        where: { id: parsed.data.notificationId },
      });

      if (!notif) {
        return NextResponse.json(
          { status: "fail", message: "Notification not found" },
          { status: 404 }
        );
      }

      const updatedNotification = await prisma.notification.update({
        where: { id: parsed.data.notificationId },
        data: { read: true },
      });

      return NextResponse.json(
        {
          status: "success",
          message: "Notification marked as read",
          data: updatedNotification,
        },
        { status: 200 }
      );
    } else {
      const result = await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });

      return NextResponse.json(
        {
          status: "success",
          message: `${result.count} notifications marked as read`,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error marking as read:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
