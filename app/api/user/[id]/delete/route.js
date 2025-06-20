import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // adjust the path based on your actual setup

export async function DELETE(req) {
  try {
    const { notificationId } = await req.json();

    await prisma.notification.delete({
      where: {
        id: notificationId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
