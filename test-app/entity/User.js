// JavaScript test - User Entity
const { Entity, Table, Column, Id, GeneratedValue, Data, OneToMany } = require('artmapper');

@Entity('User')
@Table('test_users')
@Data()
class User {
    @Id()
    @GeneratedValue({ strategy: 'AUTO' })
    @Column({ name: 'id', type: 'INT', nullable: false, unsigned: true })
    id;

    @Column({ name: 'username', type: 'VARCHAR', length: 100, nullable: false, unique: true })
    username;

    @Column({ name: 'email', type: 'VARCHAR', length: 255, nullable: false, unique: true })
    email;

    @Column({ name: 'password', type: 'VARCHAR', length: 255, nullable: false })
    password;

    @Column({
        name: 'status',
        type: 'ENUM',
        enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
        nullable: false,
        default: 'ACTIVE'
    })
    status;

    @Column({ name: 'is_verified', type: 'BOOLEAN', nullable: false, default: false })
    isVerified;

    @Column({ name: 'age', type: 'TINYINT', nullable: true, unsigned: true })
    age;

    @Column({ name: 'balance', type: 'DECIMAL', precision: 10, scale: 2, nullable: false, default: 0, unsigned: true })
    balance;

    @Column({ name: 'metadata', type: 'JSON', nullable: true })
    metadata;

    @Column({
        name: 'tags',
        type: 'SET',
        enum: ['PREMIUM', 'VIP', 'BETA', 'EARLY_ADOPTER'],
        nullable: true
    })
    tags;

    @Column({ name: 'created_at', type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' })
    createdAt;

    @Column({
        name: 'updated_at',
        type: 'TIMESTAMP',
        nullable: false,
        default: 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    updatedAt;
}

module.exports = { User };

