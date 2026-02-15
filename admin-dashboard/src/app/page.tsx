'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Order {
  id: string;
  roomId: string;
  items: string[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  timestamp: Date;
}

interface ServiceRequest {
  id: string;
  service: string;
  roomId: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
  timestamp: Date;
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    activeRooms: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    if (isLoggedIn) {
      initializeDashboard();
    }
  }, [isLoggedIn]);

  const initializeDashboard = () => {
    const mockOrders: Order[] = [
      {
        id: '1',
        roomId: '101',
        items: ['Margherita Pizza', 'Iced Coffee'],
        total: 600,
        status: 'delivered',
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: '2',
        roomId: '205',
        items: ['Grilled Chicken Sandwich'],
        total: 350,
        status: 'preparing',
        timestamp: new Date(Date.now() - 1800000),
      },
      {
        id: '3',
        roomId: '312',
        items: ['Caesar Salad', 'Fresh Orange Juice'],
        total: 400,
        status: 'pending',
        timestamp: new Date(),
      },
    ];

    const mockServices: ServiceRequest[] = [
      {
        id: '1',
        service: 'Room Cleaning',
        roomId: '101',
        priority: 'normal',
        status: 'completed',
        timestamp: new Date(Date.now() - 7200000),
      },
      {
        id: '2',
        service: 'Laundry',
        roomId: '205',
        priority: 'high',
        status: 'in_progress',
        timestamp: new Date(Date.now() - 1800000),
      },
      {
        id: '3',
        service: 'Maintenance',
        roomId: '312',
        priority: 'urgent',
        status: 'pending',
        timestamp: new Date(),
      },
    ];

    setOrders(mockOrders);
    setServiceRequests(mockServices);
    updateStats(mockOrders, mockServices);
  };

  const updateStats = (ordersList: Order[], servicesList: ServiceRequest[]) => {
    const totalRevenue = ordersList.reduce((sum, order) => sum + order.total, 0);
    const pendingCount = ordersList.filter((o) => o.status === 'pending').length;
    const uniqueRooms = new Set(ordersList.map((o) => o.roomId)).size;

    setStats({
      totalOrders: ordersList.length,
      revenue: totalRevenue,
      activeRooms: uniqueRooms,
      pendingOrders: pendingCount,
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoggedIn(true);
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    setOrders(updated);
    updateStats(updated, serviceRequests);
  };

  const updateServiceStatus = (serviceId: string, newStatus: ServiceRequest['status']) => {
    const updated = serviceRequests.map((s) =>
      s.id === serviceId ? { ...s, status: newStatus } : s
    );
    setServiceRequests(updated);
    updateStats(orders, updated);
  };

  const addNewOrder = () => {
    const newOrder: Order = {
      id: (orders.length + 1).toString(),
      roomId: `${Math.floor(Math.random() * 400) + 100}`,
      items: ['Sample Item'],
      total: Math.floor(Math.random() * 500) + 200,
      status: 'pending',
      timestamp: new Date(),
    };
    const updated = [newOrder, ...orders];
    setOrders(updated);
    updateStats(updated, serviceRequests);
  };

  const addNewService = () => {
    const services = ['Room Cleaning', 'Laundry', 'Maintenance', 'Towel Change'];
    const newService: ServiceRequest = {
      id: (serviceRequests.length + 1).toString(),
      service: services[Math.floor(Math.random() * services.length)],
      roomId: `${Math.floor(Math.random() * 400) + 100}`,
      priority: ['low', 'normal', 'high', 'urgent'][Math.floor(Math.random() * 4)] as any,
      status: 'pending',
      timestamp: new Date(),
    };
    const updated = [newService, ...serviceRequests];
    setServiceRequests(updated);
    updateStats(orders, updated);
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen pista-gradient flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-pista-200/30 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-pista-500 rounded-2xl mb-6 shadow-xl shadow-pista-500/30">
              <span className="text-3xl">👨‍💼</span>
            </div>

            <h1 className="text-5xl font-bold text-pista-900 mb-3 tracking-tight">
              Admin Portal
            </h1>
            <p className="text-lg text-pista-700 mb-2">Resort Management System</p>
            <p className="text-sm text-gray-600">Manage your resort operations efficiently</p>
          </div>

          <div className="glass-effect rounded-2xl p-8 border-2 border-pista-200 shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-pista-900 mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="admin@resort.com"
                  className="w-full px-4 py-3 bg-white border-2 border-pista-200 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-pista-900 mb-2 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white border-2 border-pista-200 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none transition"
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-pista-500 hover:bg-pista-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg uppercase tracking-wider text-sm"
              >
                Sign In
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-pista-200">
              <p className="text-xs text-pista-700 font-medium mb-3 uppercase tracking-wider text-center">Demo Credentials</p>
              <div className="bg-pista-50 rounded-lg p-3 border border-pista-200">
                <p className="text-xs text-pista-700 font-mono">admin@resort.com</p>
                <p className="text-xs text-pista-700 font-mono">admin123</p>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-500 text-xs mt-6">
            © 2024 Grand Valley Resort
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen pista-gradient">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pista-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pista-300/20 rounded-full blur-3xl"></div>
      </div>

      <header className="glass-effect border-b border-pista-200 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-pista-900 tracking-tight">Dashboard</h1>
            <p className="text-pista-600 text-xs uppercase tracking-wider">Administrator</p>
          </div>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="bg-white hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-lg transition border-2 border-gray-300 font-medium text-sm shadow-sm"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Orders', value: stats.totalOrders, icon: '📦', gradient: 'from-pista-500 to-pista-600' },
            { label: 'Revenue', value: `₹${stats.revenue}`, icon: '💰', gradient: 'from-green-500 to-green-600' },
            { label: 'Active Rooms', value: stats.activeRooms, icon: '🛏️', gradient: 'from-blue-500 to-blue-600' },
            { label: 'Pending Orders', value: stats.pendingOrders, icon: '⏳', gradient: 'from-orange-500 to-orange-600' },
          ].map((stat, i) => (
            <div key={i} className="group glass-effect border-2 border-pista-200 rounded-xl p-5 hover:border-pista-400 hover:shadow-xl transition duration-300 transform hover:scale-[1.02]">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-pista-600 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-bold text-pista-900 mt-2">{stat.value}</p>
                </div>
                <span className="text-3xl opacity-80">{stat.icon}</span>
              </div>
              <div className={`h-1 w-full bg-gradient-to-r ${stat.gradient} rounded-full`}></div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Orders Management */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-pista-900">Recent Orders</h2>
                <p className="text-pista-600 text-xs">Manage and track orders</p>
              </div>
              <button
                onClick={addNewOrder}
                className="bg-pista-500 hover:bg-pista-600 text-white px-4 py-2 rounded-lg font-bold transition text-sm shadow-md"
              >
                + Add
              </button>
            </div>

            <div className="glass-effect border-2 border-pista-200 rounded-xl p-5">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {orders.length === 0 ? (
                  <p className="text-gray-600 text-center py-8 text-sm">No orders yet</p>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="bg-white border-2 border-pista-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-pista-900">Room {order.roomId}</p>
                          <p className="text-sm text-gray-600">{order.items.join(', ')}</p>
                        </div>
                        <p className="text-pista-700 font-bold">₹{order.total}</p>
                      </div>
                      <div className="flex gap-2">
                        {['pending', 'preparing', 'ready', 'delivered'].map((status) => (
                          <button
                            key={status}
                            onClick={() => updateOrderStatus(order.id, status as Order['status'])}
                            className={`text-xs px-3 py-1 rounded-full font-semibold transition ${
                              order.status === status
                                ? 'bg-pista-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Service Requests */}
          <div>
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-pista-900">Services</h2>
                <p className="text-pista-600 text-xs">Housekeeping</p>
              </div>
              <button
                onClick={addNewService}
                className="bg-pista-500 hover:bg-pista-600 text-white px-3 py-1 rounded-lg font-bold text-sm transition shadow-md"
              >
                + Add
              </button>
            </div>

            <div className="glass-effect border-2 border-pista-200 rounded-xl p-5">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {serviceRequests.length === 0 ? (
                  <p className="text-gray-600 text-center py-8 text-xs">No requests</p>
                ) : (
                  serviceRequests.map((service) => (
                    <div key={service.id} className="bg-white border-2 border-pista-200 rounded-lg p-3 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-pista-900 text-sm">{service.service}</p>
                          <p className="text-xs text-gray-600">Room {service.roomId}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          service.priority === 'urgent' ? 'bg-red-100 text-red-700 border border-red-200' :
                          service.priority === 'high' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                          service.priority === 'normal' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                          'bg-green-100 text-green-700 border border-green-200'
                        }`}>
                          {service.priority.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {['pending', 'assigned', 'in_progress', 'completed'].map((status) => (
                          <button
                            key={status}
                            onClick={() => updateServiceStatus(service.id, status as ServiceRequest['status'])}
                            className={`text-xs px-2 py-0.5 rounded font-semibold transition ${
                              service.status === status
                                ? 'bg-pista-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                            }`}
                          >
                            {status.split('_')[0].charAt(0).toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
