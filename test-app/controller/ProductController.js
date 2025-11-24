// JavaScript test - Product Controller
const { Controller, GetMapping, PostMapping, PutMapping, DeleteMapping, PathVariable, RequestBody, RequestParam } = require('artmapper');

@Controller('/api/products')
class ProductController {
  constructor(productService) {
    this.productService = productService;
  }

  @GetMapping('')
  async getAllProducts(@RequestParam('category') category, @RequestParam('featured') featured) {
    if (category) {
      return this.productService.getProductsByCategory(category);
    }
    if (featured === 'true') {
      return this.productService.getFeaturedProducts();
    }
    return this.productService.getAllProducts();
  }

  @GetMapping('/price-range')
  async getProductsByPriceRange(@RequestParam('min') minPrice, @RequestParam('max') maxPrice) {
    return this.productService.getProductsByPriceRange(
      parseFloat(minPrice),
      parseFloat(maxPrice)
    );
  }

  @GetMapping('/:id')
  async getProductById(@PathVariable('id') id) {
    return this.productService.getProductById(parseInt(id));
  }

  @PostMapping('')
  async createProduct(@RequestBody() productData) {
    return this.productService.createProduct(productData);
  }

  @PutMapping('/:id')
  async updateProduct(@PathVariable('id') id, @RequestBody() productData) {
    return this.productService.updateProduct(parseInt(id), productData);
  }

  @DeleteMapping('/:id')
  async deleteProduct(@PathVariable('id') id) {
    const success = await this.productService.deleteProduct(parseInt(id));
    return { success };
  }
}

module.exports = { ProductController };

