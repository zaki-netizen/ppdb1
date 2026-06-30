import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { notifications, users, registrations } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 500);
    const offset = parseInt(searchParams.get('offset') || '0');

    const userNotifications = await db.query.notifications.findMany({
      where: eq(notifications.user_id, parseInt((session.user as any).id)),
      orderBy: desc(notifications.sent_at),
      limit,
      offset,
    });

    const total = await db.query.notifications.findMany({
      where: eq(notifications.user_id, parseInt((session.user as any).id)),
    });

    return NextResponse.json({
      data: userNotifications,
      total: total.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Missing notificationId' },
        { status: 400 }
      );
    }

    // Verify notification belongs to user
    const notification = await db.query.notifications.findFirst({
      where: eq(notifications.id, parseInt(notificationId)),
    });

    if (!notification || notification.user_id !== parseInt((session.user as any).id)) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Mark as read
    const updated = await db
      .update(notifications)
      .set({
        is_read: true,
        read_at: new Date(),
      })
      .where(eq(notifications.id, parseInt(notificationId)))
      .returning();

    return NextResponse.json({
      message: 'Notification marked as read',
      notification: updated[0],
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, message, target } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    // Get users based on target
    let usersToNotify: any[] = [];

    if (target === 'all') {
      usersToNotify = await db.query.users.findMany({
        where: eq(users.role, 'applicant'),
      });
    } else if (target === 'pending') {
      // Get users with pending registrations
      const pendingRegs = await db.query.registrations.findMany({
        where: eq(registrations.verification_status, 'pending'),
      });
      const userIds = [...new Set(pendingRegs.map((r) => r.user_id))];
      usersToNotify = userIds.map((id) => ({ id }));
    } else if (target === 'verified') {
      // Get users with verified registrations
      const verifiedRegs = await db.query.registrations.findMany({
        where: eq(registrations.verification_status, 'verified'),
      });
      const userIds = [...new Set(verifiedRegs.map((r) => r.user_id))];
      usersToNotify = userIds.map((id) => ({ id }));
    }

    // Create notifications for each user
    const notificationData = usersToNotify.map((user) => ({
      user_id: user.id,
      title,
      message,
      type: 'system',
      sent_at: new Date(),
    }));

    if (notificationData.length > 0) {
      await db.insert(notifications).values(notificationData);
    }

    return NextResponse.json({
      message: 'Notifications sent successfully',
      count: notificationData.length,
    });
  } catch (error: any) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { error: `Terjadi kesalahan: ${error.message}` },
      { status: 500 }
    );
  }
}
