import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { AdminUser } from './AdminUser';
import { Category } from './Category';

@Entity({ name: 'posts' })
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', unique: true })
  slug: string;

  @Column({ type: 'text', name: 'file_path' })
  filePath: string;

  @Column({ type: 'text', default: 'draft' })
  status: string;

  @Column({ type: 'datetime', name: 'published_at', nullable: true })
  publishedAt: Date | null;

  @ManyToOne(() => AdminUser, adminUser => adminUser.posts, { nullable: false })
  @JoinColumn({ name: 'author_id' })
  author: AdminUser;

  @ManyToMany(() => Category, category => category.posts, { cascade: true })
  @JoinTable({
    name: 'post_categories',
    joinColumn: {
      name: 'post_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
  })
  categories: Category[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
