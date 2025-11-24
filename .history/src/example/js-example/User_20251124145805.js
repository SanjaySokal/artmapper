// JavaScript example - Spring Boot TS Entity
const { Entity, Table, Column, Id, GeneratedValue, Data, OneToMany } = require('../../index');

@Entity('User')
@Table('users')
@Data()
class User {
  @Id()
  @GeneratedValue({ strategy: 'AUTO' })
  @Column({ name: 'id', type: 'INT', nullable: false })
  id;

  @Column({ name: 'username', type: 'VARCHAR', length: 100, nullable: false, unique: true })
  username;

  @Column({ name: 'email', type: 'VARCHAR', length: 255, nullable: false, unique: true })
  email;

  @Column({ name: 'password', type: 'VARCHAR', length: 255, nullable: false })
  password;

  @OneToMany(() => require('./Post').Post, { mappedBy: 'userId' })
  posts;

  @Column({ name: 'created_at', type: 'TIMESTAMP', nullable: true, default: 'CURRENT_TIMESTAMP' })
  createdAt;

  @Column({ name: 'updated_at', type: 'TIMESTAMP', nullable: true, default: 'CURRENT_TIMESTAMP' })
  updatedAt;
}

module.exports = { User };

