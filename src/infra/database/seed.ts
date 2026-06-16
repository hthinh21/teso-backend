import dataSource from './data-source';
import { User, UserRole } from '../../modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  console.log('Connecting to database...');
  await dataSource.initialize();
  console.log('Database initialized.');

  const userRepository = dataSource.getRepository(User);

  const adminEmail = 'admin@example.com';
  const adminPassword = 'adminpassword';

  const existingAdmin = await userRepository.findOne({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`Admin account with email "${adminEmail}" already exists.`);
  } else {
    console.log(`Creating admin account "${adminEmail}"...`);
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = userRepository.create({
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN,
      fullName: 'System Administrator',
      points: 9999,
    });
    await userRepository.save(admin);
    console.log('Admin account created successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
  }

  await dataSource.destroy();
  console.log('Database connection closed.');
}

seed().catch((err) => {
  console.error('Error during seeding:', err);
  process.exit(1);
});
