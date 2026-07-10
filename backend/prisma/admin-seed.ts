import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

function loadEnvFile(): void {
  const envPath = resolve(__dirname, '../.env');

  try {
    const content = readFileSync(envPath, 'utf-8');

    for (const line of content.split('\n')) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const separatorIndex = trimmed.indexOf('=');

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();

      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env is optional when variables are already set in the shell
  }
}

async function seedAdminUser(): Promise<void> {
  loadEnvFile();

  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  if (!username || !password) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD are required');
  }

  const prisma = new PrismaClient();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const existingUser = await prisma.adminUser.findUnique({
      where: { username },
    });

    if (existingUser) {
      console.log(`Admin user "${username}" already exists — skipping seed`);
      return;
    }

    await prisma.adminUser.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    console.log(`Admin user "${username}" created successfully`);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdminUser().catch((error: unknown) => {
  console.error('Admin seed failed:', error);
  process.exit(1);
});
