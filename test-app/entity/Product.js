// JavaScript test - Product Entity with all MySQL data types
const { Entity, Table, Column, Id, GeneratedValue, Data } = require('artmapper');

@Entity('Product')
@Table('test_products')
@Data()
class Product {
  @Id()
  @GeneratedValue({ strategy: 'AUTO' })
  @Column({ name: 'id', type: 'INT', nullable: false, unsigned: true })
  id;

  @Column({ name: 'name', type: 'VARCHAR', length: 255, nullable: false })
  name;

  @Column({ name: 'description', type: 'TEXT', nullable: true })
  description;

  @Column({ 
    name: 'category', 
    type: 'ENUM', 
    enum: ['ELECTRONICS', 'CLOTHING', 'FOOD', 'BOOKS'],
    nullable: false
  })
  category;

  @Column({ name: 'price', type: 'DECIMAL', precision: 10, scale: 2, nullable: false, unsigned: true })
  price;

  @Column({ name: 'stock', type: 'INT', nullable: false, default: 0, unsigned: true })
  stock;

  @Column({ name: 'is_featured', type: 'BOOLEAN', nullable: false, default: false })
  isFeatured;

  @Column({ name: 'is_active', type: 'BOOL', nullable: false, default: true })
  isActive;

  @Column({ name: 'rating', type: 'FLOAT', precision: 3, scale: 2, nullable: true })
  rating;

  @Column({ name: 'metadata', type: 'JSON', nullable: true })
  metadata;

  @Column({ 
    name: 'tags', 
    type: 'SET', 
    enum: ['NEW', 'SALE', 'FEATURED', 'POPULAR'],
    nullable: true
  })
  tags;

  @Column({ name: 'image_data', type: 'BLOB', nullable: true })
  imageData;

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

module.exports = { Product };

