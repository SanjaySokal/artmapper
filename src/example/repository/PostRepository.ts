import { Repository, BaseRepository } from '../../index';
import { Pool } from 'mysql2/promise';
import { Post } from '../entity/Post';

@Repository('PostRepository')
export class PostRepository extends BaseRepository<Post, number> {
  constructor(pool: Pool) {
    super(pool);
  }

  getEntityClass(): new () => Post {
    return Post;
  }

  getId(entity: Post): number {
    return entity.id!;
  }

  async findByUserId(userId: number): Promise<Post[]> {
    const queryBuilder = this.createQueryBuilder();
    return queryBuilder.where('user_id = ?', userId).getMany<Post>();
  }
}

