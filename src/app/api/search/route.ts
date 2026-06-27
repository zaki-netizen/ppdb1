import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { selection_results, registrations } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nisn = searchParams.get('nisn');
    const registrationNumber = searchParams.get('registrationNumber');

    if (!nisn && !registrationNumber) {
      return NextResponse.json(
        { error: 'Either nisn or registrationNumber is required' },
        { status: 400 }
      );
    }

    // Find registration by NISN or registration number
    const registration = await db.query.registrations.findFirst({
      where: nisn
        ? eq(registrations.nisn, nisn)
        : registrationNumber
          ? eq(registrations.registration_number, registrationNumber)
          : undefined,
      with: {
        user: true,
        school: true,
        pathway: true,
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Get selection result for this registration
    const result = await db.query.selection_results.findFirst({
      where: eq(selection_results.registration_id, registration.id),
      with: {
        school: true,
        pathway: true,
      },
    });

    if (!result) {
      // Registration exists but no selection result yet
      return NextResponse.json({
        registration,
        result: null,
        message: 'Hasil seleksi belum tersedia',
      });
    }

    return NextResponse.json({
      registration,
      result,
    });
  } catch (error) {
    console.error('Error searching results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}