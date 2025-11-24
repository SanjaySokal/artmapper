// JavaScript test - Product Service
const { Service, Autowired } = require('artmapper');
const { Product } = require('../entity/Product');

@Service('ProductService')
class ProductService {
  @Autowired()
  productRepository;

  async createProduct(productData) {
    const product = new Product();
    product.name = productData.name;
    product.description = productData.description;
    product.category = productData.category;
    product.price = productData.price;
    product.stock = productData.stock || 0;
    product.isFeatured = productData.isFeatured || false;
    product.isActive = productData.isActive !== undefined ? productData.isActive : true;
    product.rating = productData.rating;
    product.metadata = productData.metadata;
    product.tags = productData.tags;
    product.imageData = productData.imageData;

    return this.productRepository.save(product);
  }

  async getProductById(id) {
    return this.productRepository.findById(id);
  }

  async getAllProducts() {
    return this.productRepository.findAll();
  }

  async getProductsByCategory(category) {
    return this.productRepository.findByCategory(category);
  }

  async getFeaturedProducts() {
    return this.productRepository.findFeatured();
  }

  async getProductsByPriceRange(minPrice, maxPrice) {
    return this.productRepository.findByPriceRange(minPrice, maxPrice);
  }

  async updateProduct(id, productData) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      return null;
    }

    if (productData.name) product.name = productData.name;
    if (productData.description !== undefined) product.description = productData.description;
    if (productData.category) product.category = productData.category;
    if (productData.price !== undefined) product.price = productData.price;
    if (productData.stock !== undefined) product.stock = productData.stock;
    if (productData.isFeatured !== undefined) product.isFeatured = productData.isFeatured;
    if (productData.isActive !== undefined) product.isActive = productData.isActive;
    if (productData.rating !== undefined) product.rating = productData.rating;
    if (productData.metadata) product.metadata = productData.metadata;
    if (productData.tags) product.tags = productData.tags;

    return this.productRepository.save(product);
  }

  async deleteProduct(id) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      return false;
    }

    await this.productRepository.delete(product);
    return true;
  }
}

module.exports = { ProductService };

