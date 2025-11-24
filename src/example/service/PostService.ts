import { Service, Autowired } from '../../index';
import { PostRepository } from '../repository/PostRepository';
import { UserRepository } from '../repository/UserRepository';
import { Post } from '../entity/Post';

@Service('PostService')
export class PostService {
  @Autowired()
  private postRepository!: PostRepository;

  @Autowired()
  private userRepository!: UserRepository;

  async createPost(postData: Partial<Post>): Promise<Post> {
    // Verify user exists
    const user = await this.userRepository.findById(postData.userId!);
    if (!user) {
      throw new Error('User not found');
    }

    const post = new Post();
    post.title = postData.title!;
    post.content = postData.content;
    post.userId = postData.userId!;
    post.createdAt = new Date();

    return this.postRepository.save(post);
  }

  async getPostById(id: number): Promise<Post | null> {
    return this.postRepository.findById(id);
  }

  async getAllPosts(): Promise<Post[]> {
    return this.postRepository.findAll();
  }

  async getPostsByUserId(userId: number): Promise<Post[]> {
    return this.postRepository.findByUserId(userId);
  }

  async updatePost(id: number, postData: Partial<Post>): Promise<Post | null> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      return null;
    }

    if (postData.title) post.title = postData.title;
    if (postData.content !== undefined) post.content = postData.content;

    return this.postRepository.save(post);
  }

  async deletePost(id: number): Promise<boolean> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      return false;
    }

    await this.postRepository.delete(post);
    return true;
  }
}

