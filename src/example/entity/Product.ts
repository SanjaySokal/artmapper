import { Entity, Table, Column, Id, GeneratedValue, Data, Enumerated } from '../../index';

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISCONTINUED = 'DISCONTINUED'
}

export enum ProductCategory {
  ELECTRONICS = 'ELECTRONICS',
  CLOTHING = 'CLOTHING',
  FOOD = 'FOOD',
  BOOKS = 'BOOKS'
}

@Entity('Product')
@Table('products')
@Data()
export class Product {
  @Id()
  @GeneratedValue({ strategy: 'AUTO' })
  @Column({ name: 'id', type: 'INT', nullable: false, unsigned: true })
  id?: number;

  @Column({ name: 'name', type: 'VARCHAR', length: 255, nullable: false })
  name!: string;

  @Column({ name: 'description', type: 'TEXT', nullable: true })
  description?: string;

  @Column({ 
    name: 'status', 
    type: 'ENUM', 
    enum: ['ACTIVE', 'INACTIVE', 'DISCONTINUED'],
    nullable: false,
    default: 'ACTIVE'
  })
  status!: ProductStatus;

  @Column({ 
    name: 'category', 
    type: 'ENUM', 
    enum: ['ELECTRONICS', 'CLOTHING', 'FOOD', 'BOOKS'],
    nullable: false
  })
  category!: ProductCategory;

  @Column({ name: 'price', type: 'DECIMAL', precision: 10, scale: 2, nullable: false, unsigned: true })
  price!: number;

  @Column({ name: 'stock', type: 'INT', nullable: false, default: 0, unsigned: true })
  stock!: number;

  @Column({ name: 'is_featured', type: 'BOOLEAN', nullable: false, default: false })
  isFeatured!: boolean;

  @Column({ name: 'is_active', type: 'BOOL', nullable: false, default: true })
  isActive!: boolean;

  @Column({ name: 'metadata', type: 'JSON', nullable: true })
  metadata?: any;

  @Column({ name: 'tags', type: 'SET', enum: ['NEW', 'SALE', 'FEATURED', 'POPULAR'], nullable: true })
  tags?: string[];

  @Column({ name: 'image_data', type: 'BLOB', nullable: true })
  imageData?: Buffer;

  @Column({ name: 'created_at', type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @Column({ name: 'updated_at', type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;
}

