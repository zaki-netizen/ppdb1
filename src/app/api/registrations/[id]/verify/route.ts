import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { registrations } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });
    }

    const registrationId = parseInt(id);

    // Update registration status
    const updateData: any = {
      updated_at: new Date(),
    };

    if (status === 'verified') {
      updateData.verification_status = 'verified';
      updateData.verified_at = new Date();
      updateData.registration_status = 'verified';
    } else if (status === 'rejected') {
      updateData.verification_status = 'rejected';
      updateData.registration_status = 'rejected';
    }

    const result = await db
      .update(registrations)
      .set(updateData)
      .where(eq(registrations.id, registrationId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Pendaftaran tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Status berhasil diupdate',
      data: result[0],
    });
  } catch (error: any) {
    console.error('Error updating registration:', error);
    return NextResponse.json(
      { error: `Terjadi kesalahan: ${error.message}` },
      { status: 500 }
    );
  }
}
