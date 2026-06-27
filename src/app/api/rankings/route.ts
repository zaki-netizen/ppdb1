import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { selection_results, registrations, registration_pathways } from '@/drizzle/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');
    const pathwayId = searchParams.get('pathwayId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);
    const offset = parseInt(searchParams.get('offset') || '0');

    const whereConditions = [];

    if (schoolId) {
      whereConditions.push(eq(selection_results.school_id, parseInt(schoolId)));
    }
    if (pathwayId) {
      whereConditions.push(eq(selection_results.pathway_id, parseInt(pathwayId)));
    }

    const results = await db.query.selection_results.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      orderBy: desc(selection_results.final_rank),
      limit,
      offset,
      with: {
        registration: true,
        school: true,
        pathway: true,
      },
    });

    const total = await db.query.selection_results.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
    });

    return NextResponse.json({
      data: results,
      total: total.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching rankings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const session = await auth();

    // Only admins can recalculate rankings
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can recalculate rankings' },
        { status: 403 }
      );
    }

    // Get all verified registrations grouped by pathway
    const verifiedRegistrations = await db.query.registrations.findMany({
      where: eq(registrations.registration_status, 'verified'),
      with: {
        pathway: true,
        school: true,
      },
    });

    // Clear existing selection results
    await db.delete(selection_results);

    // Group registrations by school + pathway
    const grouped: { [key: string]: typeof verifiedRegistrations } = {};
    verifiedRegistrations.forEach((reg) => {
      const key = `${reg.preferred_school_id}-${reg.pathway_id}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(reg);
    });

    // Calculate rankings for each group
    let createdCount = 0;
    for (const [key, regs] of Object.entries(grouped)) {
      // Sort by total_score descending
      const sorted = regs.sort(
        (a, b) => parseFloat(b.total_score as string) - parseFloat(a.total_score as string)
      );

      const [schoolId, pathwayId] = key.split('-').map(Number);

      // Get pathway quota
      const pathway = await db.query.registration_pathways.findFirst({
        where: eq(registration_pathways.id, pathwayId),
      });

      const quota = pathway?.quota || 100;

      // Create selection results one by one
      for (let i = 0; i < sorted.length; i++) {
        const reg = sorted[i];
        const rank = i + 1;
        const statusVal = rank <= quota ? 'accepted' : 'waitlist';

        // Insert using raw insert values
        await db.insert(selection_results).values({
          registration_id: reg.id,
          school_id: schoolId,
          pathway_id: pathwayId,
          final_rank: rank,
          final_score: String(reg.total_score),
          status: statusVal,
          announcement_date: new Date(),
        } as any);

        createdCount++;
      }
    }

    return NextResponse.json({
      message: 'Rankings recalculated successfully',
      totalRanked: createdCount,
    });
  } catch (error) {
    console.error('Error recalculating rankings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}