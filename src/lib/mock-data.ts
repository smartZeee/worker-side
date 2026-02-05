import type { MenuItem, Order, Worker } from '@/types';

export const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Paneer Butter Masala',
    price: 220,
    category: 'Main Course',
    description: 'Creamy tomato-based curry with soft paneer cubes.',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    tags: ['Veg'],
    quantity: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Chicken Biryani',
    price: 280,
    category: 'Main Course',
    description: 'Aromatic rice dish with spiced chicken.',
    imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    tags: ['Non-Veg'],
    quantity: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Masala Dosa',
    price: 150,
    category: 'Breakfast',
    description: 'Crispy rice pancake with a savory potato filling.',
    imageUrl: 'https://images.unsplash.com/photo-1668665632439-202a3a10558b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    tags: ['Veg'],
    quantity: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const mockActiveOrders: Order[] = [
    {
        id: 'ORD001',
        tableNumber: 5,
        items: [
            { menuItemId: '1', quantity: 2 },
            { menuItemId: '2', quantity: 1 },
        ],
        status: 'Pending',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        workerId: 'WK001',
    },
    {
        id: 'ORD002',
        tableNumber: 3,
        items: [
            { menuItemId: '2', quantity: 1 },
        ],
        status: 'In Progress',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        workerId: 'WK001',
    },
];

export const mockWorkers: Worker[] = [
    {
        id: "AD101",
        workerId: "AD101",
        name: "Admin User",
        role: "admin",
        isActive: true,
        phone: "123-456-7890",
    },
    {
        id: "WK001",
        workerId: "WK001",
        name: "Kitchen Staff 1",
        role: "kitchen",
        isActive: true,
        phone: "123-456-7891",
    }
];