import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { selection_results, registrations } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const nisn = searchParams.get('nisn') || (q && !q.includes('REG-') ? q : null);
    const registrationNumber = searchParams.get('registrationNumber') || (q && q.includes('REG-') ? q : null);

    if (!nisn && !registrationNumber) {
      return NextResponse.json(
        { error: 'Parameter pencarian diperlukan (NISN atau No. Registrasi)' },
        { status: 400 }
      );
    }

    // Find registration by NISN or registration number
    let registration = null;

    if (nisn) {
      registration = await db.query.registrations.findFirst({
        where: eq(registrations.nisn, nisn),
        with: {
          user: true,
          school: true,
          pathway: true,
        },
      });
    }

    if (!registration && registrationNumber) {
      registration = await db.query.registrations.findFirst({
        where: eq(registrations.registration_number, registrationNumber),
        with: {
          user: true,
          school: true,
          pathway: true,
        },
      });
    }

    if (!registration) {
      return NextResponse.json({ results: [] });
    }

    // Get selection result for this registration
    const result = await db.query.selection_results.findFirst({
      where: eq(selection_results.registration_id, registration.id),
      with: {
        school: true,
        pathway: true,
      },
    });

    return NextResponse.json({
      results: [{
        ...registration,
        selection_result: result,
      }],
    });
  } catch (error) {
    console.error('Error searching results:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}