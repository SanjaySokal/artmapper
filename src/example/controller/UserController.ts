import 'reflect-metadata';
import { Controller, GetMapping, PostMapping, PutMapping, DeleteMapping, PathVariable, RequestBody } from '../../index';
import { UserService } from '../service/UserService';
import { User } from '../entity/User';

@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @GetMapping('')
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @GetMapping('/:id')
  async getUserById(@PathVariable('id') id: string): Promise<User | null> {
    return this.userService.getUserById(parseInt(id));
  }

  @PostMapping('')
  async createUser(@RequestBody() userData: Partial<User>): Promise<User> {
    return this.userService.createUser(userData);
  }

  @PutMapping('/:id')
  async updateUser(
    @PathVariable('id') id: string,
    @RequestBody() userData: Partial<User>
  ): Promise<User | null> {
    return this.userService.updateUser(parseInt(id), userData);
  }

  @DeleteMapping('/:id')
  async deleteUser(@PathVariable('id') id: string): Promise<{ success: boolean }> {
    const success = await this.userService.deleteUser(parseInt(id));
    return { success };
  }
}
