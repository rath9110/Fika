
import { PrismaClient } from './prisma/generated/client';
const prisma = new PrismaClient();
console.log('Prisma keys:', Object.keys(prisma).filter(k => !k.startsWith('_')));
// Also check specifically for user and contact
console.log('prisma.user type:', typeof (prisma as any).user);
console.log('prisma.User type:', typeof (prisma as any).User);
console.log('prisma.contact type:', typeof (prisma as any).contact);
console.log('prisma.Contact type:', typeof (prisma as any).Contact);
process.exit(0);
