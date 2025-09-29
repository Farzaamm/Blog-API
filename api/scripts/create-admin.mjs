import bcrypt from 'bcryptjs';
import prisma from '../src/config/prisma.js';

const email = 'admin@admin.com';
const username = 'admin';
const password = 'admin';

const hashedPassword = await bcrypt.hash(password, 10);

const admin = await prisma.user.upsert({
  where: { email },
  update: { username, password: hashedPassword, role: 'ADMIN' },
  create: { username, email, password: hashedPassword, role: 'ADMIN' },
});

console.log('Admin ready:', admin);
await prisma.$disconnect();
