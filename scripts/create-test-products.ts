/**
 * Script to create test products in Saleor
 * 
 * Usage:
 * 1. Make sure Saleor backend is running (docker-compose up)
 * 2. Set NEXT_PUBLIC_SALEOR_API_URL in .env.local or environment
 * 3. Run: npx tsx scripts/create-test-products.ts
 * 
 * Note: This script requires authentication. You may need to:
 * - Create a staff user in Saleor Dashboard
 * - Get an authentication token
 * - Or use Saleor Dashboard directly to add products
 */

import { request } from '../lib/saleor-client';

const CREATE_PRODUCT_MUTATION = `
  mutation ProductCreate($input: ProductCreateInput!) {
    productCreate(input: $input) {
      product {
        id
        name
        slug
      }
      errors {
        field
        message
      }
    }
  }
`;

const PRODUCT_VARIANT_CREATE_MUTATION = `
  mutation ProductVariantCreate($input: ProductVariantCreateInput!) {
    productVariantCreate(input: $input) {
      productVariant {
        id
        name
      }
      errors {
        field
        message
      }
    }
  }
`;

const PRODUCT_UPDATE_MUTATION = `
  mutation ProductUpdate($id: ID!, $input: ProductInput!) {
    productUpdate(id: $id, input: $input) {
      product {
        id
        name
      }
      errors {
        field
        message
      }
    }
  }
`;

const testProducts = [
  {
    name: 'حقيبة الذاكرة الفلسطينية',
    description: 'حقيبة فاخرة مصنوعة يدوياً تعكس التراث الفلسطيني الأصيل',
    price: 450,
    sku: 'BAG-001',
  },
  {
    name: 'ثوب فلسطيني راقي',
    description: 'ثوب تراثي مطرز بتصميم عصري يجمع بين الأصالة والأناقة',
    price: 380,
    sku: 'CLO-001',
  },
  {
    name: 'مجموعة اكسسوارات تراثية',
    description: 'مجموعة مميزة من الإكسسوارات المستوحاة من التراث الفلسطيني',
    price: 220,
    sku: 'ACC-001',
  },
  {
    name: 'حقيبة يد عصرية',
    description: 'حقيبة يد عصرية بتصميم أنيق يجمع بين الكلاسيكية والحداثة',
    price: 520,
    sku: 'BAG-002',
  },
];

async function createTestProducts() {
  console.log('Creating test products in Saleor...');
  console.log('Note: This script requires authentication.');
  console.log('Please add products manually via Saleor Dashboard at http://localhost:9000');
  console.log('\nProducts to add:');
  
  testProducts.forEach((product, index) => {
    console.log(`\n${index + 1}. ${product.name}`);
    console.log(`   Description: ${product.description}`);
    console.log(`   Price: $${product.price}`);
    console.log(`   SKU: ${product.sku}`);
  });
  
  console.log('\nTo add products via GraphQL, you need to:');
  console.log('1. Authenticate with Saleor API (get auth token)');
  console.log('2. Create a category first');
  console.log('3. Create products with variants');
  console.log('4. Add product images');
  console.log('\nAlternatively, use Saleor Dashboard:');
  console.log('1. Go to http://localhost:9000');
  console.log('2. Login with admin credentials');
  console.log('3. Navigate to Products > Add Product');
  console.log('4. Fill in the product details from the list above');
}

// Run the script
if (require.main === module) {
  createTestProducts().catch(console.error);
}

export { createTestProducts, testProducts };
