import bcrypt from "bcrypt";
import db from "../db/db";
import { UserRole } from "@prisma/client";

async function createOfficialUser(name: string, email: string, role: UserRole) {
  try {
    const existingUser = await db.appUser.findFirst({
      where: { email },
    });

    if (existingUser) {
      console.log(`✅ User with email ${email} already exists.`);
      return;
    }

    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.appUser.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role,
      },
    });

    console.log(`✅ Successfully created ${role} user:`);
    console.log(`   - Name: ${user.name}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Password: ${password}`);
    console.log("---");
  } catch (error) {
    console.error(`❌ Error creating ${role} user:`, error);
  }
}

async function main() {
  console.log("🔧 Starting to create official users...");

  await createOfficialUser(
    "Gram Sabha Officer",
    "gs@gov.in",
    UserRole.GramSabha,
  );
  await createOfficialUser(
    "SDLC Officer",
    "sdlc@gov.in",
    UserRole.SubDivisionalCommittee,
  );

  console.log("🎉 Finished creating official users.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
