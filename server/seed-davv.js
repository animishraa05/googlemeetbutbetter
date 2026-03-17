const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding DAVV Institution and dummy teachers...');

  // 1. Create or Find DAVV Institution
  let davv = await prisma.institution.findUnique({
    where: { slug: 'davv' }
  });

  if (!davv) {
    console.log('DAVV institution not found. Creating it...');
    davv = await prisma.institution.create({
      data: {
        name: 'Devi Ahilya Vishwavidyalaya',
        slug: 'davv',
        adminEmail: 'admin@davv.edu.in',
        plan: 'premium'
      }
    });

    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        name: 'DAVV Admin',
        email: 'admin@davv.edu.in',
        password: hashedAdminPassword,
        role: 'institution_admin',
        institutionId: davv.id
      }
    });
    console.log('Created DAVV admin: admin@davv.edu.in / admin123');
  } else {
    console.log('DAVV institution already exists.');
  }

  // 2. Create Dummy Teachers
  const dummyTeachers = [
    { name: 'Dr. John Smith', email: 'john.smith@davv.edu.in' },
    { name: 'Prof. Sarah Jenkins', email: 'sarah.jenkins@davv.edu.in' },
    { name: 'Dr. Alan Turing', email: 'alan.turing@davv.edu.in' },
    { name: 'Prof. Maria Garcia', email: 'maria.garcia@davv.edu.in' }
  ];

  const hashedTeacherPassword = await bcrypt.hash('teacher123', 10);

  for (const t of dummyTeachers) {
    const existing = await prisma.user.findFirst({
      where: { email: t.email, institutionId: davv.id }
    });
    if (!existing) {
      await prisma.user.create({
        data: {
          name: t.name,
          email: t.email,
          password: hashedTeacherPassword,
          role: 'teacher',
          institutionId: davv.id
        }
      });
      console.log(`Created teacher: ${t.email}`);
    } else {
      console.log(`Teacher already exists: ${t.email}`);
    }
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
