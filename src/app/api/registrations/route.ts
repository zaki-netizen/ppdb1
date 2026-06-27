import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { registrations } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRegistrations = await db.query.registrations.findMany({
      where: eq(registrations.user_id, parseInt(session.user.id as string)),
      with: {
        school: true,
        pathway: true,
      },
    });

    return NextResponse.json(userRegistrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
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

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['nisn', 'fullName', 'email', 'phone', 'gpa', 'preferredSchool', 'pathway', 'parentName', 'parentPhone'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Check if NISN already registered
    const existingRegistration = await db.query.registrations.findFirst({
      where: eq(registrations.nisn, body.nisn),
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'NISN already registered' },
        { status: 409 }
      );
    }

    // Generate unique registration number
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const registrationNumber = `REG-${timestamp}-${randomNum}`;

    // Calculate total score (gpa * 0.6 + certificate_points * 0.4)
    const totalScore = parseFloat(
      (parseFloat(body.gpa) * 0.6 + (body.certificatePoints || 0) * 0.4).toFixed(2)
    );

    // Insert registration
    const result = await db.insert(registrations).values({
      user_id: parseInt(session.user.id as string),
      nisn: body.nisn,
      registration_number: registrationNumber,
      full_name: body.fullName,
      date_of_birth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      gender: body.gender,
      email: body.email,
      phone: body.phone,
      address: body.address,
      city: body.city,
      province: body.province,
      zipcode: body.zipcode,
      latitude: body.latitude ? parseFloat(body.latitude) : null,
      longitude: body.longitude ? parseFloat(body.longitude) : null,
      parent_name: body.parentName,
      parent_phone: body.parentPhone,
      preferred_school_id: parseInt(body.preferredSchool),
      pathway_id: parseInt(body.pathway),
      gpa: parseFloat(body.gpa),
      certificate_points: parseInt(body.certificatePoints || 0),
      total_score: totalScore,
      registration_status: 'submitted',
      verification_status: 'pending',
      selection_status: 'pending',
      submitted_at: new Date(),
    }).returning();

    return NextResponse.json(
      {
        message: 'Registration created successfully',
        registration: result[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
