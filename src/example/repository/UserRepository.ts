import { Repository, BaseRepository } from '../../index';
import { Pool } from 'mysql2/promise';
import { User } from '../entity/User';

@Repository('UserRepository')
export class UserRepository extends BaseRepository<User, number> {
  constructor(pool: Pool) {
    super(pool);
  }

  getEntityClass(): new () => User {
    return User;
  }

  getId(entity: User): number {
    return entity.id!;
  }

  async findByUsername(username: string): Promise<User | null> {
    const queryBuilder = this.createQueryBuilder();
    return queryBuilder.where('username = ?', username).getOne<User>();
  }

  async findByEmail(email: string): Promise<User | null> {
    const queryBuilder = this.createQueryBuilder();
    return queryBuilder.where('email = ?', email).getOne<User>();
  }
}

