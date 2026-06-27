# ✅ DATABASE SETUP CHECKLIST

Complete checklist untuk setup PostgreSQL dan running aplikasi PPDB Portal.

---

## 📋 PRE-SETUP CHECKLIST

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm 9+ installed (`npm --version`)
- [ ] PostgreSQL 14+ installed (`psql --version`)
- [ ] PostgreSQL service running
- [ ] Project folder opened in VS Code
- [ ] Terminal access ready

---

## 🗄️ DATABASE CREATION CHECKLIST

### Step 1: Start PostgreSQL Service
- [ ] **Windows**: Run PowerShell as Admin
  ```powershell
  net start postgresql-x64-15
  ```
- [ ] **Mac**: 
  ```bash
  brew services start postgresql@15
  ```
- [ ] **Linux**:
  ```bash
  sudo systemctl start postgresql
  ```

### Step 2: Create Database & User
- [ ] Open terminal and run:
  ```bash
  psql -U postgres
  ```
- [ ] Copy-paste each line into psql:
  ```sql
  CREATE DATABASE ppdb_db;
  CREATE USER ppdb_user WITH PASSWORD 'ppdb_password';
  ALTER DATABASE ppdb_db OWNER TO ppdb_user;
  GRANT ALL PRIVILEGES ON SCHEMA public TO ppdb_user;
  \q
  ```
- [ ] Verify connection:
  ```bash
  psql -U ppdb_user -d ppdb_db -c "SELECT 1"
  ```

### Step 3: Verify Database
- [ ] [ ] Database `ppdb_db` exists
- [ ] [ ] User `ppdb_user` can connect
- [ ] [ ] User has proper permissions

---

## ⚙️ PROJECT SETUP CHECKLIST

### Step 1: Environment Variables
- [ ] Copy example file:
  ```bash
  cp .env.example .env.local
  ```
- [ ] Edit `.env.local` and set:
  - [ ] `DATABASE_URL="postgresql://ppdb_user:ppdb_password@localhost:5432/ppdb_db"`
  - [ ] `NEXTAUTH_SECRET="random-32-char-string"`
  - [ ] `NEXTAUTH_URL="http://localhost:3000"`

### Step 2: Install Dependencies
- [ ] Run:
  ```bash
  npm install
  ```
- [ ] Wait for completion (3-5 min)
- [ ] No errors shown

### Step 3: Database Migrations
- [ ] Apply migrations:
  ```bash
  npm run db:push
  ```
- [ ] Verify output: "✓ Executed X migrations"

### Step 4: Load Sample Data (Optional)
- [ ] Run:
  ```bash
  npm run seed
  ```
- [ ] Verify demo accounts created

### Step 5: Test Connection
- [ ] Run:
  ```bash
  npm run db:test
  ```
- [ ] Should show: "✅ Database connection successful!"

---

## 🚀 RUN & TEST CHECKLIST

### Step 1: Start Development Server
- [ ] Run:
  ```bash
  npm run dev
  ```
- [ ] See output:
  ```
  ▲ Next.js 14.2.3
  - Local: http://localhost:3000
  ```

### Step 2: Open in Browser
- [ ] Navigate to: http://localhost:3000
- [ ] Home page loads successfully
- [ ] All links work
- [ ] Navigation bar visible

### Step 3: Test Login
- [ ] Click "Masuk" button
- [ ] Try login with:
  - Email: `admin@ppdb.test`
  - Password: `admin123`
- [ ] Should redirect to dashboard
- [ ] Shows "Admin Dashboard"

### Step 4: Explore Pages
- [ ] [ ] Home page working
- [ ] [ ] Login page accessible
- [ ] [ ] Register page loads (multi-step form)
- [ ] [ ] Dashboard shows stats
- [ ] [ ] Results page accessible

### Step 5: Database Verification
- [ ] Open another terminal and run:
  ```bash
  psql -U ppdb_user -d ppdb_db
  ```
- [ ] Check tables exist:
  ```sql
  \dt
  ```
- [ ] Should list: users, schools, registrations, etc.
- [ ] Check sample data:
  ```sql
  SELECT COUNT(*) FROM users;
  ```
- [ ] Exit:
  ```sql
  \q
  ```

---

## 📊 DATA VERIFICATION CHECKLIST

### Users Table
- [ ] Check admin user created:
  ```sql
  SELECT * FROM users WHERE role='admin';
  ```
- [ ] Result: 1 row with email `admin@ppdb.test`

### Schools Table
- [ ] Check schools created:
  ```sql
  SELECT COUNT(*) FROM schools;
  ```
- [ ] Result: 3 schools

### Pathways Table
- [ ] Check pathways created:
  ```sql
  SELECT COUNT(*) FROM registration_pathways;
  ```
- [ ] Result: 5 pathways

### Schedules Table
- [ ] Check schedules created:
  ```sql
  SELECT COUNT(*) FROM ppdb_schedules;
  ```
- [ ] Result: 3 schedules

---

## 🔧 OPTIONAL: DRIZZLE STUDIO

### Visual Database Editor
- [ ] In new terminal run:
  ```bash
  npm run db:studio
  ```
- [ ] Open: http://local.drizzle.studio
- [ ] See all tables visually
- [ ] Browse data interactively

---

## 🐛 TROUBLESHOOTING CHECKLIST

### If Database Connection Fails

**Check 1: PostgreSQL Running?**
- [ ] Run: `pg_isready`
- [ ] Should show: `accepting connections`
- [ ] If not: Start PostgreSQL service again

**Check 2: Correct Credentials?**
- [ ] Test manually:
  ```bash
  psql -U ppdb_user -d ppdb_db -c "SELECT 1"
  ```
- [ ] Should show: `1`
- [ ] If error: Check .env.local DATABASE_URL

**Check 3: Database Exists?**
- [ ] Run: `psql -U postgres -l`
- [ ] Look for `ppdb_db` in list
- [ ] If missing: Create again per Step 2

### If Login Fails

**Check 1: .env.local Exists?**
- [ ] Run: `cat .env.local`
- [ ] Should show DATABASE_URL and NEXTAUTH_SECRET
- [ ] If missing: Run `cp .env.example .env.local`

**Check 2: Seed Data Loaded?**
- [ ] Run: `npm run seed`
- [ ] Check database: `npm run db:test`
- [ ] Verify users: `psql ... -c "SELECT * FROM users"`

**Check 3: Server Running?**
- [ ] Check terminal output
- [ ] Should show: "http://localhost:3000"
- [ ] If not: Run `npm run dev` again

### If Port 3000 In Use

**Check 1: Kill Process**
```bash
# Windows
netstat -ano | findstr :3000

# Mac/Linux
lsof -i :3000

# Kill with: kill -9 <PID>
```

**Check 2: Use Different Port**
```bash
npm run dev -- -p 3001
```

---

## ✨ SUCCESS CHECKLIST

You're done when:

- [ ] ✅ PostgreSQL running
- [ ] ✅ Database `ppdb_db` created
- [ ] ✅ User `ppdb_user` configured
- [ ] ✅ npm dependencies installed
- [ ] ✅ Migrations applied
- [ ] ✅ Seed data loaded
- [ ] ✅ .env.local configured
- [ ] ✅ Dev server running on :3000
- [ ] ✅ Login works with demo account
- [ ] ✅ All pages accessible
- [ ] ✅ Database connection verified

---

## 📞 STILL STUCK?

| Issue | File to Check |
|-------|--------------|
| Database setup | SETUP_DATABASE.md |
| Getting started | QUICK_START.md |
| General info | README.md |
| Project status | SETUP_COMPLETE.md |

---

## 🎉 NEXT STEPS AFTER SUCCESS

1. **Explore the codebase**
   - Check `src/` folder structure
   - Review `drizzle/schema.ts`
   - Look at `src/lib/auth.ts`

2. **Implement features**
   - Complete API endpoints
   - Add file upload
   - Build notification system
   - Implement ranking logic

3. **Customize UI**
   - Update styling
   - Add more components
   - Integrate Google Maps
   - Setup email provider

4. **Deploy**
   - Push to GitHub
   - Deploy to Vercel
   - Setup production database
   - Configure environment

---

**Setup Date:** June 23, 2026  
**Status:** Ready ✅  
**Time to Complete:** 10-15 minutes  

**Happy coding! 🚀**
