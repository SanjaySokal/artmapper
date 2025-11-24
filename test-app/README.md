# ArtMapper JavaScript Test Application

This is a comprehensive test application written in pure JavaScript to verify all ArtMapper features work correctly.

## Features Tested

✅ **All MySQL Data Types:**
- ENUM types
- BOOLEAN/BOOL types
- SET types
- JSON type
- DECIMAL with precision/scale
- UNSIGNED integers
- BLOB types
- All text types
- Timestamps with ON UPDATE

✅ **Framework Features:**
- Entity decorators
- Repository pattern
- Service layer
- REST controllers
- Dependency injection
- Auto schema generation
- Query builder

## Setup

1. Install dependencies:
```bash
cd test-app
npm install
```

2. Configure database (create `.env` file or set environment variables):
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=artmapper_test
```

3. Start the application:
```bash
npm start
```

4. Run tests (in another terminal):
```bash
node test.js
```

## Test Endpoints

### Users API
- `GET /api/users` - Get all users
- `GET /api/users?status=ACTIVE` - Get users by status (ENUM)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Products API
- `GET /api/products` - Get all products
- `GET /api/products?category=ELECTRONICS` - Get products by category (ENUM)
- `GET /api/products?featured=true` - Get featured products (BOOLEAN)
- `GET /api/products/price-range?min=0&max=100` - Get products by price range (DECIMAL)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## Example Requests

### Create User with all data types:
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "status": "ACTIVE",
    "isVerified": true,
    "age": 25,
    "balance": 100.50,
    "metadata": {"preferences": {"theme": "dark"}},
    "tags": ["PREMIUM", "VIP"]
  }'
```

### Create Product with all data types:
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "A test product",
    "category": "ELECTRONICS",
    "price": 99.99,
    "stock": 100,
    "isFeatured": true,
    "isActive": true,
    "rating": 4.5,
    "metadata": {"specs": {"weight": "1kg"}},
    "tags": ["NEW", "FEATURED"]
  }'
```

## Test Results

The test script will verify:
1. ✅ User creation with ENUM, BOOLEAN, JSON, SET types
2. ✅ Product creation with all MySQL data types
3. ✅ Querying by ENUM values
4. ✅ Querying by BOOLEAN values
5. ✅ Querying by DECIMAL ranges
6. ✅ CRUD operations
7. ✅ Auto schema generation
8. ✅ All decorators working in JavaScript

## Notes

- The application automatically creates the database and tables on startup
- All entities use pure JavaScript (no TypeScript)
- All decorators work seamlessly in JavaScript
- The test demonstrates real-world usage patterns

