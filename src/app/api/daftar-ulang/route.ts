import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { registrations, documents, notifications } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

interface DaftarUlangRequest {
  registrationId: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  documentTypes: string[]; // List of uploaded document types
}

const REQUIRED_DOCUMENTS = ['Ijazah', 'KK', 'Raport', 'Foto'];

export async function POST(request: Request) {
  try {
    const body: DaftarUlangRequest = await request.json();
    const { registrationId, parentName, parentPhone, parentEmail, documentTypes } = body;

    if (!registrationId) {
      return NextResponse.json({ error: 'Registration ID diperlukan' }, { status: 400 });
    }

    if (!parentName?.trim()) {
      return NextResponse.json({ error: 'Nama orang tua wajib diisi' }, { status: 400 });
    }

    if (!parentPhone?.trim()) {
      return NextResponse.json({ error: 'No. HP orang tua wajib diisi' }, { status: 400 });
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

    // Check if already completed
    if (registration.daftar_ulang_completed) {
      return NextResponse.json({ error: 'Pendaftaran ulang sudah pernah dilakukan' }, { status: 400 });
    }

    // Validate required documents
    if (documentTypes && documentTypes.length > 0) {
      const missingDocs = REQUIRED_DOCUMENTS.filter(doc => !documentTypes.includes(doc));
      if (missingDocs.length > 0) {
        return NextResponse.json({
          error: `Dokumen wajib belum lengkap. Missing: ${missingDocs.join(', ')}`
        }, { status: 400 });
      }
    } else {
      // Check documents in database
      const uploadedDocs = await db.query.documents.findMany({
        where: eq(documents.registration_id, regId),
      });

      const uploadedTypes = uploadedDocs.map(d => d.document_type);
      const missingDocs = REQUIRED_DOCUMENTS.filter(doc => !uploadedTypes.includes(doc));

      if (missingDocs.length > 0) {
        return NextResponse.json({
          error: `Dokumen wajib belum diupload. Missing: ${missingDocs.join(', ')}`,
          missingDocuments: missingDocs
        }, { status: 400 });
      }
    }

    // Update registration with daftar ulang data
    await db.update(registrations)
      .set({
        parent_name: parentName.trim(),
        parent_phone: parentPhone.trim(),
        parent_email: parentEmail?.trim() || null,
        daftar_ulang_completed: true,
        updated_at: new Date(),
      })
      .where(eq(registrations.id, regId));

    // Create notification
    await db.insert(notifications).values({
      user_id: registration.user_id,
      title: '🎉 Pendaftaran Ulang Completed',
      message: `Pendaftaran ulang untuk ${registration.registration_number} telah berhasil diselesaikan.`,
      type: 'system',
      sent_at: new Date(),
    });

    return NextResponse.json({
      message: 'Pendaftaran ulang berhasil!',
      daftar_ulang_completed: true,
      registration: {
        id: registration.id,
        registration_number: registration.registration_number,
        parent_name: parentName.trim(),
        parent_phone: parentPhone.trim(),
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Daftar ulang error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// GET - Check daftar ulang status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get('registrationId');

    if (!registrationId) {
      return NextResponse.json({ error: 'Registration ID diperlukan' }, { status: 400 });
    }

    const regId = parseInt(registrationId);

    const registration = await db.query.registrations.findFirst({
      where: eq(registrations.id, regId),
    });

    if (!registration) {
      return NextResponse.json({ error: 'Pendaftaran tidak ditemukan' }, { status: 404 });
    }

    // Get uploaded documents
    const uploadedDocs = await db.query.documents.findMany({
      where: eq(documents.registration_id, regId),
    });

    const uploadedTypes = uploadedDocs.map(d => d.document_type);

    return NextResponse.json({
      registration: {
        id: registration.id,
        registration_number: registration.registration_number,
        selection_status: registration.selection_status,
        daftar_ulang_completed: registration.daftar_ulang_completed,
        parent_name: registration.parent_name,
        parent_phone: registration.parent_phone,
      },
      documents: {
        uploaded: uploadedTypes,
        required: REQUIRED_DOCUMENTS,
        missing: REQUIRED_DOCUMENTS.filter(doc => !uploadedTypes.includes(doc)),
        uploadedDetails: uploadedDocs
      }
    });

  } catch (error) {
    console.error('Get daftar ulang status error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}