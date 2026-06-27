# 🚀 PPDB Portal - Deployment Guide

Panduan lengkap untuk deploy PPDB Portal ke Vercel.

---

## Prerequisites

1. **Node.js 18+** terinstall
2. **GitHub account**
3. **Vercel account** (signup di https://vercel.com)
4. **PostgreSQL database** (Vercel Postgres atau provider lain)

---

## Step 1: Install Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login ke Vercel
vercel login
```

---

## Step 2: Setup PostgreSQL Database

### Option A: Vercel Postgres (Recommended)

1. Buka https://vercel.com/dashboard
2. Klik **Storage** → **Create Database**
3. Pilih **Postgres**
4. Pilih region: **Singapore (Southeast Asia)** untuk Indonesia
5. Copy connection URL

### Option B: External PostgreSQL

Gunakan provider seperti:
- **Neon** (https://neon.tech) - Free tier available
- **Supabase** (https://supabase.com) - Free tier available
- **Railway** (https://railway.app)

---

## Step 3: Setup Environment Variables

1. Copy `.env.example` ke `.env.local`
```bash
cp .env.example .env.local
```

2. Edit `.env.local` dengan nilai sebenarnya:

```env
# Database (dari Step 2)
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# NextAuth Secret (generate dengan command di bawah)
NEXTAUTH_SECRET="your-32-char-secret-key"
NEXTAUTH_URL="https://your-project.vercel.app"
```

### Generate NEXTAUTH_SECRET:

```bash
# Windows (PowerShell)
Add-Type -AssemblyName System.Web
[System.Web.Security.Membership]::GeneratePassword(32, 4)

# Mac/Linux
openssl rand -base64 32
```

---

## Step 4: Push Database Schema

Pastikan schema database sudah ter-sync:

```bash
# Install dependencies
npm install

# Push schema to database
npm run db:push

# (Optional) Load demo data
npm run seed
```

---

## Step 5: Deploy ke Vercel

### Option A: Via Vercel CLI

```bash
# Navigate ke project folder
cd ppdb1

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

Ikuti prompts:
- Set up and deploy? → **Yes**
- Which scope? → Pilih account Anda
- Link to existing project? → **No**
- Project name? → `ppdb-portal`
- Directory? → **./**
- Override settings? → **No**

### Option B: Via GitHub Integration

1. **Push code ke GitHub:**
```bash
# Initialize git (jika belum)
git init
git add .
git commit -m "Initial commit - PPDB Portal"
git branch -M main
git remote add origin https://github.com/username/ppdb-portal.git
git push -u origin main
```

2. **Import ke Vercel:**
- Buka https://vercel.com/new
- Klik **Import Git Repository**
- Pilih repository `ppdb-portal`
- Configure Project:
  - Framework: **Next.js**
  - Root Directory: `./`
  - Build Command: `npm run build`
- Add Environment Variables:
  - `DATABASE_URL` → paste dari Step 2
  - `NEXTAUTH_SECRET` → paste dari Step 3
  - `NEXTAUTH_URL` → `https://ppdb-portal.vercel.app` (ganti dengan URL Anda)
- Click **Deploy**

---

## Step 6: Configure Production Environment Variables di Vercel

1. Buka https://vercel.com/dashboard
2. Pilih project `ppdb-portal`
3. Klik **Settings** → **Environment Variables**
4. Tambahkan semua variable:

| Name | Value | Environments |
|------|-------|--------------|
| `DATABASE_URL` | `postgresql://...` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | `your-secret` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://ppdb-portal.vercel.app` | Production, Preview, Development |

5. Klik **Save**

6. **Redeploy** untuk apply changes:
- Buka **Deployments**
- Klik **...** pada deployment terbaru
- Pilih **Redeploy**

---

## Step 7: Verify Deployment

Setelah deployment selesai:

1. Buka URL production (contoh: `https://ppdb-portal.vercel.app`)
2. Test login dengan demo account:
   - Admin: `admin@ppdb.test` / `admin123`
   - Student: `ahmad@student.test` / `password123`

---

## Custom Domain (Optional)

1. Buka **Settings** → **Domains**
2. Masukkan domain Anda (contoh: `ppdb.sekolahku.sch.id`)
3. Ikuti instruksi untuk configure DNS
4. Update `NEXTAUTH_URL` dengan domain baru

---

## Troubleshooting

### Error: "Cannot find module 'pg'"

```bash
npm install pg
```

### Error: "Connection refused"

- Pastikan `DATABASE_URL` sudah benar
- Pastikan database allow connections dari Vercel IP
- Untuk Vercel Postgres, sudah otomatis configured

### Error: "NextAuth Error:"

- Pastikan `NEXTAUTH_SECRET` sudah di-set
- Pastikan `NEXTAUTH_URL` sesuai dengan URL production

### Error: "Database schema not found"

Jalankan:
```bash
npm run db:push
```

---

## CI/CD Setup

Dengan GitHub integration, deployment otomatis setiap push ke branch `main`.

1. Push changes ke branch
2. Vercel otomatis build & deploy ke preview
3. Merge ke `main` → otomatis deploy ke production

---

## Monitoring

- **Vercel Analytics**: https://vercel.com/analytics
- **Function Logs**: Project → Functions → Select function
- **Database**: Vercel Storage → Postgres

---

## Security Checklist

- [ ] `NEXTAUTH_SECRET` di-set dengan nilai unik
- [ ] `DATABASE_URL` tidak di-commit ke git
- [ ] Environment variables hanya di-set di Vercel dashboard
- [ ] `.env.local` ada di `.gitignore`

---

## Demo Production URLs

Setelah berhasil deploy, demo accounts akan seperti:

```
Admin:    admin@ppdb.test / admin123
Student:   ahmad@student.test / password123
```

URL: `https://your-project.vercel.app`

---

**Happy Deployment! 🎉**
