'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useOrdersStore } from '@/store/ordersStore';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CartPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get('roomId');
  const { cart, updateQuantity, removeFromCart, clearCart } = useCartStore();
  const { addOrder } = useOrdersStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);
  const tax = Math.round(subtotal * 0.18);
  const deliveryFee = subtotal > 0 ? 50 : 0;
  const total = subtotal + tax + deliveryFee;

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (cart.length === 0) return;

    setIsProcessing(true);

    // Razorpay test configuration
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag', // Test key - replace with your test key
      amount: total * 100, // Amount in paise
      currency: 'INR',
      name: 'Grand Valley Resort',
      description: `Room ${roomId} - Food Order`,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=200&fit=crop',
      handler: function (response: any) {
        // Payment successful
        console.log('Payment successful:', response);
        
        // Add order to store
        addOrder({
          roomId: roomId || 'Unknown',
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.basePrice,
            quantity: item.quantity,
            image: item.image,
          })),
          subtotal,
          tax,
          deliveryFee,
          total,
        });
        
        setOrderPlaced(true);
        clearCart();
        
        setTimeout(() => {
          router.push(`/menu?roomId=${roomId}`);
        }, 3000);
      },
      prefill: {
        name: 'Guest',
        email: 'guest@resort.com',
        contact: '9999999999',
      },
      notes: {
        room_id: roomId,
        order_type: 'food',
      },
      theme: {
        color: '#93C572',
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
        },
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      alert('Payment initialization failed. Please try again.');
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen pista-gradient flex items-center justify-center p-4">
        <div className="glass-effect border-2 border-pista-300 rounded-2xl p-12 text-center max-w-md shadow-2xl">
          <div className="text-7xl mb-6 animate-bounce">✓</div>
          <h1 className="text-3xl font-bold text-pista-900 mb-4">Order Placed!</h1>
          <p className="text-gray-700 text-lg mb-2">Your payment was successful</p>
          <p className="text-gray-600 text-sm mb-6">Your order will be delivered to Room {roomId} shortly</p>
          <div className="animate-pulse text-pista-600 text-sm">Redirecting to menu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pista-gradient">
      {/* Header */}
      <header className="glass-effect border-b border-pista-200 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-pista-900">Your Cart</h1>
            <p className="text-pista-600 text-sm">Room {roomId}</p>
          </div>
          <Link
            href={`/menu?roomId=${roomId}`}
            className="bg-white hover:bg-gray-50 text-pista-700 px-5 py-2 rounded-lg transition border border-pista-200 font-medium text-sm shadow-sm"
          >
            ← Back to Menu
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {cart.length === 0 ? (
          <div className="glass-effect border-2 border-pista-200 rounded-2xl p-16 text-center">
            <span className="text-8xl block mb-6">🛒</span>
            <h2 className="text-3xl font-bold text-pista-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some delicious items from our menu</p>
            <Link
              href={`/menu?roomId=${roomId}`}
              className="inline-block bg-pista-500 hover:bg-pista-600 text-white font-bold py-3 px-8 rounded-lg transition transform hover:scale-105 shadow-lg"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-bold text-pista-900 mb-6">Order Items ({cart.length})</h2>
              
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="glass-effect border-2 border-pista-200 rounded-xl p-6 hover:shadow-lg transition"
                >
                  <div className="flex gap-6">
                    {/* Item Image */}
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-pista-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/300x300/93C572/FFFFFF?text=' + encodeURIComponent(item.name);
                        }}
                      />
                      {item.isVegetarian && (
                        <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          🥬
                        </span>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-pista-900 text-xl">{item.name}</h3>
                          <p className="text-pista-600 text-sm">{item.description}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-600 transition text-xl"
                        >
                          ✕
                        </button>
                      </div>

                      <p className="text-gray-600 text-sm mb-4">{item.details}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="bg-pista-100 hover:bg-pista-200 w-8 h-8 rounded-lg text-pista-700 transition font-bold border border-pista-300"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-bold text-pista-900 text-lg">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="bg-pista-100 hover:bg-pista-200 w-8 h-8 rounded-lg text-pista-700 transition font-bold border border-pista-300"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-pista-900">₹{item.basePrice * item.quantity}</p>
                          <p className="text-xs text-gray-500">₹{item.basePrice} each</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="glass-effect border-2 border-pista-300 rounded-2xl p-6 sticky top-24 shadow-xl">
                <h2 className="text-2xl font-bold text-pista-900 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-semibold">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (18%)</span>
                    <span className="font-semibold">₹{tax}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery Fee</span>
                    <span className="font-semibold">₹{deliveryFee}</span>
                  </div>
                  <div className="border-t-2 border-pista-300 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-pista-900">Total</span>
                      <span className="text-3xl font-bold text-pista-700">₹{total}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-pista-50 border border-pista-200 rounded-lg p-4 mb-6">
                  <p className="text-xs text-pista-700 font-semibold mb-2">Delivery Details</p>
                  <p className="text-sm text-gray-700">Room: {roomId}</p>
                  <p className="text-sm text-gray-700">Est. Time: 30-45 min</p>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isProcessing || cart.length === 0}
                  className="w-full bg-pista-500 hover:bg-pista-600 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-base disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>💳</span> Proceed to Payment
                    </span>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Secure payment powered by Razorpay
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
