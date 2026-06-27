# 🗄️ Database Setup Guide - PPDB Portal

Complete step-by-step guide untuk setup PostgreSQL dan Drizzle ORM.

## ⚡ Quick Start (5 menit)

### 1. Install PostgreSQL
- **Windows**: Download dari [postgresql.org](https://www.postgresql.org/download/windows/)
- **Mac**: `brew install postgresql@15`
- **Linux**: `sudo apt-get install postgresql postgresql-contrib`

Verify installation:
```bash
psql --version
```

### 2. Start PostgreSQL Service
```bash
# Windows (PowerShell as Admin)
net start postgresql-x64-15

# Mac
brew services start postgresql@15

# Linux
sudo systemctl start postgresql
```

### 3. Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Inside psql:
CREATE DATABASE ppdb_db;
CREATE USER ppdb_user WITH PASSWORD 'ppdb_password';
ALTER ROLE ppdb_user SET client_encoding TO 'utf8';
ALTER ROLE ppdb_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE ppdb_user SET default_transaction_deferrable TO on;
ALTER ROLE ppdb_user SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE ppdb_db TO ppdb_user;
\q
```

### 4. Setup Environment
```bash
# Copy dan edit .env.local
cp .env.example .env.local

# Edit .env.local dengan text editor dan set:
DATABASE_URL="postgresql://ppdb_user:ppdb_password@localhost:5432/ppdb_db"
NEXTAUTH_SECRET="your-secret-key-here-$(date +%s)"
NEXTAUTH_URL="http://localhost:3000"
```

### 5. Apply Migrations
```bash
npm run db:push
```

### 6. (Optional) Seed Sample Data
```bash
npm run seed
```

### 7. Test Connection
```bash
npm run db:test
```

### 8. Start Development Server
```bash
npm run dev
```

---

## 📊 Detailed Setup Steps

### Step 1: Verify PostgreSQL Installation

**Windows:**
```powershell
# Check if PostgreSQL service is running
Get-Service postgresql*

# Or check via psql
psql -U postgres -c "SELECT version();"
```

**Mac/Linux:**
```bash
psql -U postgres -c "SELECT version();"
```

Expected output: PostgreSQL version info

### Step 2: Create Database & User

```bash
# Connect as superuser
psql -U postgres

# Execute these commands:
CREATE DATABASE ppdb_db;
CREATE USER ppdb_user WITH PASSWORD 'ppdb_password';
ALTER DATABASE ppdb_db OWNER TO ppdb_user;
\c ppdb_db
GRANT ALL PRIVILEGES ON SCHEMA public TO ppdb_user;
\q
```

Verify connection:
```bash
psql -U ppdb_user -d ppdb_db -h localhost
```

### Step 3: Configure Environment Variables

**Create .env.local:**
```env
# Database
DATABASE_URL="postgresql://ppdb_user:ppdb_password@localhost:5432/ppdb_db"

# NextAuth
NEXTAUTH_SECRET="ppdb-secret-$(date +%s)-$(openssl rand -hex 16)"
NEXTAUTH_URL="http://localhost:3000"

# Optional
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Step 4: Generate Migrations

Drizzle akan membaca schema.ts dan membuat migration files:

```bash
npm run db:generate
```

Output akan seperti:
```
✓ Generated migrations in drizzle/migrations
```

### Step 5: Apply Migrations to Database

```bash
npm run db:push
```

Ini akan:
1. Read semua .sql files di drizzle/migrations/
2. Execute queries di database
3. Create semua tables, indexes, dan relationships

Output:
```
✓ Executed 1 migration in 2.34ms
```

### Step 6: Verify Schema in Database

```bash
# Connect ke database
psql -U ppdb_user -d ppdb_db

# List semua tables
\dt

# Check columns di table users
\d users

# Exit
\q
```

Expected tables:
```
users
schools
registration_pathways
registrations
documents
selection_results
notifications
audit_logs
ppdb_schedules
```

### Step 7: (Optional) Populate Sample Data

```bash
npm run seed
```

Ini akan create:
- 1 admin user: `admin@ppdb.test` / `admin123`
- 3 applicant users
- 3 sample schools
- 5 registration pathways
- 3 schedule events

### Step 8: Test Database Connection

```bash
npm run db:test
```

Expected output:
```
✅ Database connection successful!
📊 Found X user(s) in database
📋 Database Info:
   Schema: Successfully accessed
   Tables: All schema tables ready
   Status: ✅ Ready for development
```

---

## 🐛 Troubleshooting

### ❌ "Error: connect ECONNREFUSED"
- **Cause**: PostgreSQL service not running
- **Fix**:
  ```bash
  # Windows
  net start postgresql-x64-15
  
  # Mac
  brew services start postgresql@15
  ```

### ❌ "error: password authentication failed"
- **Cause**: Wrong username/password
- **Fix**: Verify DATABASE_URL in .env.local
  ```bash
  psql -U ppdb_user -d ppdb_db -c "SELECT 1"
  ```

### ❌ "database does not exist"
- **Cause**: Database ppdb_db belum dibuat
- **Fix**: Create database:
  ```bash
  psql -U postgres -c "CREATE DATABASE ppdb_db;"
  ```

### ❌ "migration already applied"
- **Cause**: Migrations sudah diterapkan
- **Fix**: Ini normal, cukup lanjutkan

### ❌ "disk space is low"
- **Cause**: Tidak ada space untuk database
- **Fix**: Clear temp files atau expand storage

---

## 🔄 Common Database Tasks

### Reset Database (Hapus semua data)
```bash
# Drop dan recreate database
psql -U postgres << EOF
DROP DATABASE IF EXISTS ppdb_db;
CREATE DATABASE ppdb_db;
EOF

# Apply migrations lagi
npm run db:push

# Reseed data
npm run seed
```

### Backup Database
```bash
pg_dump -U ppdb_user -d ppdb_db -h localhost > backup_ppdb.sql
```

### Restore Database
```bash
psql -U ppdb_user -d ppdb_db -h localhost < backup_ppdb.sql
```

### Access Drizzle Studio (Visual Query Tool)
```bash
npm run db:studio
```

Buka [http://local.drizzle.studio](http://local.drizzle.studio) di browser

---

## 📚 Database Schema Reference

### users
```sql
id: integer (PK)
email: varchar (UNIQUE)
password_hash: text
full_name: varchar
phone_number: varchar
role: varchar ('admin', 'applicant')
status: varchar ('active', 'inactive', 'banned')
created_at: timestamp
updated_at: timestamp
last_login: timestamp
```

### schools
```sql
id: integer (PK)
name: varchar
npsn: varchar (UNIQUE)
level: varchar ('SMP', 'SMA', 'SMK')
address: text
latitude: decimal
longitude: decimal
accreditation: varchar
vision: text
mission: text
```

### registrations
```sql
id: integer (PK)
user_id: integer (FK -> users)
nisn: varchar (UNIQUE)
gpa: decimal
certificate_points: integer
total_score: decimal (auto-calculated)
registration_status: varchar
selection_status: varchar
current_rank: integer
```

### Relationships Diagram
```
users
├── registrations (1:N)
├── documents_verified (1:N)
└── audit_logs (1:N)

schools
├── pathways (1:N)
├── registrations (1:N)
└── selection_results (1:N)

registration_pathways
├── registrations (1:N)
└── selection_results (1:N)

registrations
├── documents (1:N)
├── selection_result (1:1)
└── notifications (1:N)

selection_results
└── registration (1:1)
```

---

## 🎯 Next Steps

1. ✅ Database setup complete
2. 🚧 Run `npm run dev` to start development server
3. 🚧 Test authentication at http://localhost:3000/login
4. 🚧 Implement API endpoints
5. 🚧 Build UI components

---

## 📞 Support

Jika ada error, check:
1. PostgreSQL running: `pg_isready`
2. Database exists: `psql -l`
3. .env.local configured: `cat .env.local`
4. Migrations applied: `npm run db:test`

**Happy coding! 🚀**
