// JavaScript test - User Repository
const { Repository, BaseRepository } = require('artmapper');
const { Pool } = require('mysql2/promise');
const { User } = require('../entity/User');

@Repository('UserRepository')
class UserRepository extends BaseRepository {
  constructor(pool) {
    super(pool);
  }

  getEntityClass() {
    return User;
  }

  getId(entity) {
    return entity.id;
  }

  async findByUsername(username) {
    const queryBuilder = this.createQueryBuilder();
    return queryBuilder.where('username = ?', username).getOne();
  }

  async findByEmail(email) {
    const queryBuilder = this.createQueryBuilder();
    return queryBuilder.where('email = ?', email).getOne();
  }

  async findByStatus(status) {
    const queryBuilder = this.createQueryBuilder();
    return queryBuilder.where('status = ?', status).getMany();
  }
}

module.exports = { UserRepository };

