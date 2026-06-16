import dataSource from './data-source';
import { User, UserRole } from '../../modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';

async function seed() {
  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);

  const adminEmail = 'admin@example.com';
  const adminPassword = 'adminpassword';

  const existingAdmin = await userRepository.findOne({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    Logger.log('Admin user already exists. Skipping seeding.');
  } else {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = userRepository.create({
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN,
      fullName: 'System Administrator',
      points: 9999,
    });
    await userRepository.save(admin);
  }
  await dataSource.destroy();
}

seed().catch((err) => {
  Logger.error('Error during seeding:', err);
  process.exit(1);
});
