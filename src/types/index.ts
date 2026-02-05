
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
  isActive?: boolean; // Optional, derived from quantity > 0
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: any; // Firestore timestamp
  tableNumber?: number; // Optional for backward compatibility
  workerId?: string; // Optional for backward compatibility
  timestamp?: string; // Optional for backward compatibility
}

export interface Worker {
    id: string; // The document ID, which is the workerId
    workerId: string;
    name: string;
    role: "kitchen" | "manager" | "delivery" | "admin";
    isActive: boolean;
    phone?: string;
    password: string;
}
