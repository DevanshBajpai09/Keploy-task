import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Notification Integration Tests', () => {
  afterAll(async () => {
    await prisma.notification.deleteMany({
      where: { userId: 'test_user' },
    });
    await prisma.$disconnect();
  });

  test('should create a notification', async () => {
    const notification = await prisma.notification.create({
      data: {
        userId: 'test_user',
        message: 'Integration test message',
        type: 'inapp',
      },
    });

    expect(notification).toHaveProperty('id');
    expect(notification.userId).toBe('test_user');
  });
});
