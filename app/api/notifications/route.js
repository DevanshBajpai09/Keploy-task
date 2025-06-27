import { prisma } from "@/lib/prisma.js";
import { sendNotificationToQueue } from "@/lib/rabbitmqProducer.js";
import { NextResponse } from "next/server";
import { z } from "zod";

const notificationSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  message: z.string().min(1, "message is required"),
  type: z.enum(["email", "sms", "in-app"], { required_error: "type is required" }),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = notificationSchema.safeParse(body);

    if (!parsed.success) {
      const errorMessages = parsed.error.errors.map((e) => e.message);
      return NextResponse.json(
        { status: "fail", message: "Validation error", errors: errorMessages },
        { status: 400 }
      );
    }

    const { userId, message, type, email, phone } = parsed.data;

    const notification = await prisma.notification.create({
      data: { userId, message, type },
    });

    await sendNotificationToQueue({ userId, message, type, email, phone });

    return NextResponse.json(
      { status: "success", message: "Notification created", data: notification },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
