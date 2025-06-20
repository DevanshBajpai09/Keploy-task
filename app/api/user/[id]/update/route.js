import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req) {
  try {
    const { notificationId, newMessage } = await req.json();

    await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        message: newMessage,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
