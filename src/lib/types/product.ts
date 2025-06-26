export interface Product {
  id: number | string;
  name: string;
  image: string;
  price: string;
  quantity: number;
  category: string;
  subcategory?: string;
  sku?: string;
  barcode?: string;
  brand?: string;
} 