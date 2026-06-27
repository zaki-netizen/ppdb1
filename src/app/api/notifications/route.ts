import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { notifications } from '@/drizzle/schema';
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
      where: eq(notifications.user_id, parseInt(session.user.id as string)),
      orderBy: desc(notifications.sent_at),
      limit,
      offset,
    });

    const total = await db.query.notifications.findMany({
      where: eq(notifications.user_id, parseInt(session.user.id as string)),
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

    if (!notification || notification.user_id !== parseInt(session.user.id as string)) {
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
