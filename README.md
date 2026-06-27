# PPDB Portal - Sistem Penerimaan Peserta Didik Baru

![Status](https://img.shields.io/badge/status-development-yellow)
![Next.js](https://img.shields.io/badge/Next.js-14+-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-latest-336791)

Sistem pendaftaran online untuk penerimaan peserta didik baru yang transparan, aman, dan efisien.

## 🎯 Overview

PPDB Portal adalah solusi digital yang mengatasi masalah manual verification, calculation errors, dan kurangnya transparansi dalam proses penerimaan peserta didik baru di sekolah. Platform ini dirancang untuk memenuhi kebutuhan Pak Bambang (Ketua Panitia) dan calon siswa baru.

### Masalah Utama yang Diselesaikan
- ❌ Proses manual & human error → ✅ Kalkulasi skor otomatis
- ❌ Kerentanan manipulasi data → ✅ Verifikasi koordinat GPS real-time
- ❌ Kurangnya transparansi → ✅ Dashboard live ranking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm atau pnpm

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env.local
# Edit .env.local dengan database URL Anda

# 3. Setup database
npm run db:push

# 4. Start development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── api/                 # API Routes (REST endpoints)
│   │   ├── auth/            # Authentication
│   │   ├── registrations/   # CRUD pendaftaran
│   │   ├── rankings/        # Live ranking calculation
│   │   └── notifications/   # Notification system
│   ├── dashboard/           # Admin panel
│   ├── register/            # Formulir pendaftaran
│   ├── results/             # Pengumuman hasil
│   └── layout.tsx           # Root layout
├── components/              # Reusable UI components
├── context/                 # React Context for state
│   ├── AuthContext.tsx      # Authentication state
│   └── RegistrationContext.tsx
├── lib/                     # Utilities & helpers
│   ├── auth.ts              # NextAuth configuration
│   ├── db.ts                # Drizzle database
│   └── utils.ts             # Helper functions
└── styles/                  # Global styles

drizzle/
├── schema.ts                # Database schema (Drizzle ORM)
└── migrations/              # Auto-generated migrations
```

## 🗄️ Database Schema

### Core Tables
- **users** - Users (admin & applicant)
- **schools** - Sekolah tujuan
- **registration_pathways** - Jalur prestasi, zonasi, afirmasi
- **registrations** - Data pendaftar
- **documents** - Upload berkas (KK, Akta, Sertifikat)
- **selection_results** - Hasil akhir & ranking
- **notifications** - Notifikasi sistem
- **audit_logs** - Audit trail transparansi

## 🔧 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/Paper
- **State**: React Context + Zustand
- **Database**: PostgreSQL + Drizzle ORM
- **Authentication**: NextAuth.js v5
- **Form**: React Hook Form + Zod validation
- **Development**: MCP (Model Context Protocol)

## 📋 Core Features (FR-01 to FR-05)

| ID | Fitur | Status |
|----|-------|--------|
| FR-01 | Formulir Daftar Online | 🚧 Skeleton |
| FR-02 | Upload Berkas & Nilai | 🚧 Skeleton |
| FR-03 | Info Kuota Tiap SMA | 🚧 Skeleton |
| FR-04 | Pengumuman Hasil Seleksi | 🚧 Skeleton |
| FR-05 | Notifikasi Jadwal | 🚧 Skeleton |

## 🔐 Authentication

Sistem menggunakan NextAuth.js v5 dengan:
- Email/Password authentication (credentials provider)
- Role-based access control (Admin / Applicant)
- JWT session management
- Secure password hashing dengan bcryptjs

```typescript
// Login
const session = await signIn('credentials', {
  email: 'user@example.com',
  password: 'password123',
});

// Check authentication
const session = await auth();
if (session?.user.role === 'admin') {
  // Admin-only features
}
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Get current session

### Registrations
- `GET /api/registrations` - List user registrations
- `POST /api/registrations` - Create registration
- `PUT /api/registrations/[id]` - Update registration
- `DELETE /api/registrations/[id]` - Delete registration

### Rankings
- `GET /api/rankings` - Get live rankings
- `POST /api/rankings/recalculate` - Recalculate rankings (admin)

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/[id]` - Mark as read

## 🎨 UI Components

Menggunakan **Shadcn/Paper** untuk komponen yang:
- Accessible (WCAG 2.1)
- Responsive di semua ukuran
- Customizable dengan Tailwind
- Production-ready

Komponen utama:
- Form inputs (text, select, textarea, file upload)
- Buttons (primary, secondary, danger)
- Cards & containers
- Tables (untuk dashboard)
- Modals & dialogs
- Navigation bars

## 🧠 State Management

### React Context
```typescript
// Authentication
const { user, isLoading, logout } = useAuth();

// Registration
const { currentRegistration, updateRegistration } = useRegistration();
```

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate migrations
npm run db:push      # Apply migrations
npm run db:studio    # Open Drizzle Studio
```

## 📝 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ppdb_db"

# NextAuth
NEXTAUTH_SECRET="random-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Optional: OAuth providers
GITHUB_ID=""
GITHUB_SECRET=""
GOOGLE_ID=""
GOOGLE_SECRET=""

# Optional: External services
RESEND_API_KEY=""
GOOGLE_MAPS_API_KEY=""
AWS_S3_BUCKET=""
```

## 🚢 Deployment

### Deploy ke Vercel (Recommended)
```bash
npm install -g vercel
vercel login
vercel deploy
```

### Deploy ke Railway/Render
1. Push code ke GitHub
2. Connect repository ke platform
3. Configure environment variables
4. Deploy otomatis on push

## 📚 Documentation

- [Database Schema](./drizzle/schema.ts) - Detailed table structures
- [API Documentation](./src/app/api/README.md) - Endpoint details
- [Component Library](./src/components/README.md) - UI component usage
- [Setup Guide](./.github/copilot-instructions.md) - Detailed setup

## 🤝 Contributing

Untuk berkontribusi pada project ini:
1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - feel free to use for your project

## 📞 Support

- 📧 Email: contact@ppdbportal.com
- 💬 Issues: GitHub Issues
- 📖 Docs: [Documentation Site]

---

**Made with ❤️ untuk memudahkan proses PPDB di Indonesia**

Status: 🚧 Development (v0.1.0-alpha)
