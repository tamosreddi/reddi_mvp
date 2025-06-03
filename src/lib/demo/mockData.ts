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
    product_id: 'demo-1',
    sku: 'PROD001',
    name: 'Coca Cola 1L',
    description: 'Refresco de cola',
    brand: 'Coca Cola',
    image: '/Groserybasket.png',
    category: 'Bebidas',
    barcode: '7501234567890',
    price: 12,
    quantity: 4,
  },
  {
    product_id: 'demo-2',
    sku: 'PROD002',
    name: 'Mamut Chocolate',
    description: 'Galleta cubierta de chocolate',
    brand: 'Gamesa',
    image: '/Groserybasket.png',
    category: 'Snacks',
    barcode: '7501234567891',
    price: 40,
    quantity: 9,
  },
  {
    product_id: 'demo-3',
    sku: 'PROD003',
    name: 'Fanta',
    description: 'Refresco sabor naranja',
    brand: 'Fanta',
    image: '/Groserybasket.png',
    category: 'Bebidas',
    barcode: '7501234567892',
    price: 15,
    quantity: 49,
  },
  {
    product_id: uuidv4(),
    sku: 'PROD004',
    name: 'Pan Bimbo',
    description: 'Pan de caja blanco',
    brand: 'Bimbo',
    image: '/Groserybasket.png',
    category: 'Panadería',
    barcode: '7501234567893',
    price: 45.00,
    quantity: 10,
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
    transaction_date: new Date(2024, 5, 3, 10, 30, 0, 0).toISOString(),
    is_paid: true,
    total_amount: 33.00
  }
];

export const mockSuppliers = [
  {
    supplier_id: 'demo-1',
    store_id: 'demo-store-id',
    name: 'El Duero',
    email: 'elduero@demo.com',
    phone: '555-3333',
    address: 'Calle Falsa 123',
    is_active: true,
    notes: 'Proveedor de abarrotes'
  }
  // Puedes agregar más si lo deseas
];

export const demoInitialSales = [
  {
    id: 1001,
    date: "2024-06-03T10:30:00.000Z",
    products: [
      { productId: "demo-1", name: "Coca Cola 1L", cartQuantity: 2 },
      { productId: "demo-2", name: "Mamut Chocolate", cartQuantity: 1 }
    ],
    total: 64
  },
  {
    id: 1002,
    date: "2024-06-03T13:15:00.000Z",
    products: [
      { productId: "demo-3", name: "Fanta", cartQuantity: 1 }
    ],
    total: 15
  }
];

export const demoInitialExpenses = [
  {
    id: 2001,
    date: "2024-06-03T11:00:00.000Z",
    category: "Compra de mercancía",
    amount: 120,
    supplier: "El Duero",
    description: "Compra semanal de abarrotes",
    paymentMethod: "cash",
    isPaid: true
  },
  {
    id: 2002,
    date: "2024-06-03T15:00:00.000Z",
    category: "Servicios",
    amount: 50,
    supplier: "CFE",
    description: "Pago de luz",
    paymentMethod: "card",
    isPaid: true
  }
]; 