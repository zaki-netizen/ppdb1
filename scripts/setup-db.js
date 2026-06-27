#!/usr/bin/env node

/**
 * Database Initialization Script
 * Run this after setting up .env.local with DATABASE_URL
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const commands = [
  {
    name: 'Generate Migrations',
    cmd: 'npm',
    args: ['run', 'db:generate'],
    description: '📝 Generating Drizzle migrations...',
  },
  {
    name: 'Apply Migrations',
    cmd: 'npm',
    args: ['run', 'db:push'],
    description: '🚀 Applying migrations to database...',
  },
];

async function runCommand(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

async function main() {
  console.log('🔧 PPDB Portal - Database Setup Script\n');

  // Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local not found!');
    console.log(
      '📋 Please create .env.local from .env.example and configure DATABASE_URL'
    );
    process.exit(1);
  }

  console.log('✅ .env.local found\n');

  // Run commands sequentially
  for (const command of commands) {
    console.log(`\n${command.description}`);
    try {
      await runCommand(command.cmd, command.args);
      console.log(`✅ ${command.name} completed\n`);
    } catch (error) {
      console.error(`❌ ${command.name} failed:`, error.message);
      process.exit(1);
    }
  }

  console.log(
    '\n✨ Database setup complete! Next: npm run seed (optional for test data)'
  );
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
