// JavaScript test application for ArtMapper
require('reflect-metadata');
const { SpringApplication } = require('artmapper');

// Import entities
const { User } = require('./entity/User');
const { Product } = require('./entity/Product');

// Import repositories
const { UserRepository } = require('./repository/UserRepository');
const { ProductRepository } = require('./repository/ProductRepository');

// Import services
const { UserService } = require('./service/UserService');
const { ProductService } = require('./service/ProductService');

// Import controllers
const { UserController } = require('./controller/UserController');
const { ProductController } = require('./controller/ProductController');

class App extends SpringApplication {
  constructor() {
    const config = {
      port: 3001,
      basePath: '/',
      database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'artmapper_test',
        connectionLimit: 10,
      },
      controllers: [
        UserController,
        ProductController,
      ],
      services: [
        UserService,
        ProductService,
      ],
      repositories: [
        UserRepository,
        ProductRepository,
      ],
      entities: [
        User,
        Product,
      ],
      autoGenerateSchema: true, // Automatically create tables
    };

    super(config);
  }
}

// Run the application
if (require.main === module) {
  const app = new App();
  app.run()
    .then(() => {
      console.log('\n✅ ArtMapper JavaScript Test Application Started Successfully!');
      console.log('📝 Test the API endpoints:');
      console.log('   GET    http://localhost:3001/api/users');
      console.log('   POST   http://localhost:3001/api/users');
      console.log('   GET    http://localhost:3001/api/products');
      console.log('   POST   http://localhost:3001/api/products');
      console.log('\n🧪 Run test script: node test.js\n');
    })
    .catch((error) => {
      console.error('❌ Failed to start application:', error);
      process.exit(1);
    });
}

module.exports = { App };

