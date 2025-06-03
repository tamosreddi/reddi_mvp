import { v4 as uuidv4 } from 'uuid';

export const mockUser = {
  user_id: 'demo-user-id',
  name: 'Tienda Demo',
  email: 'demo@example.com',
  phone: '555-0123',
  country: 'Mexico',
  region: 'CDMX',
  is_active: true,
  last_name: 'Example'
};

export const mockStore = {
  store_id: 'demo-store-id',
  user_id: 'demo-user-id',
  store_name: 'Tienda Demo',
  store_address: 'Av. Demo 123, CDMX',
  store_category: 'Abarrotes',
  store_phone: '555-0123',
  store_email: 'tienda@demo.com',
  is_active: true
};

export const mockProducts = [
  {
    product_id: uuidv4(),
    sku: 'PROD001',
    name: 'Coca Cola 600ml',
    description: 'Refresco de cola',
    brand: 'Coca Cola',
    image: 'https://picsum.photos/200',
    category: 'Bebidas',
    barcode: '7501234567890',
    price: 18.00
  },
  {
    product_id: uuidv4(),
    sku: 'PROD002',
    name: 'Sabritas Original',
    description: 'Papas fritas',
    brand: 'Sabritas',
    image: 'https://picsum.photos/200',
    category: 'Snacks',
    barcode: '7501234567891',
    price: 15.00
  },
  {
    product_id: uuidv4(),
    sku: 'PROD003',
    name: 'Pan Bimbo',
    description: 'Pan de caja blanco',
    brand: 'Bimbo',
    image: 'https://picsum.photos/200',
    category: 'Panadería',
    barcode: '7501234567892',
    price: 45.00
  }
];

export const mockInventory = mockProducts.map(product => ({
  inventory_id: uuidv4(),
  store_id: 'demo-store-id',
  product_reference_id: product.product_id,
  product_type: 'global',
  quantity: Math.floor(Math.random() * 50) + 10,
  name_alias: product.name,
  min_stock: 5,
  unit_price: product.price,
  last_change: new Date().toISOString()
}));

export const mockClients = [
  {
    client_id: uuidv4(),
    store_id: 'demo-store-id',
    name: 'Juan Pérez',
    phone: '555-0001',
    email: 'juan@example.com',
    is_active: true
  },
  {
    client_id: uuidv4(),
    store_id: 'demo-store-id',
    name: 'María García',
    phone: '555-0002',
    email: 'maria@example.com',
    is_active: true
  }
];

export const mockTransactions = [
  {
    transaction_id: uuidv4(),
    user_id: 'demo-user-id',
    store_id: 'demo-store-id',
    transaction_type: 'sale',
    transaction_description: 'Venta regular',
    payment_method: 'efectivo',
    transaction_date: new Date().toISOString(),
    is_paid: true,
    total_amount: 33.00
  }
]; 