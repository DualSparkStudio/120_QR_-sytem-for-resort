'use client';

import { useState, useEffect, useMemo } from 'react';
import { useOrdersStore, Order } from '@/store/ordersStore';

export default function OrdersPage() {
  const { orders, updateOrderStatus } = useOrdersStore();
  const [filter, setFilter] = useState<'all' | Order['status']>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  const filteredOrders = useMemo(() => {
    // Ensure all orders have paymentStatus field (migration for old data)
    const ordersWithPaymentStatus = orders.map(o => ({
      ...o,
      paymentStatus: o.paymentStatus || 'unpaid' // Default to unpaid if not set
    }));
    
    let filtered = filter === 'all' ? ordersWithPaymentStatus : ordersWithPaymentStatus.filter(o => o.status === filter);
    
    if (paymentFilter === 'paid') {
      filtered = filtered.filter(o => o.paymentStatus === 'paid');
    } else if (paymentFilter === 'unpaid') {
      filtered = filtered.filter(o => o.paymentStatus === 'unpaid');
    }
    
    return filtered;
  }, [orders, filter, paymentFilter]);

  // Group orders by room
  const ordersByRoom = useMemo(() => {
    const grouped = new Map<string, Order[]>();
    
    filteredOrders.forEach(order => {
      const roomOrders = grouped.get(order.roomId) || [];
      roomOrders.push(order);
      grouped.set(order.roomId, roomOrders);
    });
    
    // Sort orders within each room by timestamp (newest first)
    grouped.forEach((orders, roomId) => {
      orders.sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA; // Newest first
      });
    });
    
    // Sort rooms by their latest order timestamp (newest first)
    return Array.from(grouped.entries()).sort((a, b) => {
      const latestA = new Date(a[1][0].timestamp).getTime(); // First order is newest due to sorting above
      const latestB = new Date(b[1][0].timestamp).getTime();
      return latestB - latestA; // Room with newest order first
    });
  }, [filteredOrders]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-700 border-green-200';
      case 'delivered': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const paidOrders = orders.filter(o => (o.paymentStatus || 'unpaid') === 'paid');
  const unpaidOrders = orders.filter(o => (o.paymentStatus || 'unpaid') === 'unpaid');
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const paidRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const unpaidRevenue = unpaidOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="p-4 sm:p-6 pb-20 md:pb-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-pista-900 mb-2">Orders Management</h1>
        <p className="text-gray-600">Track and manage all room service orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="glass-effect border-2 border-pista-300 rounded-xl p-4 bg-gradient-to-br from-pista-50 to-green-50">
          <p className="text-xs text-gray-600 uppercase mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-pista-700">₹{totalRevenue}</p>
        </div>
        <div className="glass-effect border-2 border-pista-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 uppercase mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-pista-900">{orders.length}</p>
        </div>
        <div className="glass-effect border-2 border-green-200 rounded-xl p-4 bg-green-50">
          <p className="text-xs text-gray-600 uppercase mb-1">Paid</p>
          <p className="text-xl font-bold text-green-700">₹{paidRevenue}</p>
          <p className="text-xs text-gray-500">{paidOrders.length} orders</p>
        </div>
        <div className="glass-effect border-2 border-red-200 rounded-xl p-4 bg-red-50">
          <p className="text-xs text-gray-600 uppercase mb-1">Unpaid</p>
          <p className="text-xl font-bold text-red-700">₹{unpaidRevenue}</p>
          <p className="text-xs text-gray-500">{unpaidOrders.length} orders</p>
        </div>
        <div className="glass-effect border-2 border-blue-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 uppercase mb-1">Preparing</p>
          <p className="text-2xl font-bold text-blue-700">{orders.filter(o => o.status === 'preparing').length}</p>
        </div>
        <div className="glass-effect border-2 border-green-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 uppercase mb-1">Ready</p>
          <p className="text-2xl font-bold text-green-700">{orders.filter(o => o.status === 'ready').length}</p>
        </div>
      </div>

      {/* Payment Filter */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setPaymentFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            paymentFilter === 'all'
              ? 'bg-pista-500 text-white shadow-md'
              : 'bg-white text-gray-700 border-2 border-pista-200 hover:border-pista-400'
          }`}
        >
          All Payments
        </button>
        <button
          onClick={() => setPaymentFilter('paid')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            paymentFilter === 'paid'
              ? 'bg-green-500 text-white shadow-md'
              : 'bg-white text-gray-700 border-2 border-green-200 hover:border-green-400'
          }`}
        >
          Paid ({paidOrders.length})
        </button>
        <button
          onClick={() => setPaymentFilter('unpaid')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            paymentFilter === 'unpaid'
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-white text-gray-700 border-2 border-red-200 hover:border-red-400'
          }`}
        >
          Unpaid ({unpaidOrders.length})
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'pending', 'preparing', 'ready', 'delivered'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === status
                ? 'bg-pista-500 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-pista-200 hover:border-pista-400'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && ` (${orders.filter(o => o.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Orders Grouped by Room */}
      <div className="space-y-4">
        {ordersByRoom.map(([roomId, roomOrders]) => {
          const roomTotal = roomOrders.reduce((sum, order) => sum + order.total, 0);
          const roomPaid = roomOrders.filter(o => o.paymentStatus === 'paid').reduce((sum, order) => sum + order.total, 0);
          const roomUnpaid = roomOrders.filter(o => o.paymentStatus === 'unpaid').reduce((sum, order) => sum + order.total, 0);
          
          return (
            <div key={roomId} className="glass-effect border-2 border-pista-300 rounded-xl p-4 bg-gradient-to-br from-white to-pista-50">
              {/* Room Header */}
              <div className="flex justify-between items-center mb-3 pb-3 border-b-2 border-pista-200">
                <div>
                  <h2 className="text-xl font-bold text-pista-900">Room {roomId}</h2>
                  <p className="text-xs text-gray-600">{roomOrders.length} order{roomOrders.length > 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 uppercase">Room Total</p>
                  <p className="text-2xl font-bold text-pista-700">₹{roomTotal}</p>
                  <div className="flex gap-2 mt-1 justify-end">
                    <span className="text-xs text-green-700 font-semibold">Paid: ₹{roomPaid}</span>
                    <span className="text-xs text-red-700 font-semibold">Unpaid: ₹{roomUnpaid}</span>
                  </div>
                </div>
              </div>

              {/* Orders for this room */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
                {roomOrders.map((order) => (
                  <div key={order.id} className={`bg-white border-2 rounded-lg p-3 hover:shadow-lg transition ${
                    order.paymentStatus === 'paid' ? 'border-green-300' : 'border-red-300'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs text-gray-500 font-mono">{order.id}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-pista-700">₹{order.total}</p>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold border ${
                          order.paymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-700 border-green-300' 
                            : 'bg-red-100 text-red-700 border-red-300'
                        }`}>
                          {order.paymentStatus === 'paid' ? '✓ PAID' : '⚠ UNPAID'}
                        </span>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold border mt-1 ${getStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="mb-2">
                      <p className="text-xs text-pista-600 font-semibold mb-1">ITEMS ({order.items.length})</p>
                      <ul className="space-y-1">
                        {order.items.map((item, i) => (
                          <li key={i} className="flex items-center justify-between text-xs bg-pista-50 p-1.5 rounded border border-pista-200">
                            <span className="text-gray-700 font-medium">{item.name} x{item.quantity}</span>
                            <span className="font-bold text-pista-700">₹{item.price * item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs text-pista-600 font-semibold mb-1">UPDATE STATUS</p>
                      <div className="flex gap-1 flex-wrap">
                        {(['pending', 'preparing', 'ready', 'delivered'] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => updateOrderStatus(order.id, status)}
                            className={`text-xs px-2 py-1 rounded font-semibold transition ${
                              order.status === status
                                ? 'bg-pista-500 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 glass-effect border-2 border-pista-200 rounded-xl">
          <span className="text-6xl block mb-4">📦</span>
          <p className="text-gray-500 text-lg font-semibold">No orders found</p>
          <p className="text-gray-400 text-sm mt-2">Orders will appear here when guests place them</p>
        </div>
      )}
    </div>
  );
}
