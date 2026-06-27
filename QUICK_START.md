# 🚀 QUICK START GUIDE - PPDB Portal

Panduan lengkap mulai dari setup hingga running aplikasi (10-15 menit).

## 📋 Checklist

- [ ] Node.js & npm installed
- [ ] PostgreSQL installed & running
- [ ] Project downloaded
- [ ] Dependencies installed
- [ ] Database created
- [ ] Migrations applied
- [ ] Seed data loaded
- [ ] Environment configured
- [ ] Dev server running
- [ ] Login with demo account

---

## ⚡ STEP-BY-STEP SETUP

### Step 1: Verify Prerequisites (2 min)

**Check Node.js:**
```bash
node --version    # Should be 18+
npm --version     # Should be 9+
```

**Check PostgreSQL:**
```bash
psql --version    # Should show version
```

If missing, install from:
- Node.js: https://nodejs.org
- PostgreSQL: https://postgresql.org/download

---

### Step 2: Create Database & User (3 min)

```bash
# Start PostgreSQL
# Windows: net start postgresql-x64-15
# Mac: brew services start postgresql@15
# Linux: sudo systemctl start postgresql

# Connect as admin
psql -U postgres

# Copy-paste these commands:
CREATE DATABASE ppdb_db;
CREATE USER ppdb_user WITH PASSWORD 'ppdb_password';
ALTER DATABASE ppdb_db OWNER TO ppdb_user;
\q
```

---

### Step 3: Setup Environment Variables (1 min)

```bash
# Copy the example env file
cp .env.example .env.local

# Edit .env.local and set these values:
# DATABASE_URL="postgresql://ppdb_user:ppdb_password@localhost:5432/ppdb_db"
# NEXTAUTH_SECRET="any-random-string-here-at-least-32-chars"
# NEXTAUTH_URL="http://localhost:3000"
```

---

### Step 4: Install Dependencies (3 min)

```bash
npm install
```

Wait for completion. This downloads all required packages (~300MB).

---

### Step 5: Apply Database Migrations (1 min)

```bash
npm run db:push
```

This creates all tables in the database based on the schema.

---

### Step 6: Load Sample Data (Optional, 1 min)

```bash
npm run seed
```

Creates:
- 1 admin: `admin@ppdb.test` / `admin123`
- 3 sample students
- 3 schools
- 5 registration pathways

---

### Step 7: Start Development Server (< 1 min)

```bash
npm run dev
```

You'll see:
```
  ▲ Next.js 14.2.3
  - Local:        http://localhost:3000
```

---

### Step 8: Test the App! 🎉

**Open in Browser:** http://localhost:3000

**Login with demo account:**
- Email: `admin@ppdb.test`
- Password: `admin123`

---

## 🧪 Verify Everything Works

### Test 1: Check Database Connection
```bash
npm run db:test
```

Expected: ✅ Database connection successful!

### Test 2: Check Migrations
```bash
psql -U ppdb_user -d ppdb_db -c "\dt"
```

Expected: Lists all 9 tables (users, schools, registrations, etc)

### Test 3: Test Seed Data
```bash
psql -U ppdb_user -d ppdb_db -c "SELECT COUNT(*) FROM users;"
```

Expected: Shows 4 if seeded (1 admin + 3 students)

---

## 🔗 Available URLs

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Home page |
| http://localhost:3000/login | Login |
| http://localhost:3000/register | New registration |
| http://localhost:3000/dashboard | Admin dashboard |
| http://localhost:3000/results | View results |

---

## 🛠️ Useful Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Generate migrations (after schema.ts changes)
npm run db:generate

# Apply migrations to database
npm run db:push

# Open Drizzle Studio (visual DB editor)
npm run db:studio

# Reseed database
npm run seed

# Test DB connection
npm run db:test

# Run linter
npm run lint
```

---

## ❌ Common Issues & Fixes

### "Error: connect ECONNREFUSED"
PostgreSQL not running
```bash
# Windows
net start postgresql-x64-15

# Mac
brew services start postgresql@15
```

### "password authentication failed"
Wrong DATABASE_URL in .env.local
```bash
# Check your password matches
psql -U ppdb_user -d ppdb_db -c "SELECT 1"
```

### "database does not exist"
Database wasn't created
```bash
psql -U postgres -c "CREATE DATABASE ppdb_db;"
```

### "Error: Command not found: npm"
Node.js not installed
- Download from https://nodejs.org
- Restart terminal after install

### Port 3000 already in use
```bash
# Find process using port 3000
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -i :3000

# Kill it or use different port:
npm run dev -- -p 3001
```

---

## 📁 Project Structure

```
ppdb1/
├── src/
│   ├── app/          # Next.js pages & API routes
│   ├── components/   # Reusable UI components
│   ├── context/      # React Context (Auth, Registration)
│   └── lib/          # Database, auth config, utilities
├── drizzle/          # Database schema & migrations
├── scripts/          # Utility scripts (seed, test, setup)
├── .env.local        # Environment variables (created by you)
├── package.json      # Dependencies
└── README.md         # Full documentation
```

---

## 📚 Next Steps After Setup

1. **Explore Admin Dashboard:**
   - Login with admin account
   - Check stats and recent registrations
   - Test "Hitung Ranking" button

2. **Test Registration Flow:**
   - Register as new student
   - Fill multi-step form
   - Submit registration

3. **Check Database:**
   - Run `npm run db:studio`
   - Visually inspect tables
   - Verify data structure

4. **Build Features:**
   - Implement API endpoints
   - Add file upload
   - Build notification system
   - Add real-time ranking

---

## 🎯 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ppdb.test | admin123 |
| Student 1 | ahmad@student.test | password123 |
| Student 2 | siti@student.test | password123 |
| Student 3 | budi@student.test | password123 |

---

## 🚨 Before Production

- [ ] Change NEXTAUTH_SECRET to strong random value
- [ ] Update DATABASE_URL for production DB
- [ ] Set up email provider (Resend/SendGrid)
- [ ] Setup Google Maps API
- [ ] Enable file upload (AWS S3 or local)
- [ ] Configure CORS if needed
- [ ] Setup environment-specific configs
- [ ] Run security audit
- [ ] Test all API endpoints
- [ ] Deploy to Vercel/Railway

---

## 📞 Getting Help

**Database Issues?**
- Check SETUP_DATABASE.md file

**Code Questions?**
- Check README.md

**Schema Changes?**
- Edit `drizzle/schema.ts`
- Run `npm run db:generate`
- Run `npm run db:push`

**Still stuck?**
- Check database is running: `pg_isready`
- Check .env.local exists: `cat .env.local`
- Check migrations applied: `npm run db:test`

---

## 🎉 Ready to Code!

You now have:
✅ Running Next.js app
✅ PostgreSQL database with 9 tables
✅ Authentication system
✅ Sample data
✅ API route structure
✅ UI pages ready to customize

**Happy coding!** 🚀
