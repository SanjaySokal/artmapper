import { Service, Autowired } from '../../index';
import { UserRepository } from '../repository/UserRepository';
import { User } from '../entity/User';

@Service('UserService')
export class UserService {
  @Autowired()
  private userRepository!: UserRepository;

  async createUser(userData: Partial<User>): Promise<User> {
    const user = new User();
    user.username = userData.username!;
    user.email = userData.email!;
    user.password = userData.password!;
    user.createdAt = new Date();
    user.updatedAt = new Date();

    return this.userRepository.save(user);
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return this.userRepository.findByUsername(username);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return null;
    }

    if (userData.username) user.username = userData.username;
    if (userData.email) user.email = userData.email;
    if (userData.password) user.password = userData.password;
    user.updatedAt = new Date();

    return this.userRepository.save(user);
  }

  async deleteUser(id: number): Promise<boolean> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return false;
    }

    await this.userRepository.delete(user);
    return true;
  }
}

