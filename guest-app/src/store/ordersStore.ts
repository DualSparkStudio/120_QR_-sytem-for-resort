import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Order {
  id: string;
  roomId: string;
  guestName?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  paymentStatus: 'unpaid' | 'paid';
  timestamp: Date;
  notes?: string;
}

interface OrdersStore {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'timestamp' | 'status' | 'paymentStatus'>) => string;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  markOrdersAsPaid: (orderIds: string[]) => void;
  getOrdersByRoom: (roomId: string) => Order[];
  getUnpaidOrdersByRoom: (roomId: string) => Order[];
  getPaidOrdersByRoom: (roomId: string) => Order[];
  getPendingOrders: () => Order[];
}

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set, get) => ({
      orders: [],
      
      addOrder: (orderData) => {
        const newOrder: Order = {
          ...orderData,
          id: `ORD-${Date.now()}`,
          timestamp: new Date(),
          status: 'pending',
          paymentStatus: 'unpaid',
        };
        
        set((state) => ({ 
          orders: [newOrder, ...state.orders] 
        }));
        
        return newOrder.id;
      },
      
      updateOrderStatus: (id, status) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? { ...order, status } : order
          ),
        }));
      },
      
      markOrdersAsPaid: (orderIds) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            orderIds.includes(order.id) ? { ...order, paymentStatus: 'paid' } : order
          ),
        }));
      },
      
      getOrdersByRoom: (roomId) => {
        return get().orders.filter((order) => order.roomId === roomId);
      },
      
      getUnpaidOrdersByRoom: (roomId) => {
        return get().orders.filter((order) => order.roomId === roomId && order.paymentStatus === 'unpaid');
      },
      
      getPaidOrdersByRoom: (roomId) => {
        return get().orders.filter((order) => order.roomId === roomId && order.paymentStatus === 'paid');
      },
      
      getPendingOrders: () => {
        return get().orders.filter((order) => 
          order.status === 'pending' || order.status === 'preparing'
        );
      },
    }),
    {
      name: 'orders-storage',
    }
  )
);
