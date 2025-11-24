// JavaScript test - User Controller
const { Controller, GetMapping, PostMapping, PutMapping, DeleteMapping, PathVariable, RequestBody, RequestParam } = require('artmapper');

@Controller('/api/users')
class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  @GetMapping('')
  async getAllUsers(@RequestParam('status') status) {
    if (status) {
      return this.userService.getUsersByStatus(status);
    }
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

  @PutMapping('/:id')
  async updateUser(@PathVariable('id') id, @RequestBody() userData) {
    return this.userService.updateUser(parseInt(id), userData);
  }

  @DeleteMapping('/:id')
  async deleteUser(@PathVariable('id') id) {
    const success = await this.userService.deleteUser(parseInt(id));
    return { success };
  }
}

module.exports = { UserController };

