# 📚 Dokumentasi Database PPDB Portal

## Overview

Database **PPDB Portal** menggunakan **PostgreSQL** melalui **Neon** (cloud PostgreSQL) dengan ORM **Drizzle**. Database ini menyimpan semua data yang berkaitan dengan sistem Penerimaan Peserta Didik Baru.

---

## 📊 Skema Database

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PPDB PORTAL DATABASE SCHEMA                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐     ┌─────────────────────┐     ┌───────────────────┐    │
│  │    USERS     │────│   REGISTRATIONS     │─────│    SCHOOLS       │    │
│  │  (auth/role) │     │  (calon peserta)    │     │   (sekolah)       │    │
│  └──────────────┘     └─────────────────────┘     └───────────────────┘    │
│         │                        │                         │                │
│         │                        │                         │                │
│         ▼                        ▼                         ▼                │
│  ┌──────────────┐     ┌─────────────────────┐     ┌───────────────────┐    │
│  │  AUDIT_LOGS  │     │     DOCUMENTS       │     │REGISTRATION_     │    │
│  │  (log aksi)  │     │  (berkas upload)     │     │PATHWAYS          │    │
│  └──────────────┘     └─────────────────────┘     │  (jalur daftar)   │    │
│                                                    └───────────────────┘    │
│                                       │                      │              │
│                                       ▼                      ▼              │
│                              ┌─────────────────────┐  ┌─────────────────┐   │
│                              │SELECTION_RESULTS    │  │ NOTIFICATIONS   │   │
│                              │ (hasil seleksi)     │  │ (notifikasi)    │   │
│                              └─────────────────────┘  └─────────────────┘   │
│                                       │                                       │
│                                       ▼                                       │
│                              ┌─────────────────────┐                        │
│                              │   PPDB_SCHEDULES    │                        │
│                              │  (jadwal acara)     │                        │
│                              └─────────────────────┘                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Penjelasan Tabel

### 1. 👤 `users` — Manajemen Pengguna

**Fungsi:** Menyimpan semua data pengguna sistem (admin dan pendaftar).

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | serial | Primary key |
| `email` | varchar(255) | Email unik untuk login |
| `password_hash` | text | Password yang sudah di-hash |
| `full_name` | varchar(255) | Nama lengkap |
| `phone_number` | varchar(20) | Nomor telepon |
| `role` | varchar(50) | Peran: `admin` atau `applicant` |
| `status` | varchar(50) | Status: `active`, `inactive`, `banned` |
| `created_at` | timestamp | Tanggal registrasi |
| `updated_at` | timestamp | Tanggal update terakhir |
| `last_login` | timestamp | Login terakhir |

**Relasi:**
- Satu `user` bisa memiliki banyak `registrations`
- Satu `user` bisa diverifikasi banyak `documents`
- Satu `user` bisa memiliki banyak `audit_logs`

---

### 2. 🏫 `schools` — Data Sekolah

**Fungsi:** Menyimpan informasi sekolah yang tersedia untuk pendaftaran.

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | serial | Primary key |
| `name` | varchar(255) | Nama sekolah |
| `npsn` | varchar(20) | Nomor Pokok Sekolah Nasional (unik) |
| `level` | varchar(50) | Jenjang: `SMP`, `SMA`, `SMK` |
| `address` | text | Alamat lengkap |
| `phone` | varchar(20) | Nomor telepon sekolah |
| `email` | varchar(255) | Email sekolah |
| `latitude` | decimal | Koordinat latitude |
| `longitude` | decimal | Koordinat longitude |
| `accreditation` | varchar(50) | Nilai akreditasi |
| `vision` | text | Visi sekolah |
| `mission` | text | Misi sekolah |

**Relasi:**
- Satu `school` bisa memiliki banyak `registration_pathways`
- Satu `school` bisa dipilih banyak `registrations`
- Satu `school` bisa memiliki banyak `selection_results`

---

### 3. 📝 `registration_pathways` — Jalur Pendaftaran

**Fungsi:** Mendefinisikan jalur pendaftaran yang tersedia di setiap sekolah.

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | serial | Primary key |
| `school_id` | integer | FK ke schools |
| `pathway_name` | varchar(100) | Nama jalur (Prestasi, Zonasi, Afirmasi) |
| `min_gpa` | decimal | IPK/Skor minimal |
| `max_distance_km` | decimal | Jarak maksimal (untuk zonasi) |
| `quota` | integer | Total kuotajumlah peserta |
| `available_quota` | integer | Sisa kuotakuota yang masih tersedia |
| `min_certificate_points` | integer | Poin sertifikat minimal (untuk prestasi) |
| `status` | varchar(50) | Status: `open`, `closed`, `full` |

**Jenis Jalur:**
- **Jalur Prestasi** — Berdasarkan nilai dan sertifikat
- **Jalur Zonasi** — Berdasarkan jarak rumah ke sekolah
- **Jalur Afirmasi** — Untuk keluarga tidak mampu

---

### 4. 📋 `registrations` — Pendaftaran Siswa

**Fungsi:** Menyimpan data pendaftaran calon peserta didik baru.

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | serial | Primary key |
| `user_id` | integer | FK ke users |
| `registration_number` | varchar(50) | Nomor pendaftaran (unik) |
| `nisn` | varchar(20) | Nomor Induk Siswa Nasional (unik) |

**Data Pribadi:**
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `date_of_birth` | timestamp | Tanggal lahir |
| `gender` | varchar(20) | Jenis kelamin: `M` atau `F` |
| `address` | text | Alamat tinggal |
| `city` | varchar(100) | Kota |
| `province` | varchar(100) | Provinsi |
| `zipcode` | varchar(10) | Kode pos |
| `latitude` | decimal | Koordinat rumah |
| `longitude` | decimal | Koordinat rumah |
| `location_verified` | boolean | Status verifikasi lokasi |

**Data Orang Tua:**
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `parent_name` | varchar(255) | Nama orang tua/wali |
| `parent_phone` | varchar(20) | HP orang tua |
| `parent_email` | varchar(255) | Email orang tua |

**Pilihan Sekolah:**
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `preferred_school_id` | integer | FK ke schools |
| `pathway_id` | integer | FK ke registration_pathways |

**Data Akademik:**
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `gpa` | decimal | Nilai rata-rata/IPK |
| `certificate_points` | integer | Total poin sertifikat |
| `total_score` | decimal | Skor total (IPK + sertifikat) |

**Status:**
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `registration_status` | varchar(50) | Status: `incomplete`, `submitted`, `verified`, `rejected` |
| `verification_status` | varchar(50) | Verifikasi: `pending`, `approved`, `rejected` |
| `selection_status` | varchar(50) | Seleksi: `pending`, `accepted`, `rejected`, `waitlist` |
| `current_rank` | integer | Peringkat sementara |
| `daftar_ulang_completed` | boolean | Status daftar ulang |

**Timestamp:**
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `submitted_at` | timestamp | Tanggal submit |
| `verified_at` | timestamp | Tanggal verifikasi |

---

### 5. 📄 `documents` — Berkas Pendukung

**Fungsi:** Menyimpan dokumen yang diupload oleh pendaftar.

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | serial | Primary key |
| `registration_id` | integer | FK ke registrations |
| `document_type` | varchar(100) | Jenis: `KK`, `Akta`, `Sertifikat`, `Raport`, dll |
| `file_path` | text | Path/lokasi file |
| `file_size` | integer | Ukuran file (bytes) |
| `mime_type` | varchar(100) | Tipe file (PDF, JPG, dll) |
| `verification_status` | varchar(50) | Status: `pending`, `approved`, `rejected` |
| `verified_by` | integer | FK ke users (admin yang verifikasi) |
| `verified_at` | timestamp | Tanggal verifikasi |
| `rejection_reason` | text | Alasan penolakan (jika ditolak) |

**Jenis Dokumen:**
- KK (Kartu Keluarga)
- Akta Kelahiran
- Ijazah/SKHUN
- Raport
- Sertifikat Prestasi
- Surat Keterangan Tidak Mampu (SKTM)
- Pas Foto

---

### 6. 🏆 `selection_results` — Hasil Seleksi

**Fungsi:** Menyimpan hasil akhir seleksi untuk setiap pendaftar.

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | serial | Primary key |
| `registration_id` | integer | FK ke registrations (unik) |
| `school_id` | integer | FK ke schools |
| `pathway_id` | integer | FK ke registration_pathways |
| `final_rank` | integer | Peringkat akhir |
| `final_score` | decimal | Skor akhir |
| `status` | varchar(50) | Hasil: `accepted`, `rejected`, `waitlist` |
| `announcement_date` | timestamp | Tanggal pengumuman |

---

### 7. 🔔 `notifications` — Notifikasi

**Fungsi:** Menyimpan notifikasi untuk pengguna.

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | serial | Primary key |
| `user_id` | integer | FK ke users |
| `title` | varchar(255) | Judul notifikasi |
| `message` | text | Isi pesan |
| `type` | varchar(50) | Tipe: `schedule`, `result`, `document`, `system` |
| `related_registration_id` | integer | FK ke registrations (opsional) |
| `is_read` | boolean | Sudah dibaca atau belum |
| `sent_at` | timestamp | Tanggal kirim |
| `read_at` | timestamp | Tanggal dibaca |

---

### 8. 📅 `ppdb_schedules` — Jadwal PPDB

**Fungsi:** Menyimpan jadwal dan tahapan PPDB.

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | serial | Primary key |
| `event_name` | varchar(255) | Nama acara |
| `description` | text | Deskripsi detail |
| `start_date` | timestamp | Tanggal mulai |
| `end_date` | timestamp | Tanggal selesai |
| `priority` | varchar(50) | Prioritas: `high`, `normal`, `low` |
| `notification_sent` | boolean | Notifikasi sudah dikirim |

**Contoh Jadwal:**
- Pendaftaran Online
- Verifikasi Berkas
- Pengumuman Hasil Seleksi
- Daftar Ulang

---

### 9. 📝 `audit_logs` — Log Audit

**Fungsi:** Mencatat semua aksi yang dilakukan pengguna (audit trail).

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | serial | Primary key |
| `user_id` | integer | FK ke users (yang melakukan aksi) |
| `action` | varchar(255) | Aksi: `CREATE`, `UPDATE`, `DELETE`, `VERIFY` |
| `table_name` | varchar(100) | Nama tabel yang diubah |
| `record_id` | integer | ID record yang diubah |
| `old_values` | jsonb | Data sebelum diubah |
| `new_values` | jsonb | Data setelah diubah |
| `ip_address` | varchar(45) | Alamat IP pengguna |
| `created_at` | timestamp | Waktu aksi |

---

## 🔗 Diagram Relasi

```
users (1)──────(M) registrations (M)──────(1) schools
   │                                    │
   │                                    │
   └──(M) audit_logs              (1)──┴──(M) registration_pathways
   │                                         │
   └──(M) documents (verified_by)           │
                                               │
(M) notifications ─────────── (1) registrations ──(M) documents
                                                       │
                                                       └──(1) selection_results
                                                              │
                                                              ├──(1) schools
                                                              └──(1) registration_pathways
```

---

## 📊 Statistic Summary

| Tabel | Fungsi Utama | Relasi Utama |
|-------|-------------|-------------|
| `users` | Authentication & Role | Registrations, AuditLogs |
| `schools` | Data Sekolah | Pathways, Registrations |
| `registration_pathways` | Jalur Pendaftaran | Schools, Registrations |
| `registrations` | Data Pendaftaran | Users, Schools, Documents |
| `documents` | Berkas Peserta | Registrations |
| `selection_results` | Hasil Akhir | Registrations, Schools |
| `notifications` | Pemberitahuan | Users |
| `ppdb_schedules` | Timeline PPDB | - |
| `audit_logs` | Audit Trail | Users |

---

## 🔒 Indexes & Performance

Database menggunakan index untuk optimasi query:

| Tabel | Index | Tujuan |
|-------|-------|--------|
| `users` | `email` (unique) | Login cepat |
| `schools` | `npsn` (unique) | Lookup sekolah |
| `registrations` | `nisn`, `registration_number` (unique) | Cek duplikat |
| `registrations` | `user_id`, `status` | Filter pendaftaran |
| `documents` | `registration_id`, `type` | Ambil dokumen |
| `notifications` | `user_id`, `is_read` | Ambil notif user |

---

## 🚀 API Endpoints Terkait

| Endpoint | Method | Tabel |
|----------|--------|-------|
| `/api/auth/*` | POST | `users` |
| `/api/schools/*` | GET | `schools`, `pathways` |
| `/api/registrations/*` | GET/POST/PUT | `registrations`, `documents` |
| `/api/documents/*` | GET/POST/DELETE | `documents` |
| `/api/daftar-ulang/*` | GET/POST | `registrations`, `notifications` |
| `/api/admin/*` | All | All tables |

---

## 📂 Alur Daftar Ulang & Upload Dokumen

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DAFTAR ULANG FLOW                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🎓 Student Dashboard                                                       │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────────────────┐                                               │
│  │  /dashboard/student/    │  ◄── Cek apakah diterima                        │
│  │  daftar-ulang            │                                               │
│  └──────────┬──────────────┘                                               │
│             │                                                                │
│             ▼                                                                │
│  ┌─────────────────────────┐                                               │
│  │  ✅ Syarat:              │                                               │
│  │  - selection_status =    │                                               │
│  │    'accepted'            │                                               │
│  │  - BELUM daftar_ulang    │                                               │
│  └──────────┬──────────────┘                                               │
│             │                                                                │
│             ▼                                                                │
│  ┌─────────────────────────┐                                               │
│  │  📄 Upload Dokumen       │  ◄── Pergi ke halaman                          │
│  │  Wajib:                  │      daftar-ulang                               │
│  │  - Ijazah               │                                               │
│  │  - Kartu Keluarga (KK)  │                                               │
│  │  - Akta Kelahiran       │                                               │
│  │  - Raport Semester 1-5  │                                               │
│  │  - Pas Foto 3x4          │                                               │
│  │  Opsional:               │                                               │
│  │  - Sertifikat Prestasi  │                                               │
│  └──────────┬──────────────┘                                               │
│             │                                                                │
│             ▼                                                                │
│  ┌─────────────────────────┐                                               │
│  │  💾 Simpan ke Storage    │                                               │
│  │  Path: /uploads/{file}   │  ◄── Local filesystem (Vercel: perlu S3)     │
│  └──────────┬──────────────┘                                               │
│             │                                                                │
│             ▼                                                                │
│  ┌─────────────────────────┐                                               │
│  │  🗄️ Simpan Metadata      │                                               │
│  │  Tabel: documents       │                                               │
│  │  - file_path            │                                               │
│  │  - file_size            │                                               │
│  │  - mime_type            │                                               │
│  │  - document_type        │                                               │
│  └──────────┬──────────────┘                                               │
│             │                                                                │
│             ▼                                                                │
│  ┌─────────────────────────┐                                               │
│  │  👤 Input Data Orang Tua │                                               │
│  │  - Nama lengkap         │                                               │
│  │  - No. HP              │                                               │
│  │  - Email (opsional)     │                                               │
│  └──────────┬──────────────┘                                               │
│             │                                                                │
│             ▼                                                                │
│  ┌─────────────────────────┐                                               │
│  │  ✅ Validasi             │                                               │
│  │  - Semua dokumen wajib   │                                               │
│  │    sudah diupload?       │                                               │
│  │  - Data orang tua lengkap│                                               │
│  └──────────┬──────────────┘                                               │
│             │                                                                │
│             ▼                                                                │
│  ┌─────────────────────────┐                                               │
│  │  🎯 Submit Daftar Ulang │                                               │
│  │  POST /api/daftar-ulang │                                               │
│  └──────────┬──────────────┘                                               │
│             │                                                                │
│             ▼                                                                │
│  ┌─────────────────────────┐                                               │
│  │  📝 Update Database      │                                               │
│  │  registrations:         │                                               │
│  │  - parent_name          │                                               │
│  │  - parent_phone         │                                               │
│  │  - daftar_ulang_        │                                               │
│  │    completed = true     │                                               │
│  └──────────┬──────────────┘                                               │
│             │                                                                │
│             ▼                                                                │
│  ┌─────────────────────────┐                                               │
│  │  🔔 Buat Notifikasi      │                                               │
│  │  'Pendaftaran Ulang      │                                               │
│  │   Completed'            │                                               │
│  └─────────────────────────┘                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 📍 Lokasi Penyimpanan File

| Environment | Path | Keterangan |
|-------------|------|------------|
| **Local Dev** | `public/uploads/{filename}` | Local filesystem |
| **Vercel** | ❌ Ephemeral | File akan hilang setelah deploy |

### ⚠️ Rekomendasi untuk Production

Untuk deployment production (Vercel), gunakan cloud storage:

1. **AWS S3** - `src/lib/storage.ts` sudah ada template-nya
2. **Cloudinary** - Untuk image optimization
3. **Supabase Storage** - Integrasi mudah dengan PostgreSQL
4. **Vercel Blob** - Native Vercel solution

### 📄 Struktur Dokumen

| document_type | Deskripsi | Required |
|---------------|-----------|----------|
| `Ijazah` | Ijazah/SKHUN | ✅ Ya |
| `KK` | Kartu Keluarga | ✅ Ya |
| `Akta` | Akta Kelahiran | ✅ Ya |
| `Raport` | Raport Semester 1-5 | ✅ Ya |
| `Foto` | Pas Foto 3x4 | ✅ Ya |
| `Sertifikat` | Sertifikat Prestasi | ❌ Tidak |

### 🔗 API Endpoints

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/documents` | GET | Ambil daftar dokumen pendaftar |
| `/api/documents` | POST | Upload dokumen baru |
| `/api/documents` | DELETE | Hapus dokumen |
| `/api/daftar-ulang` | GET | Cek status daftar ulang |
| `/api/daftar-ulang` | POST | Submit daftar ulang |

---

## ☁️ Cloudflare R2 Storage Setup

### Apa itu R2?

**Cloudflare R2** adalah storage object yang S3-compatible dan **GRATIS**:
- 10GB storage per bulan
- 1 juta Class A ops/bulan
- **Egress FREE** (tidak ada biaya download!)

### 📝 Langkah Setup (5 menit)

#### 1. Buat Account Cloudflare
Buka [dash.cloudflare.com](https://dash.cloudflare.com) dan daftar (tanpa credit card).

#### 2. Buat R2 Bucket
```
1. Di sidebar, klik "Workers & Pages"
2. Klik "R2" -> "Create Bucket"
3. Name: ppdb-documents
4. Klik "Create Bucket"
```

#### 3. Buat API Token
```
1. Di R2 page, klik "Manage API Tokens"
2. Klik "Create Token"
3. Template: "Edit" ( untuk Object Read and Write)
4. Buat token dengan nama: "PPDB Portal"
5. Copy:
   - Access Key ID
   - Secret Access Key
```

#### 4. Get Account ID
```
1. Di dashboard Cloudflare, klik avatar/profile
2. Klik "My Profile" -> "Overview"
3. Scroll down, Copy "Account ID"
```

#### 5. Update .env.local
```env
R2_ACCOUNT_ID="xxxxxxxxxxxxxxxxxxxxx"      # 32 char ID dari Cloudflare
R2_ACCESS_KEY_ID="xxxxxxxxxxxxxxxxxxxx"    # Dari API Token
R2_SECRET_ACCESS_KEY="xxxxxxxxxxxxxxxxxx"  # Dari API Token
R2_BUCKET_NAME="ppdb-documents"
```

#### 6. (Optional) Setup Public Domain
```
1. Workers & Pages -> R2 -> Your Bucket
2. Settings -> Custom Domain
3. Add domain: files.yourdomain.com
4. Update .env.local:
   R2_PUBLIC_URL="https://files.yourdomain.com"
```

### 🔧 Verifikasi Setup

```bash
npm run dev
# Buka http://localhost:3000
# Upload dokumen di halaman daftar ulang
# Cek R2 dashboard -> bucket -> object list
```

### 📂 Struktur File di R2

```
ppdb-documents/
├── 1/
│   ├── Ijazah-1234567890-abc.pdf
│   ├── KK-1234567891-def.pdf
│   ├── Akta-1234567892-ghi.pdf
│   ├── Raport-1234567893-jkl.pdf
│   └── Foto-1234567894-mno.jpg
└── 2/
    └── ...
```

### 💰 Biaya

| Komponen | Free Tier | Biaya |
|----------|-----------|-------|
| Storage | 10 GB/bulan | $0.015/GB |
| Class A Ops | 1 juta/bulan | $0.30/juta |
| Class B Ops | 10 juta/bulan | $0.36/juta |
| Egress | Unlimited | **GRATIS!** |

### 🔄 Fallback (Local Storage)

Jika R2 belum dikonfigurasi, sistem otomatis fallback ke local storage:
```
public/uploads/
```

⚠️ **Catatan:** Local storage tidak persistent di Vercel (file hilang saat redeploy).

---

## 📁 Storage Utility (`src/lib/storage.ts`)

Module untuk mengelola upload dan storage file.

```typescript
import { saveFile, deleteFile, validateFile, getStorageInfo } from '@/lib/storage';

// Check storage provider
const info = getStorageInfo();
console.log(`Provider: ${info.provider}`);
console.log(`Configured: ${info.configured}`);

// Upload file (auto-detect R2 or local)
const result = await saveFile(file, registrationId, documentType);
if (result.success) {
  console.log(`Uploaded: ${result.url}`);
}

// Delete file
await deleteFile(result.url);

// Validate file before upload
const validation = validateFile(file);
if (!validation.valid) {
  throw new Error(validation.error);
}
```

---

*Document generated: 2026-06-30*
*Last updated: 2026-06-30 (Cloudflare R2 Storage)*
*Database: Neon PostgreSQL (AWS ap-southeast-1)*
*Storage: Cloudflare R2 (S3-compatible)*
