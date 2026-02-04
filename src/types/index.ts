export type Tag = "Veg" | "Non-Veg";
export type OrderStatus = "Pending" | "In Progress" | "Ready" | "Completed";

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl: string;
  tags: Tag[];
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  status: OrderStatus;
  timestamp: string;
}
