import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { registrations, users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Debug API - Check what data exists for ahmad@student.test
 * GET /api/test/debug-registrations
 */

export async function GET() {
  try {
    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, 'ahmad@student.test'),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get registrations WITHOUT relations first
    const regsNoRelations = await db.query.registrations.findMany({
      where: eq(registrations.user_id, user.id),
    });

    // Get registrations WITH relations
    const regsWithRelations = await db.query.registrations.findMany({
      where: eq(registrations.user_id, user.id),
      with: {
        user: true,
        school: true,
        pathway: true,
      },
    });

    // Get all schools
    const allSchools = await db.query.schools.findMany();

    // Get all pathways
    const allPathways = await db.query.registration_pathways.findMany();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
      registrations_no_relations: regsNoRelations,
      registrations_with_relations: regsWithRelations,
      all_schools_count: allSchools.length,
      all_pathways_count: allPathways.length,
      sample_school: allSchools[0] || null,
      sample_pathway: allPathways[0] || null,
    });
  } catch (error: any) {
    console.error('[DEBUG] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
