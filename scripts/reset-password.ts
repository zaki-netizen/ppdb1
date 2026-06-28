require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');
const bcrypt = require('bcryptjs');

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  status: string;
  has_password: boolean;
}

async function resetPassword() {
  console.log('🔑 Reset Password PPDB Portal\n');

  try {
    // Reset Admin Password
    const adminPassword = await bcrypt.hash('admin123', 10);
    await sql`
      UPDATE users
      SET password_hash = ${adminPassword}, updated_at = NOW()
      WHERE email = 'admin@ppdb.test'
    `;
    console.log('✅ Admin password reset:');
    console.log('   Email: admin@ppdb.test');
    console.log('   Password: admin123\n');

    // Reset Student Password
    const studentPassword = await bcrypt.hash('password123', 10);
    await sql`
      UPDATE users
      SET password_hash = ${studentPassword}, updated_at = NOW()
      WHERE email = 'ahmad@student.test'
    `;
    console.log('✅ Student password reset:');
    console.log('   Email: ahmad@student.test');
    console.log('   Password: password123\n');

    // List all users
    console.log('📋 Semua Akun di Database:\n');
    const users: User[] = await sql`
      SELECT id, email, full_name, role, status, password_hash IS NOT NULL as has_password
      FROM users
      ORDER BY id
    `;

    users.forEach((u: User, i: number) => {
      console.log(`${i + 1}. ${u.email}`);
      console.log(`   Nama: ${u.full_name}`);
      console.log(`   Role: ${u.role}`);
      console.log(`   Password: ${u.has_password ? '✅ Ada' : '❌ Tidak ada'}`);
      console.log('');
    });

    console.log('🎉 Password berhasil di-reset!');
  } catch (error: unknown) {
    console.error('❌ Error:', (error as Error).message);
  } finally {
    await sql.end();
  }
}

resetPassword();