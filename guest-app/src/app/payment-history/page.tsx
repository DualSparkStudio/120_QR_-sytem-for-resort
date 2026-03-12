'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useOrdersStore } from '@/store/ordersStore';

export const dynamic = 'force-dynamic';

export default function PaymentHistoryPage() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId');
  const { getPaidOrdersByRoom } = useOrdersStore();
  const [paidOrders, setPaidOrders] = useState<any[]>([]);

  useEffect(() => {
    if (roomId) {
      const orders = getPaidOrdersByRoom(roomId);
      setPaidOrders(orders);
    }
  }, [roomId, getPaidOrdersByRoom]);

  const totalPaid = paidOrders.reduce((sum, order) => sum + order.total, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'preparing': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'ready': return 'bg-green-100 text-green-800 border-green-300';
      case 'delivered': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'preparing': return '👨‍🍳';
      case 'ready': return '🔔';
      case 'delivered': return '✓';
      default: return '📦';
    }
  };

  return (
    <div className="min-h-screen pista-gradient pb-20 md:pb-0">
      {/* Header */}
      <header className="glass-effect border-b border-pista-200 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-5">
          <div className="flex justify-between items-center gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-pista-900">Payment History</h1>
              <p className="text-pista-600 text-xs sm:text-sm">Room {roomId}</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/orders?roomId=${roomId}`}
                className="bg-white hover:bg-gray-50 text-pista-700 px-3 sm:px-4 py-2 rounded-lg transition border border-pista-200 font-medium text-xs sm:text-sm shadow-sm whitespace-nowrap"
              >
                <span className="hidden sm:inline">📦 Orders</span>
                <span className="sm:hidden">📦</span>
              </Link>
              <Link
                href={`/menu?roomId=${roomId}`}
                className="bg-white hover:bg-gray-50 text-pista-700 px-3 sm:px-5 py-2 rounded-lg transition border border-pista-200 font-medium text-xs sm:text-sm shadow-sm whitespace-nowrap"
              >
                <span className="hidden sm:inline">← Menu</span>
                <span className="sm:hidden">←</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        {paidOrders.length === 0 ? (
          <div className="glass-effect border-2 border-pista-200 rounded-2xl p-8 sm:p-16 text-center">
            <span className="text-6xl sm:text-8xl block mb-4 sm:mb-6">💳</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-pista-900 mb-3 sm:mb-4">No payment history</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Your paid orders will appear here</p>
            <Link
              href={`/menu?roomId=${roomId}`}
              className="inline-block bg-pista-500 hover:bg-pista-600 text-white font-bold py-3 px-6 sm:px-8 rounded-lg transition transform hover:scale-105 shadow-lg text-sm sm:text-base"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <>
            {/* Total Paid Summary */}
            <div className="glass-effect border-2 border-green-300 rounded-xl p-3 sm:p-4 mb-3 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Total Paid Orders</p>
                  <p className="text-2xl sm:text-3xl font-bold text-pista-900">{paidOrders.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 mb-0.5">Total Paid</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-700">₹{totalPaid}</p>
                </div>
              </div>
            </div>

            {/* Paid Orders List */}
            <div className="space-y-2.5">
              {paidOrders.map((order) => (
                <div
                  key={order.id}
                  className="glass-effect border-2 border-green-200 rounded-xl p-3 sm:p-4 hover:shadow-lg transition"
                >
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-2.5 pb-2.5 border-b border-green-200">
                    <div>
                      <h3 className="font-bold text-pista-900 text-base sm:text-lg">{order.id}</h3>
                      <p className="text-gray-600 text-xs">
                        {new Date(order.timestamp).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold border bg-green-100 text-green-800 border-green-300">
                        ✓ PAID
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                        {getStatusEmoji(order.status)} {order.status.toUpperCase()}
                      </span>
                      <span className="text-base sm:text-lg font-bold text-pista-900">₹{order.total}</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex gap-2 items-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0 bg-pista-100">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/100x100/93C572/FFFFFF?text=Food';
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-pista-900 text-sm">{item.name}</p>
                          <p className="text-gray-600 text-xs">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                        <p className="font-bold text-pista-900 text-sm">₹{item.quantity * item.price}</p>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-2.5 pt-2.5 border-t border-green-200 space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Subtotal:</span>
                      <span className="font-semibold">₹{order.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Tax:</span>
                      <span className="font-semibold">₹{order.tax}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Delivery Fee:</span>
                      <span className="font-semibold">₹{order.deliveryFee}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
