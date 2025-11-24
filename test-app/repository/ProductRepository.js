// JavaScript test - Product Repository
const { Repository, BaseRepository } = require('artmapper');
const { Pool } = require('mysql2/promise');
const { Product } = require('../entity/Product');

@Repository('ProductRepository')
class ProductRepository extends BaseRepository {
  constructor(pool) {
    super(pool);
  }

  getEntityClass() {
    return Product;
  }

  getId(entity) {
    return entity.id;
  }

  async findByCategory(category) {
    const queryBuilder = this.createQueryBuilder();
    return queryBuilder.where('category = ?', category).getMany();
  }

  async findFeatured() {
    const queryBuilder = this.createQueryBuilder();
    return queryBuilder.where('is_featured = ?', true).getMany();
  }

  async findByPriceRange(minPrice, maxPrice) {
    const queryBuilder = this.createQueryBuilder();
    return queryBuilder
      .where('price >= ?', minPrice)
      .andWhere('price <= ?', maxPrice)
      .orderBy('price', 'ASC')
      .getMany();
  }
}

module.exports = { ProductRepository };

