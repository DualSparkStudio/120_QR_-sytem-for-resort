const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const adminApi = {
  // ============ AUTH ENDPOINTS ============
  async staffLogin(email: string, password: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/staff/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Login failed');
      return await res.json();
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // ============ ADMIN DASHBOARD ENDPOINTS ============
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

  // ============ ORDER ENDPOINTS ============
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

  // ============ SERVICE REQUEST ENDPOINTS ============
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

  async assignServiceRequest(resortId: string, requestId: string, staffId: string, token: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/service-requests/${requestId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ staffId }),
      });
      if (!res.ok) throw new Error('Failed to assign service request');
      return await res.json();
    } catch (error) {
      console.error('Error assigning service request:', error);
      throw error;
    }
  },

  async completeServiceRequest(resortId: string, requestId: string, token: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/service-requests/${requestId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to complete service request');
      return await res.json();
    } catch (error) {
      console.error('Error completing service request:', error);
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

  // ============ MENU ENDPOINTS ============
  async getMenus(resortId: string, token: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/menus`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch menus');
      return await res.json();
    } catch (error) {
      console.error('Error fetching menus:', error);
      throw error;
    }
  },

  async createMenu(resortId: string, menuData: any, token: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/menus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(menuData),
      });
      if (!res.ok) throw new Error('Failed to create menu');
      return await res.json();
    } catch (error) {
      console.error('Error creating menu:', error);
      throw error;
    }
  },

  async updateMenu(resortId: string, menuId: string, menuData: any, token: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/menus/${menuId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(menuData),
      });
      if (!res.ok) throw new Error('Failed to update menu');
      return await res.json();
    } catch (error) {
      console.error('Error updating menu:', error);
      throw error;
    }
  },

  async deleteMenu(resortId: string, menuId: string, token: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/menus/${menuId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete menu');
      return await res.json();
    } catch (error) {
      console.error('Error deleting menu:', error);
      throw error;
    }
  },

  // ============ MENU ITEM ENDPOINTS ============
  async getMenuItems(resortId: string, menuId: string, token: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/menus/${menuId}/items`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch menu items');
      return await res.json();
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  },

  async createMenuItem(resortId: string, menuId: string, itemData: any, token: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/menus/${menuId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(itemData),
      });
      if (!res.ok) throw new Error('Failed to create menu item');
      return await res.json();
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  },

  async updateMenuItem(resortId: string, itemId: string, itemData: any, token: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/menus/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(itemData),
      });
      if (!res.ok) throw new Error('Failed to update menu item');
      return await res.json();
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  },

  async toggleMenuItemAvailability(resortId: string, itemId: string, token: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/menus/items/${itemId}/toggle-availability`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to toggle menu item availability');
      return await res.json();
    } catch (error) {
      console.error('Error toggling menu item availability:', error);
      throw error;
    }
  },

  async deleteMenuItem(resortId: string, itemId: string, token: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/resorts/${resortId}/menus/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete menu item');
      return await res.json();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  },
};
