const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

export const api = {
  // ============ RESORT ENDPOINTS ============
  async getResorts() {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts`);
      if (!res.ok) throw new Error('Failed to fetch resorts');
      return await res.json();
    } catch (error) {
      console.error('Error fetching resorts:', error);
      throw error;
    }
  },

  async getResortById(resortId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}`);
      if (!res.ok) throw new Error('Failed to fetch resort');
      return await res.json();
    } catch (error) {
      console.error('Error fetching resort:', error);
      throw error;
    }
  },

  // ============ MENU ENDPOINTS ============
  async getMenus(resortId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/menus`);
      if (!res.ok) throw new Error('Failed to fetch menus');
      return await res.json();
    } catch (error) {
      console.error('Error fetching menus:', error);
      throw error;
    }
  },

  async getMenuForGuest(resortId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/menus/guest`);
      if (!res.ok) throw new Error('Failed to fetch menu');
      return await res.json();
    } catch (error) {
      console.error('Error fetching menu:', error);
      throw error;
    }
  },

  async getMenuById(resortId: string, menuId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/menus/${menuId}`);
      if (!res.ok) throw new Error('Failed to fetch menu');
      return await res.json();
    } catch (error) {
      console.error('Error fetching menu:', error);
      throw error;
    }
  },

  async getMenuItems(resortId: string, menuId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/menus/${menuId}/items`);
      if (!res.ok) throw new Error('Failed to fetch menu items');
      return await res.json();
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  },

  // ============ ORDER ENDPOINTS ============
  async createOrder(resortId: string, roomId: string, orderData: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/orders/rooms/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) throw new Error('Failed to create order');
      return await res.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  async getOrdersByRoom(resortId: string, roomId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/orders/room/${roomId}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      return await res.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  async getOrderById(resortId: string, orderId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/orders/${orderId}`);
      if (!res.ok) throw new Error('Failed to fetch order');
      return await res.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  async updateOrderStatus(resortId: string, orderId: string, status: string, token: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update order status');
      return await res.json();
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  async cancelOrder(resortId: string, orderId: string, reason: string, token: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error('Failed to cancel order');
      return await res.json();
    } catch (error) {
      console.error('Error canceling order:', error);
      throw error;
    }
  },

  // ============ SERVICE REQUEST ENDPOINTS ============
  async createServiceRequest(resortId: string, roomId: string, requestData: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/service-requests/rooms/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      if (!res.ok) throw new Error('Failed to create service request');
      return await res.json();
    } catch (error) {
      console.error('Error creating service request:', error);
      throw error;
    }
  },

  async getServiceRequestsByRoom(resortId: string, roomId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/service-requests/room/${roomId}`);
      if (!res.ok) throw new Error('Failed to fetch service requests');
      return await res.json();
    } catch (error) {
      console.error('Error fetching service requests:', error);
      throw error;
    }
  },

  async getServiceRequestById(resortId: string, requestId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/service-requests/${requestId}`);
      if (!res.ok) throw new Error('Failed to fetch service request');
      return await res.json();
    } catch (error) {
      console.error('Error fetching service request:', error);
      throw error;
    }
  },

  async updateServiceRequest(resortId: string, requestId: string, updateData: any, token: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/service-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) throw new Error('Failed to update service request');
      return await res.json();
    } catch (error) {
      console.error('Error updating service request:', error);
      throw error;
    }
  },

  // ============ ROOM ENDPOINTS ============
  async getRoomByQR(resortId: string, qrCode: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/rooms/qr/${qrCode}`);
      if (!res.ok) throw new Error('Failed to fetch room');
      return await res.json();
    } catch (error) {
      console.error('Error fetching room:', error);
      throw error;
    }
  },

  async getRoomById(resortId: string, roomId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/rooms/${roomId}`);
      if (!res.ok) throw new Error('Failed to fetch room');
      return await res.json();
    } catch (error) {
      console.error('Error fetching room:', error);
      throw error;
    }
  },

  // ============ ADMIN ENDPOINTS ============
  async getAdminDashboard(resortId: string, token: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/resorts/${resortId}/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      return await res.json();
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      throw error;
    }
  },

  async getOrdersByResort(resortId: string, token: string, filters?: any) {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const res = await fetch(
        `${API_BASE_URL}/resorts/${resortId}/orders?${params.toString()}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Failed to fetch orders');
      return await res.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  async getServiceRequestsByResort(resortId: string, token: string, filters?: any) {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.serviceType) params.append('serviceType', filters.serviceType);
      if (filters?.priority) params.append('priority', filters.priority);

      const res = await fetch(
        `${API_BASE_URL}/resorts/${resortId}/service-requests?${params.toString()}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Failed to fetch service requests');
      return await res.json();
    } catch (error) {
      console.error('Error fetching service requests:', error);
      throw error;
    }
  },

  async getOrderStats(resortId: string, token: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/orders/stats/overview`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch order stats');
      return await res.json();
    } catch (error) {
      console.error('Error fetching order stats:', error);
      throw error;
    }
  },

  async getServiceRequestStats(resortId: string, token: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/service-requests/stats/overview`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch service request stats');
      return await res.json();
    } catch (error) {
      console.error('Error fetching service request stats:', error);
      throw error;
    }
  },
};
