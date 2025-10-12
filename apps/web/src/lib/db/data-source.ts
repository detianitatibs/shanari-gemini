import 'reflect-metadata';
import { DataSource } from 'typeorm';

/**
 * データベースへのパスを環境変数から取得します。
 *
 * - `DATABASE_PATH` 環境変数が設定されている場合、その値を使用します。
 *   これは本番環境（Cloud Run）で、Cloud Storage FUSE によってマウントされた
 *   データベースファイルのパスを指定するために使用されます。
 *   (例: /mnt/gcs/prod.db)
 *
 * - 環境変数が設定されていない場合は、開発環境用のデフォルトパス 'data/dev.db' を使用します。
 *   このパスは docker-compose.yaml でマウントされたローカルファイルに対応します。
 */
const databasePath = process.env.DATABASE_PATH || 'data/dev.db';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: databasePath,
  synchronize: false, // スキーマの同期はマイグレーションで行うためfalse
  logging: process.env.NODE_ENV === 'development', // 開発環境でのみSQLログを出力
  entities: ['src/lib/db/entity/**/*.ts'], // エンティティのパス
  migrations: ['src/lib/db/migration/**/*.ts'], // マイグレーションファイルのパス
  subscribers: [],
});
