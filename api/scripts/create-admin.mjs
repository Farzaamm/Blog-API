import bcrypt from 'bcryptjs';
import prisma from '../src/config/prisma.js';

const email = process.env.ADMIN_EMAIL;
const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

const hashedPassword = await bcrypt.hash(password, 10);

const admin = await prisma.user.upsert({
  where: { email },
  update: { username, password: hashedPassword, role: 'ADMIN' },
  create: { username, email, password: hashedPassword, role: 'ADMIN' },
});

console.log('Admin ready:', admin);
await prisma.$disconnect();
