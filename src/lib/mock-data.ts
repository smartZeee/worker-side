import type { MenuItem, Order } from '@/types';

export const mockMenuItems: MenuItem[] = [
  {
    id: 'dish-001',
    name: 'Classic Burger',
    price: 12.99,
    category: 'Burgers',
    imageUrl: 'https://picsum.photos/seed/1/600/400',
    tags: ['Non-Veg'],
    isAvailable: true,
  },
  {
    id: 'dish-002',
    name: 'Margherita Pizza',
    price: 15.5,
    category: 'Pizzas',
    imageUrl: 'https://picsum.photos/seed/2/600/400',
    tags: ['Veg'],
    isAvailable: true,
  },
  {
    id: 'dish-003',
    name: 'Caesar Salad',
    price: 9.75,
    category: 'Salads',
    imageUrl: 'https://picsum.photos/seed/3/600/400',
    tags: ['Veg'],
    isAvailable: false,
  },
  {
    id: 'dish-004',
    name: 'Spaghetti Carbonara',
    price: 14.25,
    category: 'Pasta',
    imageUrl: 'https://picsum.photos/seed/4/600/400',
    tags: ['Non-Veg'],
    isAvailable: true,
  },
  {
    id: 'dish-005',
    name: 'Chocolate Lava Cake',
    price: 8.0,
    category: 'Desserts',
    imageUrl: 'https://picsum.photos/seed/5/600/400',
    tags: ['Veg'],
    isAvailable: true,
  },
  {
    id: 'dish-006',
    name: 'Veggie Wrap',
    price: 10.5,
    category: 'Wraps',
    imageUrl: 'https://picsum.photos/seed/6/600/400',
    tags: ['Veg'],
    isAvailable: true,
  },
];

export const mockActiveOrders: Order[] = [
  {
    id: 'order-101',
    tableNumber: 5,
    items: [
      { menuItemId: 'dish-001', quantity: 2 },
      { menuItemId: 'dish-002', quantity: 1 },
    ],
    status: 'Pending',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'order-102',
    tableNumber: 12,
    items: [{ menuItemId: 'dish-004', quantity: 1 }],
    status: 'In Progress',
    timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
  },
  {
    id: 'order-103',
    tableNumber: 8,
    items: [
      { menuItemId: 'dish-003', quantity: 1 },
      { menuItemId: 'dish-006', quantity: 2 },
    ],
    status: 'Ready',
    timestamp: new Date(Date.now() - 1 * 60000).toISOString(),
  },
    {
    id: 'order-104',
    tableNumber: 2,
    items: [
      { menuItemId: 'dish-005', quantity: 3 },
    ],
    status: 'Pending',
    timestamp: new Date(Date.now() - 7 * 60000).toISOString(),
  },
];
