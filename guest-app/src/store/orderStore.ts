import { create } from 'zustand';
import { api } from '@/lib/api';

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  basePrice: number;
  selectedVariants?: Record<string, string>;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  roomId: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  specialInstructions?: string;
  discountAmount?: number;
  createdAt: string;
  updatedAt: string;
}

interface OrderStore {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;

  // Actions
  createOrder: (resortId: string, roomId: string, orderData: any) => Promise<Order>;
  fetchOrdersByRoom: (resortId: string, roomId: string) => Promise<void>;
  fetchOrderById: (resortId: string, orderId: string) => Promise<void>;
  updateOrderStatus: (resortId: string, orderId: string, status: string, token: string) => Promise<void>;
  cancelOrder: (resortId: string, orderId: string, reason: string, token: string) => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearOrders: () => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,

  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),
  clearOrders: () => set({ orders: [], currentOrder: null }),

  createOrder: async (resortId: string, roomId: string, orderData: any) => {
    set({ loading: true, error: null });
    try {
      const order = await api.createOrder(resortId, roomId, orderData);
      set((state) => ({
        orders: [...state.orders, order],
        currentOrder: order,
        loading: false,
      }));
      return order;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },

  fetchOrdersByRoom: async (resortId: string, roomId: string) => {
    set({ loading: true, error: null });
    try {
      const orders = await api.getOrdersByRoom(resortId, roomId);
      set({ orders, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },

  fetchOrderById: async (resortId: string, orderId: string) => {
    set({ loading: true, error: null });
    try {
      const order = await api.getOrderById(resortId, orderId);
      set({ currentOrder: order, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch order';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },

  updateOrderStatus: async (resortId: string, orderId: string, status: string, token: string) => {
    set({ loading: true, error: null });
    try {
      const updatedOrder = await api.updateOrderStatus(resortId, orderId, status, token);
      set((state) => ({
        orders: state.orders.map((o) => (o.id === orderId ? updatedOrder : o)),
        currentOrder: state.currentOrder?.id === orderId ? updatedOrder : state.currentOrder,
        loading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update order status';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },

  cancelOrder: async (resortId: string, orderId: string, reason: string, token: string) => {
    set({ loading: true, error: null });
    try {
      const cancelledOrder = await api.cancelOrder(resortId, orderId, reason, token);
      set((state) => ({
        orders: state.orders.map((o) => (o.id === orderId ? cancelledOrder : o)),
        currentOrder: state.currentOrder?.id === orderId ? cancelledOrder : state.currentOrder,
        loading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },
}));
