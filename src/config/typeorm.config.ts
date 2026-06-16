import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [path.join(__dirname, '/../**/*.entity{.ts,.js}')],
    synchronize: false,
    migrations: [
      path.join(__dirname, '/../infra/database/migrations/*{.ts,.js}'),
    ],
    migrationsRun: true,
    logging: process.env.NODE_ENV === 'development',
  }),
);
