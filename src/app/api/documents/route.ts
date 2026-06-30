import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { documents, registrations } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { saveFile, deleteFile } from '@/lib/storage';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get('registrationId');

    if (!registrationId) {
      return NextResponse.json(
        { error: 'Missing registrationId' },
        { status: 400 }
      );
    }

    // Verify registration belongs to user
    const registration = await db.query.registrations.findFirst({
      where: eq(registrations.id, parseInt(registrationId)),
    });

    if (!registration || registration.user_id !== parseInt((session.user as any).id)) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    const userDocuments = await db.query.documents.findMany({
      where: eq(documents.registration_id, parseInt(registrationId)),
    });

    return NextResponse.json(userDocuments);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const registrationId = formData.get('registrationId') as string;
    const documentType = formData.get('documentType') as string;

    if (!file || !registrationId || !documentType) {
      return NextResponse.json(
        { error: 'Missing required fields: file, registrationId, documentType' },
        { status: 400 }
      );
    }

    // Validate document type
    const validTypes = ['KK', 'Akta', 'Sertifikat', 'Raport', 'Ijazah', 'Foto'];
    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: `Invalid document type. Allowed: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify registration belongs to user
    const registration = await db.query.registrations.findFirst({
      where: eq(registrations.id, parseInt(registrationId)),
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    if (registration.user_id !== parseInt((session.user as any).id)) {
      return NextResponse.json(
        { error: 'Unauthorized access to this registration' },
        { status: 403 }
      );
    }

    // Check if registration is accepted
    if (registration.selection_status !== 'accepted') {
      return NextResponse.json(
        { error: 'Registration must be accepted before uploading documents' },
        { status: 400 }
      );
    }

    // Check if user already has this document type uploaded
    const existingDocs = await db.query.documents.findMany({
      where: eq(documents.registration_id, parseInt(registrationId)),
    });

    const existingDoc = existingDocs.find(d => d.document_type === documentType);
    if (existingDoc) {
      // Delete old file
      await deleteFile(existingDoc.file_path);
      // Delete old record
      await db.delete(documents).where(eq(documents.id, existingDoc.id));
    }

    // Save file
    const saveResult = await saveFile(file, parseInt(registrationId), documentType);

    if (!saveResult.success || !saveResult.url) {
      return NextResponse.json(
        { error: saveResult.error || 'Failed to save file' },
        { status: 500 }
      );
    }

    // Store document record in database
    const result = await db
      .insert(documents)
      .values({
        registration_id: parseInt(registrationId),
        document_type: documentType,
        file_path: saveResult.url,
        file_size: saveResult.size || file.size,
        mime_type: file.type,
        verification_status: 'pending',
      })
      .returning();

    return NextResponse.json(
      {
        message: 'Document uploaded successfully',
        document: result[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Missing documentId' },
        { status: 400 }
      );
    }

    // Get document
    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, parseInt(documentId)),
      with: {
        registration: true,
      },
    });

    if (!doc || doc.registration.user_id !== parseInt((session.user as any).id)) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check if daftar ulang already completed
    if (doc.registration.daftar_ulang_completed) {
      return NextResponse.json(
        { error: 'Cannot delete document after daftar ulang is completed' },
        { status: 400 }
      );
    }

    // Delete file from storage
    await deleteFile(doc.file_path);

    // Delete database record
    await db.delete(documents).where(eq(documents.id, parseInt(documentId)));

    return NextResponse.json({
      message: 'Document deleted successfully',
      documentId: parseInt(documentId)
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
