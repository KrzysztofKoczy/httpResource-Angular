export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
  description: string;
}
  
export interface ProductFormData {
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
  description: string;
}
  
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}