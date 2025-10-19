import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Post } from './entity/Post';
import { Category } from './entity/Category';
import { AdminUser } from './entity/AdminUser';
import { InitialSetup1760233465837 } from './migration/1760233465837-InitialSetup';

const databasePath = process.env.DATABASE_PATH || 'data/dev.db';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: databasePath,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [Post, Category, AdminUser],
  migrations: [InitialSetup1760233465837],
  subscribers: [],
});

let connection: DataSource | null = null;

/**
 * データベース接続を管理し、シングルトンパターンで接続を再利用します。
 */
export const getDbConnection = async () => {
  if (connection && connection.isInitialized) {
    return connection;
  }

  if (!AppDataSource.isInitialized) {
    connection = await AppDataSource.initialize();
  }
  return connection as DataSource;
};