# 📊 PPDB PORTAL - Materi Presentasi

## 1. Gambaran Umum

**PPDB Portal** adalah sistem informasi berbasis web untuk penerimaan peserta didik baru yang transparan, aman, dan efisien.

### Tujuan:
- Digitalisasi proses pendaftaran siswa baru
- Transparansi hasil seleksi
- Informasi real-time untuk pendaftar

---

## 2. Teknologi yang Digunakan

### Frontend
| Teknologi | Fungsi |
|-----------|--------|
| **Next.js 14** | Framework React |
| **TypeScript** | Type-safe coding |
| **Tailwind CSS** | Styling modern |
| **Shadcn/UI** | Komponen UI siap pakai |

### Backend & Database
| Teknologi | Fungsi |
|-----------|--------|
| **Neon PostgreSQL** | Database cloud |
| **Drizzle ORM** | Query builder |
| **NextAuth v5** | Authentication |
| **Cloudflare R2** | File storage |

### Deployment
| Platform | Fungsi |
|-----------|--------|
| **Vercel** | Hosting frontend & API |
| **GitHub** | Version control |

---

## 3. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                        USER (Browser)                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend)                         │
│                   https://ppdb1.vercel.app                   │
├─────────────────────────────────────────────────────────────┤
│  Next.js App Router                                         │
│  ├── /login, /register (Public)                           │
│  ├── /dashboard/student (Protected)                       │
│  └── /dashboard/admin (Protected)                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Routes                              │
│  ├── /api/auth/* → NextAuth (Login)                        │
│  ├── /api/registrations/* → CRUD Pendaftaran               │
│  ├── /api/documents/* → Upload File                       │
│  └── /api/daftar-ulang/* → Proses Daftar Ulang             │
└───────┬─────────────────────────────────┬─────────────────┘
        │                                 │
        ▼                                 ▼
┌───────────────────┐           ┌───────────────────┐
│  NEON POSTGRESQL  │           │ CLOUDFLARE R2     │
│  (Database)       │           │ (File Storage)     │
│  ~50 tables       │           │ Dokumen upload     │
└───────────────────┘           └───────────────────┘
```

---

## 4. Fitur Utama

### A. Pendaftaran Online
```
✅ Form registrasi dengan validasi
✅ Pilihan sekolah & jalur pendaftaran
✅ Input data akademik (IPK/skor)
✅ Upload dokumen pendukung
```

### B. Verifikasi Admin
```
✅ Dashboard admin untuk review
✅ Approve/reject pendaftaran
✅ Ranking otomatis berdasarkan skor
```

### C. Hasil Seleksi
```
✅ Pengumuman hasil real-time
✅ Status: Diterima, Ditolak, Daftar Tunggu
✅ Ranking per jalur pendaftaran
```

### D. Daftar Ulang
```
✅ Upload dokumen wajib (Ijazah, KK, Akta, Raport, Foto)
✅ Simpan data orang tua
✅ Status kelengkapan
```

---

## 5. Database Schema

### Tabel Utama:

| Tabel | Fungsi |
|-------|--------|
| `users` | Data user (admin/student) |
| `schools` | Daftar sekolah |
| `registration_pathways` | Jalur pendaftaran |
| `registrations` | Data pendaftaran siswa |
| `documents` | Berkas upload |
| `notifications` | Notifikasi |
| `audit_logs` | Log aktivitas |

### Relasi:
```
users (1)───(M) registrations (M)───(1) schools
                        │
                        ├──(M) documents
                        └──(1) selection_results
```

---

## 6. Jalur Pendaftaran

| Jalur | Kriteria |
|-------|----------|
| **Prestasi** | Berdasarkan nilai akademik & sertifikat |
| **Zonasi** | Berdasarkan jarak rumah ke sekolah |
| **Afirmasi** | Untuk keluarga tidak mampu |

---

## 7. Keamanan

| Fitur | Implementasi |
|-------|-------------|
| **Password** | bcrypt hashing |
| **Session** | JWT dengan NextAuth |
| **File Upload** | Validasi tipe & ukuran |
| **API** | Protected routes |

---

## 8. Alur Pendaftaran

```
1. Registrasi Akun
       ↓
2. Login ke Portal
       ↓
3. Pilih Sekolah & Jalur
       ↓
4. Isi Formulir Pendaftaran
       ↓
5. Upload Dokumen
       ↓
6. Submit Pendaftaran
       ↓
7. Verifikasi oleh Admin
       ↓
8. Pengumuman Hasil
       ↓
9. Daftar Ulang (jika diterima)
```

---

## 9. Screenshots Flow

### Login Page
- Form email & password
- Redirect berdasarkan role (admin/student)

### Dashboard Student
- Status pendaftaran
- Ranking
- Tombol daftar ulang

### Cek Hasil
- Status seleksi (Diterima/Ditolak)
- Timeline proses

### Daftar Ulang
- Upload dokumen wajib
- Form data orang tua

---

## 10. Keunggulan Sistem

| Keunggulan | Penjelasan |
|------------|-----------|
| **Real-time** | Data update langsung |
| **Transparent** | Siswa bisa cek status sendiri |
| **Efficient** | Proses digital, tanpa antrian |
| **Scalable** | Cloud-based infrastructure |
| **Secure** | Authentication & authorization |

---

## 11. Demo Account

| Role | Email | Password |
|------|-------|---------|
| Admin | admin@ppdb.test | admin123 |
| Student | ahmad@student.test | password123 |

**URL:** https://ppdb1.vercel.app

---

## 12. Rencana Pengembangan

- [ ] Email notification
- [ ] Payment gateway
- [ ] Mobile app
- [ ] Analytics dashboard
- [ ] SMS integration

---

## 13. Q&A

Pertanyaan yang mungkin ditanyakan:

**Q: Berapa biaya operasional?**
A: ~$0 (Neon free tier + R2 free tier + Vercel hobby)

**Q: Apakah bisa handle banyak user?**
A: Ya, Vercel auto-scale

**Q: Bagaimana jika ada sengketa?**
A: Admin bisa edit data, ada audit log

---

**Terima Kasih! 🙏**

*Presentasi ini dibuat: 2026-07-01*
