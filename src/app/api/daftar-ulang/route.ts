import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { registrations, notifications } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const registrationId = body.registrationId as string;

    if (!registrationId) {
      return NextResponse.json({ error: 'Registration ID diperlukan' }, { status: 400 });
    }

    const regId = parseInt(registrationId);

    // Check if registration exists and is accepted
    const registration = await db.query.registrations.findFirst({
      where: eq(registrations.id, regId),
    });

    if (!registration) {
      return NextResponse.json({ error: 'Pendaftaran tidak ditemukan' }, { status: 404 });
    }

    if (registration.selection_status !== 'accepted') {
      return NextResponse.json({ error: 'Hanya untuk pendaftar yang diterima' }, { status: 400 });
    }

    // Update registration with daftar ulang completed status
    await db.update(registrations)
      .set({
        daftar_ulang_completed: true,
        updated_at: new Date(),
      })
      .where(eq(registrations.id, regId));

    // Create notification
    await db.insert(notifications).values({
      user_id: registration.user_id,
      title: 'Pendaftaran Ulang Completed',
      message: 'Pendaftaran ulang telah dilengkapi.',
      type: 'system',
      sent_at: new Date(),
    });

    return NextResponse.json({
      message: 'Pendaftaran ulang berhasil!',
      daftar_ulang_completed: true,
    }, { status: 201 });

  } catch (error) {
    console.error('Daftar ulang error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 });
  }
}