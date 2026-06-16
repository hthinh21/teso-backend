import { DataSource } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { Reward } from '../../modules/rewards/entities/reward.entity';
import { UserReward } from '../../modules/rewards/entities/user-reward.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'nestjs_rewards',
  entities: [User, Reward, UserReward],
  migrations: [path.join(__dirname, '/migrations/*{.ts,.js}')],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
