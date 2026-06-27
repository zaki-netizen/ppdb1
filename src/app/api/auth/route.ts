import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { notifications } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userNotifications = await db.query.notifications.findMany({
      where: eq(notifications.user_id, parseInt(session.user.id as string)),
      orderBy: (notifications) => notifications.sent_at,
      limit: 50,
    });

    return NextResponse.json(userNotifications);
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
    const notificationId: number = body.notificationId;

    // Mark notification as read
    if (notificationId) {
      await db
        .update(notifications)
        .set({ is_read: true })
        .where(eq(notifications.id, notificationId));
    }

    return NextResponse.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}