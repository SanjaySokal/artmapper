import 'reflect-metadata';
import { Controller, GetMapping, PostMapping, PutMapping, DeleteMapping, PathVariable, RequestBody, RequestParam } from '../../index';
import { PostService } from '../service/PostService';
import { Post } from '../entity/Post';

@Controller('/api/posts')
export class PostController {
  constructor(private postService: PostService) {}

  @GetMapping('')
  async getAllPosts(@RequestParam('userId') userId?: string): Promise<Post[]> {
    if (userId) {
      return this.postService.getPostsByUserId(parseInt(userId));
    }
    return this.postService.getAllPosts();
  }

  @GetMapping('/:id')
  async getPostById(@PathVariable('id') id: string): Promise<Post | null> {
    return this.postService.getPostById(parseInt(id));
  }

  @PostMapping('')
  async createPost(@RequestBody() postData: Partial<Post>): Promise<Post> {
    return this.postService.createPost(postData);
  }

  @PutMapping('/:id')
  async updatePost(
    @PathVariable('id') id: string,
    @RequestBody() postData: Partial<Post>
  ): Promise<Post | null> {
    return this.postService.updatePost(parseInt(id), postData);
  }

  @DeleteMapping('/:id')
  async deletePost(@PathVariable('id') id: string): Promise<{ success: boolean }> {
    const success = await this.postService.deletePost(parseInt(id));
    return { success };
  }
}
