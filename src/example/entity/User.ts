import { Entity, Table, Column, Id, GeneratedValue, Data } from '../../index';

@Entity('User')
@Table('users')
@Data()
export class User {
  @Id()
  @GeneratedValue({ strategy: 'AUTO' })
  @Column({ name: 'id', type: 'INT', nullable: false })
  id?: number;

  @Column({ name: 'username', type: 'VARCHAR', length: 100, nullable: false, unique: true })
  username!: string;

  @Column({ name: 'email', type: 'VARCHAR', length: 255, nullable: false, unique: true })
  email!: string;

  @Column({ name: 'password', type: 'VARCHAR', length: 255, nullable: false })
  password!: string;

  @Column({ name: 'created_at', type: 'TIMESTAMP', nullable: true, default: 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @Column({ name: 'updated_at', type: 'TIMESTAMP', nullable: true, default: 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;
}

