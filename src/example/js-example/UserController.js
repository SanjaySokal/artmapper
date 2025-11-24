// JavaScript example - Spring Boot TS Controller
const { Controller, GetMapping, PostMapping, PathVariable, RequestBody } = require('../../index');
const { UserService } = require('./UserService');

@Controller('/api/users')
class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  @GetMapping('')
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @GetMapping('/:id')
  async getUserById(@PathVariable('id') id) {
    return this.userService.getUserById(parseInt(id));
  }

  @PostMapping('')
  async createUser(@RequestBody() userData) {
    return this.userService.createUser(userData);
  }
}

module.exports = { UserController };

