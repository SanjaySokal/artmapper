import { Entity, Table, Column, Id, GeneratedValue, ManyToOne, Data } from '../../index';
import { User } from './User';

@Entity('Post')
@Table('posts')
@Data()
export class Post {
  @Id()
  @GeneratedValue({ strategy: 'AUTO' })
  @Column({ name: 'id', type: 'INT', nullable: false })
  id?: number;

  @Column({ name: 'title', type: 'VARCHAR', length: 255, nullable: false })
  title!: string;

  @Column({ name: 'content', type: 'TEXT', nullable: true })
  content?: string;

  @ManyToOne(() => User, { fetch: 'EAGER' })
  @Column({ name: 'user_id', type: 'INT', nullable: false })
  userId!: number;

  @Column({ name: 'created_at', type: 'TIMESTAMP', nullable: true, default: 'CURRENT_TIMESTAMP' })
  createdAt?: Date;
}
