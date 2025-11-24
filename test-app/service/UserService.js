// JavaScript test - User Service
const { Service, Autowired } = require('artmapper');
const { User } = require('../entity/User');

@Service('UserService')
class UserService {
  @Autowired()
  userRepository;

  async createUser(userData) {
    const user = new User();
    user.username = userData.username;
    user.email = userData.email;
    user.password = userData.password;
    user.status = userData.status || 'ACTIVE';
    user.isVerified = userData.isVerified || false;
    user.age = userData.age;
    user.balance = userData.balance || 0;
    user.metadata = userData.metadata;
    user.tags = userData.tags;

    return this.userRepository.save(user);
  }

  async getUserById(id) {
    return this.userRepository.findById(id);
  }

  async getAllUsers() {
    return this.userRepository.findAll();
  }

  async getUserByUsername(username) {
    return this.userRepository.findByUsername(username);
  }

  async getUserByEmail(email) {
    return this.userRepository.findByEmail(email);
  }

  async getUsersByStatus(status) {
    return this.userRepository.findByStatus(status);
  }

  async updateUser(id, userData) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return null;
    }

    if (userData.username) user.username = userData.username;
    if (userData.email) user.email = userData.email;
    if (userData.status) user.status = userData.status;
    if (userData.isVerified !== undefined) user.isVerified = userData.isVerified;
    if (userData.balance !== undefined) user.balance = userData.balance;
    if (userData.metadata) user.metadata = userData.metadata;
    if (userData.tags) user.tags = userData.tags;

    return this.userRepository.save(user);
  }

  async deleteUser(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return false;
    }

    await this.userRepository.delete(user);
    return true;
  }
}

module.exports = { UserService };

