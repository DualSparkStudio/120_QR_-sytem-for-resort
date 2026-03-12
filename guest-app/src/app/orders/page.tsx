'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useOrdersStore } from '@/store/ordersStore';

export const dynamic = 'force-dynamic';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get('roomId');
  const { getUnpaidOrdersByRoom, getPaidOrdersByRoom, getOrdersByRoom, markOrdersAsPaid } = useOrdersStore();
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [roomOrders, setRoomOrders] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (roomId) {
      let filteredOrders;
      if (filter === 'unpaid') {
        filteredOrders = getUnpaidOrdersByRoom(roomId);
      } else if (filter === 'paid') {
        filteredOrders = getPaidOrdersByRoom(roomId);
      } else {
        filteredOrders = getOrdersByRoom(roomId);
      }
      setRoomOrders(filteredOrders);
    }
  }, [roomId, filter, getUnpaidOrdersByRoom, getPaidOrdersByRoom, getOrdersByRoom]);

  const totalAmount = roomOrders.filter(order => order.paymentStatus === 'unpaid').reduce((sum, order) => sum + order.total, 0);
  const unpaidCount = roomOrders.filter(order => order.paymentStatus === 'unpaid').length;

  const handlePayment = async () => {
    const unpaidOrders = roomOrders.filter(order => order.paymentStatus === 'unpaid');
    if (unpaidOrders.length === 0) return;

    setIsProcessing(true);

    // RAZORPAY DISABLED - Direct payment without gateway
    try {
      console.log('Payment bypassed - marking orders as paid');
      
      // Mark all unpaid orders as paid
      const orderIds = unpaidOrders.map(order => order.id);
      markOrdersAsPaid(orderIds);
      
      // Show success and redirect
      alert('Payment successful! Your orders have been confirmed.');
      setFilter('paid');
      setIsProcessing(false);
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      alert('Payment failed. Please try again.');
    }

    /* RAZORPAY INTEGRATION - DISABLED
    try {
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      
      if (!razorpayKey) {
        alert('Payment configuration error. Please contact support.');
        setIsProcessing(false);
        return;
      }

      const options = {
        key: razorpayKey,
        amount: totalAmount * 100,
        currency: 'INR',
        name: 'Grand Valley Resort',
        description: `Room ${roomId} - Payment for ${roomOrders.length} orders`,
        handler: function (response: any) {
          console.log('Payment successful:', response);
          const orderIds = roomOrders.map(order => order.id);
          markOrdersAsPaid(orderIds);
          router.push(`/payment-history?roomId=${roomId}`);
        },
        theme: { color: '#93C572' },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      alert('Payment initialization failed. Please try again.');
    }
    */
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'preparing': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'ready': return 'bg-green-100 text-green-800 border-green-300';
      case 'delivered': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'preparing': return '👨‍🍳';
      case 'ready': return '🔔';
      case 'delivered': return '✓';
      case 'cancelled': return '❌';
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
              <h1 className="text-2xl sm:text-3xl font-bold text-pista-900">My Orders</h1>
              <p className="text-pista-600 text-xs sm:text-sm">Room {roomId}</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/menu?roomId=${roomId}`}
                className="bg-white hover:bg-gray-50 text-pista-700 px-3 sm:px-5 py-2 rounded-lg transition border border-pista-200 font-medium text-xs sm:text-sm shadow-sm whitespace-nowrap"
              >
                <span className="hidden sm:inline">← Menu</span>
                <span className="sm:hidden">←</span>
              </Link>
            </div>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                filter === 'all'
                  ? 'bg-pista-500 text-white shadow-md'
                  : 'bg-white text-pista-700 border border-pista-200 hover:bg-pista-50'
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setFilter('unpaid')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                filter === 'unpaid'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white text-orange-700 border border-orange-200 hover:bg-orange-50'
              }`}
            >
              Unpaid
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                filter === 'paid'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-white text-green-700 border border-green-200 hover:bg-green-50'
              }`}
            >
              Paid
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {roomOrders.length === 0 ? (
          <div className="glass-effect border-2 border-pista-200 rounded-2xl p-8 sm:p-16 text-center">
            <span className="text-6xl sm:text-8xl block mb-4 sm:mb-6">📦</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-pista-900 mb-3 sm:mb-4">No orders yet</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Start ordering from our menu</p>
            <Link
              href={`/menu?roomId=${roomId}`}
              className="inline-block bg-pista-500 hover:bg-pista-600 text-white font-bold py-3 px-6 sm:px-8 rounded-lg transition transform hover:scale-105 shadow-lg text-sm sm:text-base"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <>
            {/* Total Amount Summary */}
            <div className="glass-effect border-2 border-pista-300 rounded-2xl p-4 sm:p-6 mb-6 bg-gradient-to-r from-pista-50 to-green-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                  <p className="text-3xl sm:text-4xl font-bold text-pista-900">{roomOrders.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="text-3xl sm:text-4xl font-bold text-pista-700">
                    ₹{roomOrders.reduce((sum, order) => sum + order.total, 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4 mb-6">
            {roomOrders.map((order) => (
              <div
                key={order.id}
                className="glass-effect border-2 border-pista-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition"
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-pista-200">
                  <div>
                    <h3 className="font-bold text-pista-900 text-lg sm:text-xl">{order.id}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      {new Date(order.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {order.paymentStatus === 'paid' ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-800 border-green-300">
                        ✓ PAID
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-orange-100 text-orange-800 border-orange-300">
                        🔔 UNPAID
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                      {getStatusEmoji(order.status)} {order.status.toUpperCase()}
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-pista-900">₹{order.total}</span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 bg-pista-100">
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
                        <p className="font-semibold text-pista-900 text-sm sm:text-base">{item.name}</p>
                        <p className="text-gray-600 text-xs sm:text-sm">Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                      <p className="font-bold text-pista-900 text-sm sm:text-base">₹{item.quantity * item.price}</p>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-4 pt-4 border-t border-pista-200 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold">₹{order.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax:</span>
                    <span className="font-semibold">₹{order.tax}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery Fee:</span>
                    <span className="font-semibold">₹{order.deliveryFee}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

            {/* Payment Button - Only show if there are unpaid orders */}
            {unpaidCount > 0 && (
              <div className="glass-effect border-2 border-pista-300 rounded-2xl p-4 sm:p-6 sticky bottom-4 bg-white shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount to Pay</p>
                    <p className="text-3xl font-bold text-pista-900">₹{totalAmount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{unpaidCount} Unpaid Orders</p>
                  </div>
                </div>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing || unpaidCount === 0}
                  className="w-full bg-pista-500 hover:bg-pista-600 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-base disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>✓</span> Complete Payment
                    </span>
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center mt-3">
                  Payment gateway temporarily disabled
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
