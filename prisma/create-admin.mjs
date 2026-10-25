// Create/update an ADMIN account. Usage:
//   node --env-file=.env prisma/create-admin.mjs <email> <password> [phone]
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const [email, password, phone] = process.argv.slice(2);

if (!email || !password) {
  console.error("usage: node --env-file=.env prisma/create-admin.mjs <email> <password> [phone]");
  process.exit(1);
}

const passwordHash = bcrypt.hashSync(password, 10);
const account = await prisma.account.upsert({
  where: { email },
  update: { passwordHash, role: "ADMIN", status: "ACTIVE", ...(phone ? { phone } : {}) },
  create: { email, phone: phone ?? null, passwordHash, role: "ADMIN", status: "ACTIVE" },
  select: { id: true, email: true, role: true, status: true },
});

console.log("✓ Compte ADMIN prêt :", account.email, "(role", account.role + ", statut", account.status + ")");
await prisma.$disconnect();
