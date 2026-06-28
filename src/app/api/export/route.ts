import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { registrations } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'registrations';

    // Fetch registrations with relations
    let allRegistrations: any[] = [];

    if (type === 'registrations') {
      allRegistrations = await db.query.registrations.findMany({
        with: {
          user: true,
          school: true,
          pathway: true,
        },
      });
    } else if (type === 'verified') {
      allRegistrations = await db.query.registrations.findMany({
        where: eq(registrations.verification_status, 'verified'),
        with: {
          user: true,
          school: true,
          pathway: true,
        },
      });
    } else if (type === 'pending') {
      allRegistrations = await db.query.registrations.findMany({
        where: eq(registrations.verification_status, 'pending'),
        with: {
          user: true,
          school: true,
          pathway: true,
        },
      });
    } else if (type === 'accepted') {
      allRegistrations = await db.query.registrations.findMany({
        where: eq(registrations.selection_status, 'accepted'),
        with: {
          user: true,
          school: true,
          pathway: true,
        },
      });
    }

    // Transform data for export
    const exportData = allRegistrations.map((reg: any) => ({
      'No_Registrasi': reg.registration_number,
      'NISN': reg.nisn,
      'Nama_Lengkap': reg.user?.full_name || '',
      'Email': reg.user?.email || '',
      'No_HP': reg.user?.phone_number || '',
      'Tanggal_Lahir': reg.date_of_birth ? new Date(reg.date_of_birth).toISOString().split('T')[0] : '',
      'Jenis_Kelamin': reg.gender === 'M' ? 'Laki-laki' : 'Perempuan',
      'Alamat': reg.address || '',
      'Kota': reg.city || '',
      'Provinsi': reg.province || '',
      'Kode_Pos': reg.zipcode || '',
      'Sekolah': reg.school?.name || '',
      'Jalur': reg.pathway?.pathway_name || '',
      'Nilai_GPA': reg.gpa || '',
      'Total_Score': reg.total_score || '',
      'Ranking': reg.current_rank || '',
      'Status_Pendaftaran': reg.registration_status || '',
      'Status_Verifikasi': reg.verification_status || '',
      'Status_Seleksi': reg.selection_status || '',
      'Tanggal_Daftar': reg.created_at ? new Date(reg.created_at).toISOString().split('T')[0] : '',
    }));

    return NextResponse.json(exportData);
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: `Terjadi kesalahan: ${error.message}` },
      { status: 500 }
    );
  }
}
