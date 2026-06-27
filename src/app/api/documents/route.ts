import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { documents, registrations } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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

    if (!registration || registration.user_id !== parseInt(session.user.id as string)) {
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
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 413 }
      );
    }

    // Validate document type
    const validTypes = ['KK', 'Akta', 'Sertifikat', 'Raport'];
    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      );
    }

    // Verify registration belongs to user
    const registration = await db.query.registrations.findFirst({
      where: eq(registrations.id, parseInt(registrationId)),
    });

    if (!registration || registration.user_id !== parseInt(session.user.id as string)) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (e) {
      console.error('Error creating uploads directory:', e);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const filename = `${registrationId}-${documentType}-${timestamp}-${randomStr}.pdf`;
    const filepath = join(uploadsDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Store document record in database
    const result = await db
      .insert(documents)
      .values({
        registration_id: parseInt(registrationId),
        document_type: documentType,
        file_path: `/uploads/${filename}`,
        file_size: file.size,
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

    if (!doc || doc.registration.user_id !== parseInt(session.user.id as string)) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Delete file
    try {
      const filepath = join(process.cwd(), 'public', doc.file_path);
      // Note: In production, use fs.unlink() or delete from S3
      console.log('File deletion would occur at:', filepath);
    } catch (e) {
      console.error('Error deleting file:', e);
    }

    // Delete database record
    await db.delete(documents).where(eq(documents.id, parseInt(documentId)));

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
