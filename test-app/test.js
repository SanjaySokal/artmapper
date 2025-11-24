// JavaScript test script for ArtMapper
const http = require('http');

const BASE_URL = 'http://localhost:3001';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting ArtMapper JavaScript Tests...\n');

  let testCount = 0;
  let passCount = 0;
  let failCount = 0;

  async function test(name, fn) {
    testCount++;
    try {
      await fn();
      passCount++;
      console.log(`✅ ${name}`);
    } catch (error) {
      failCount++;
      console.log(`❌ ${name}`);
      console.log(`   Error: ${error.message}`);
    }
  }

  // Wait for server to be ready
  console.log('⏳ Waiting for server to start...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Test 1: Create User
  await test('Create User with ENUM, BOOLEAN, JSON, SET', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      status: 'ACTIVE',
      isVerified: true,
      age: 25,
      balance: 100.50,
      metadata: { preferences: { theme: 'dark' } },
      tags: ['PREMIUM', 'VIP']
    };

    const result = await makeRequest('POST', '/api/users', userData);
    if (result.status !== 200 && result.status !== 201) {
      throw new Error(`Expected 200/201, got ${result.status}`);
    }
    if (!result.data || !result.data.id) {
      throw new Error('User was not created');
    }
    console.log(`   Created user ID: ${result.data.id}`);
  });

  // Test 2: Get All Users
  await test('Get All Users', async () => {
    const result = await makeRequest('GET', '/api/users');
    if (result.status !== 200) {
      throw new Error(`Expected 200, got ${result.status}`);
    }
    if (!Array.isArray(result.data)) {
      throw new Error('Expected array of users');
    }
    console.log(`   Found ${result.data.length} user(s)`);
  });

  // Test 3: Get User by ID
  await test('Get User by ID', async () => {
    const result = await makeRequest('GET', '/api/users/1');
    if (result.status !== 200) {
      throw new Error(`Expected 200, got ${result.status}`);
    }
    if (!result.data || !result.data.id) {
      throw new Error('User not found');
    }
    console.log(`   User: ${result.data.username} (${result.data.status})`);
  });

  // Test 4: Create Product with all data types
  await test('Create Product with all MySQL data types', async () => {
    const productData = {
      name: 'Test Product',
      description: 'A test product with all data types',
      category: 'ELECTRONICS',
      price: 99.99,
      stock: 100,
      isFeatured: true,
      isActive: true,
      rating: 4.5,
      metadata: { 
        specs: { 
          weight: '1kg',
          dimensions: '10x10x10'
        } 
      },
      tags: ['NEW', 'FEATURED']
    };

    const result = await makeRequest('POST', '/api/products', productData);
    if (result.status !== 200 && result.status !== 201) {
      throw new Error(`Expected 200/201, got ${result.status}`);
    }
    if (!result.data || !result.data.id) {
      throw new Error('Product was not created');
    }
    console.log(`   Created product ID: ${result.data.id}`);
  });

  // Test 5: Get All Products
  await test('Get All Products', async () => {
    const result = await makeRequest('GET', '/api/products');
    if (result.status !== 200) {
      throw new Error(`Expected 200, got ${result.status}`);
    }
    if (!Array.isArray(result.data)) {
      throw new Error('Expected array of products');
    }
    console.log(`   Found ${result.data.length} product(s)`);
  });

  // Test 6: Get Products by Category (ENUM)
  await test('Get Products by Category (ENUM)', async () => {
    const result = await makeRequest('GET', '/api/products?category=ELECTRONICS');
    if (result.status !== 200) {
      throw new Error(`Expected 200, got ${result.status}`);
    }
    if (!Array.isArray(result.data)) {
      throw new Error('Expected array of products');
    }
    console.log(`   Found ${result.data.length} product(s) in ELECTRONICS category`);
  });

  // Test 7: Get Featured Products (BOOLEAN)
  await test('Get Featured Products (BOOLEAN)', async () => {
    const result = await makeRequest('GET', '/api/products?featured=true');
    if (result.status !== 200) {
      throw new Error(`Expected 200, got ${result.status}`);
    }
    if (!Array.isArray(result.data)) {
      throw new Error('Expected array of products');
    }
    console.log(`   Found ${result.data.length} featured product(s)`);
  });

  // Test 8: Get Products by Price Range (DECIMAL)
  await test('Get Products by Price Range (DECIMAL)', async () => {
    const result = await makeRequest('GET', '/api/products/price-range?min=0&max=100');
    if (result.status !== 200) {
      throw new Error(`Expected 200, got ${result.status}`);
    }
    if (!Array.isArray(result.data)) {
      throw new Error('Expected array of products');
    }
    console.log(`   Found ${result.data.length} product(s) in price range`);
  });

  // Test 9: Update User
  await test('Update User', async () => {
    const updateData = {
      status: 'INACTIVE',
      balance: 200.75,
      metadata: { updated: true }
    };

    const result = await makeRequest('PUT', '/api/users/1', updateData);
    if (result.status !== 200) {
      throw new Error(`Expected 200, got ${result.status}`);
    }
    if (result.data.status !== 'INACTIVE') {
      throw new Error('User was not updated');
    }
    console.log(`   Updated user status to: ${result.data.status}`);
  });

  // Test 10: Get Users by Status (ENUM filter)
  await test('Get Users by Status (ENUM)', async () => {
    const result = await makeRequest('GET', '/api/users?status=INACTIVE');
    if (result.status !== 200) {
      throw new Error(`Expected 200, got ${result.status}`);
    }
    if (!Array.isArray(result.data)) {
      throw new Error('Expected array of users');
    }
    console.log(`   Found ${result.data.length} user(s) with INACTIVE status`);
  });

  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`   Total Tests: ${testCount}`);
  console.log(`   Passed: ${passCount}`);
  console.log(`   Failed: ${failCount}`);
  
  if (failCount === 0) {
    console.log('\n🎉 All tests passed! ArtMapper JavaScript support is working correctly!');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }

  process.exit(failCount > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});

