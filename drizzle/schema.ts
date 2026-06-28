import {
  pgTable,
  text,
  serial,
  timestamp,
  integer,
  decimal,
  varchar,
  boolean,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// =============== USERS & AUTHENTICATION ===============
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password_hash: text('password_hash'),
    full_name: varchar('full_name', { length: 255 }).notNull(),
    phone_number: varchar('phone_number', { length: 20 }),
    role: varchar('role', { length: 50 }).notNull().default('applicant'), // admin, applicant
    status: varchar('status', { length: 50 }).notNull().default('active'), // active, inactive, banned
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
    last_login: timestamp('last_login'),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
    roleIdx: index('users_role_idx').on(table.role),
    statusIdx: index('users_status_idx').on(table.status),
  })
);

// =============== SCHOOLS ===============
export const schools = pgTable(
  'schools',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    npsn: varchar('npsn', { length: 20 }).notNull().unique(),
    level: varchar('level', { length: 50 }).notNull(), // SMP, SMA, SMK
    address: text('address').notNull(),
    phone: varchar('phone', { length: 20 }),
    email: varchar('email', { length: 255 }),
    latitude: decimal('latitude', { precision: 10, scale: 8 }),
    longitude: decimal('longitude', { precision: 10, scale: 8 }),
    accreditation: varchar('accreditation', { length: 50 }),
    vision: text('vision'),
    mission: text('mission'),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    npsnIdx: uniqueIndex('schools_npsn_idx').on(table.npsn),
    levelIdx: index('schools_level_idx').on(table.level),
  })
);

// =============== REGISTRATION PATHWAYS ===============
export const registration_pathways = pgTable(
  'registration_pathways',
  {
    id: serial('id').primaryKey(),
    school_id: integer('school_id').notNull().references(() => schools.id),
    pathway_name: varchar('pathway_name', { length: 100 }).notNull(), // Jalur Prestasi, Jalur Zonasi, Jalur Afirmasi
    min_gpa: decimal('min_gpa', { precision: 3, scale: 2 }).default('0.00'),
    max_distance_km: decimal('max_distance_km', { precision: 5, scale: 2 }),
    quota: integer('quota').notNull().default(0),
    available_quota: integer('available_quota').notNull().default(0),
    min_certificate_points: integer('min_certificate_points').default(0),
    status: varchar('status', { length: 50 }).notNull().default('open'), // open, closed, full
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    schoolIdx: index('pathways_school_idx').on(table.school_id),
    statusIdx: index('pathways_status_idx').on(table.status),
  })
);

// =============== APPLICANTS/REGISTRATIONS ===============
export const registrations = pgTable(
  'registrations',
  {
    id: serial('id').primaryKey(),
    user_id: integer('user_id').notNull().references(() => users.id),
    registration_number: varchar('registration_number', { length: 50 }).notNull().unique(),
    nisn: varchar('nisn', { length: 20 }).notNull().unique(),
    
    // Personal Data
    date_of_birth: timestamp('date_of_birth'),
    gender: varchar('gender', { length: 20 }), // M, F
    address: text('address'),
    city: varchar('city', { length: 100 }),
    province: varchar('province', { length: 100 }),
    zipcode: varchar('zipcode', { length: 10 }),
    latitude: decimal('latitude', { precision: 10, scale: 8 }),
    longitude: decimal('longitude', { precision: 10, scale: 8 }),
    location_verified: boolean('location_verified').default(false),
    
    // Parent Data
    parent_name: varchar('parent_name', { length: 255 }),
    parent_phone: varchar('parent_phone', { length: 20 }),
    parent_email: varchar('parent_email', { length: 255 }),
    
    // School Selection
    preferred_school_id: integer('preferred_school_id').references(() => schools.id),
    pathway_id: integer('pathway_id').references(() => registration_pathways.id),
    
    // Academic Data
    gpa: decimal('gpa', { precision: 3, scale: 2 }),
    certificate_points: integer('certificate_points').default(0),
    total_score: decimal('total_score', { precision: 10, scale: 2 }).default('0'),
    
    // Status
    registration_status: varchar('registration_status', { length: 50 }).notNull().default('incomplete'), // incomplete, submitted, verified, rejected
    verification_status: varchar('verification_status', { length: 50 }).default('pending'), // pending, approved, rejected
    selection_status: varchar('selection_status', { length: 50 }).default('pending'), // pending, accepted, rejected, waitlist
    current_rank: integer('current_rank'),
    daftar_ulang_completed: boolean('daftar_ulang_completed').default(false),
    
    // Timestamps
    submitted_at: timestamp('submitted_at'),
    verified_at: timestamp('verified_at'),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index('registrations_user_idx').on(table.user_id),
    nisnIdx: uniqueIndex('registrations_nisn_idx').on(table.nisn),
    regNumIdx: uniqueIndex('registrations_reg_number_idx').on(table.registration_number),
    schoolIdx: index('registrations_school_idx').on(table.preferred_school_id),
    pathwayIdx: index('registrations_pathway_idx').on(table.pathway_id),
    statusIdx: index('registrations_status_idx').on(table.registration_status),
    selectionIdx: index('registrations_selection_idx').on(table.selection_status),
    scoreIdx: index('registrations_score_idx').on(table.total_score),
  })
);

// =============== DOCUMENT UPLOADS ===============
export const documents = pgTable(
  'documents',
  {
    id: serial('id').primaryKey(),
    registration_id: integer('registration_id').notNull().references(() => registrations.id),
    document_type: varchar('document_type', { length: 100 }).notNull(), // KK, Akta, Sertifikat, Raport, etc
    file_path: text('file_path').notNull(),
    file_size: integer('file_size'),
    mime_type: varchar('mime_type', { length: 100 }),
    verification_status: varchar('verification_status', { length: 50 }).default('pending'), // pending, approved, rejected
    verified_by: integer('verified_by').references(() => users.id),
    verified_at: timestamp('verified_at'),
    rejection_reason: text('rejection_reason'),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    registrationIdx: index('documents_registration_idx').on(table.registration_id),
    typeIdx: index('documents_type_idx').on(table.document_type),
    statusIdx: index('documents_status_idx').on(table.verification_status),
  })
);

// =============== SELECTION RESULTS ===============
export const selection_results = pgTable(
  'selection_results',
  {
    id: serial('id').primaryKey(),
    registration_id: integer('registration_id').notNull().unique().references(() => registrations.id),
    school_id: integer('school_id').notNull().references(() => schools.id),
    pathway_id: integer('pathway_id').notNull().references(() => registration_pathways.id),
    final_rank: integer('final_rank').notNull(),
    final_score: decimal('final_score', { precision: 10, scale: 2 }).notNull(),
    status: varchar('status', { length: 50 }).notNull(), // accepted, rejected, waitlist
    announcement_date: timestamp('announcement_date'),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    schoolIdx: index('results_school_idx').on(table.school_id),
    statusIdx: index('results_status_idx').on(table.status),
    pathwayIdx: index('results_pathway_idx').on(table.pathway_id),
  })
);

// =============== NOTIFICATIONS ===============
export const notifications = pgTable(
  'notifications',
  {
    id: serial('id').primaryKey(),
    user_id: integer('user_id').notNull().references(() => users.id),
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    type: varchar('type', { length: 50 }).notNull(), // schedule, result, document, system
    related_registration_id: integer('related_registration_id').references(() => registrations.id),
    is_read: boolean('is_read').default(false),
    sent_at: timestamp('sent_at').notNull().defaultNow(),
    read_at: timestamp('read_at'),
    created_at: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index('notifications_user_idx').on(table.user_id),
    typeIdx: index('notifications_type_idx').on(table.type),
    isReadIdx: index('notifications_is_read_idx').on(table.is_read),
  })
);

// =============== AUDIT LOGS ===============
export const audit_logs = pgTable(
  'audit_logs',
  {
    id: serial('id').primaryKey(),
    user_id: integer('user_id').references(() => users.id),
    action: varchar('action', { length: 255 }).notNull(), // CREATE, UPDATE, DELETE, VERIFY
    table_name: varchar('table_name', { length: 100 }).notNull(),
    record_id: integer('record_id'),
    old_values: jsonb('old_values'),
    new_values: jsonb('new_values'),
    ip_address: varchar('ip_address', { length: 45 }),
    created_at: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index('audit_logs_user_idx').on(table.user_id),
    actionIdx: index('audit_logs_action_idx').on(table.action),
    tableIdx: index('audit_logs_table_idx').on(table.table_name),
  })
);

// =============== IMPORTANT DATES/SCHEDULE ===============
export const ppdb_schedules = pgTable(
  'ppdb_schedules',
  {
    id: serial('id').primaryKey(),
    event_name: varchar('event_name', { length: 255 }).notNull(),
    description: text('description'),
    start_date: timestamp('start_date').notNull(),
    end_date: timestamp('end_date').notNull(),
    priority: varchar('priority', { length: 50 }).default('normal'), // high, normal, low
    notification_sent: boolean('notification_sent').default(false),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    startIdx: index('schedules_start_date_idx').on(table.start_date),
    endIdx: index('schedules_end_date_idx').on(table.end_date),
  })
);

// =============== RELATIONS ===============
export const usersRelations = relations(users, ({ many }) => ({
  registrations: many(registrations),
  documents_verified: many(documents, {
    relationName: 'verified_by_user',
  }),
  audit_logs: many(audit_logs),
}));

export const schoolsRelations = relations(schools, ({ many }) => ({
  pathways: many(registration_pathways),
  registrations: many(registrations),
  selection_results: many(selection_results),
}));

export const registration_pathwaysRelations = relations(
  registration_pathways,
  ({ one, many }) => ({
    school: one(schools, {
      fields: [registration_pathways.school_id],
      references: [schools.id],
    }),
    registrations: many(registrations),
    selection_results: many(selection_results),
  })
);

export const registrationsRelations = relations(registrations, ({ one, many }) => ({
  user: one(users, {
    fields: [registrations.user_id],
    references: [users.id],
  }),
  school: one(schools, {
    fields: [registrations.preferred_school_id],
    references: [schools.id],
  }),
  pathway: one(registration_pathways, {
    fields: [registrations.pathway_id],
    references: [registration_pathways.id],
  }),
  documents: many(documents),
  selection_result: one(selection_results),
  notifications: many(notifications),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  registration: one(registrations, {
    fields: [documents.registration_id],
    references: [registrations.id],
  }),
  verified_by: one(users, {
    fields: [documents.verified_by],
    references: [users.id],
    relationName: 'verified_by_user',
  }),
}));

export const selection_resultsRelations = relations(selection_results, ({ one }) => ({
  registration: one(registrations, {
    fields: [selection_results.registration_id],
    references: [registrations.id],
  }),
  school: one(schools, {
    fields: [selection_results.school_id],
    references: [schools.id],
  }),
  pathway: one(registration_pathways, {
    fields: [selection_results.pathway_id],
    references: [registration_pathways.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.user_id],
    references: [users.id],
  }),
  registration: one(registrations, {
    fields: [notifications.related_registration_id],
    references: [registrations.id],
  }),
}));

export const audit_logsRelations = relations(audit_logs, ({ one }) => ({
  user: one(users, {
    fields: [audit_logs.user_id],
    references: [users.id],
  }),
}));

export const ppdb_schedulesRelations = relations(ppdb_schedules, () => ({}));
