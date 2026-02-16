'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import NotificationCenter from '@/components/NotificationCenter';
import { useNotificationStore } from '@/store/notificationStore';
import { useCartStore } from '@/store/cartStore';
import { useMenuStore } from '@/store/menuStore';

export const dynamic = 'force-dynamic';

export default function MenuPage() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId');
  const { addNotification } = useNotificationStore();
  const { cart, addToCart: addToCartStore } = useCartStore();
  const { items: menuItems, initializeDefaultItems } = useMenuStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    initializeDefaultItems();
    setLoading(false);
  }, [initializeDefaultItems]);

  const addToCart = (item: typeof menuItems[0]) => {
    addToCartStore({
      id: item.id,
      name: item.name,
      description: item.description,
      details: item.description,
      basePrice: item.price,
      isVegetarian: item.isVegetarian,
      preparationTime: 20,
      image: item.image,
      category: item.category.toLowerCase(),
      rating: item.rating,
      ingredients: item.ingredients,
    });
    addNotification({
      type: 'order',
      title: 'Item Added',
      message: `${item.name} added to your cart`,
    });
  };

  // Get unique categories from menu items
  const categories = Array.from(new Set(menuItems.map(item => item.category.toLowerCase())));
  
  const filteredItems = activeTab === 'all' 
    ? menuItems.filter(item => item.available) 
    : menuItems.filter((item) => item.category.toLowerCase() === activeTab && item.available);

  if (loading) {
    return (
      <div className="min-h-screen pista-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4 text-5xl">🍽️</div>
          <p className="text-pista-800 text-lg">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pista-gradient">
      {/* Header */}
      <header className="glass-effect border-b border-pista-200 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-2">
            <div className="flex-shrink-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-pista-900 tracking-tight">Menu</h1>
              <p className="text-pista-600 text-xs uppercase tracking-wider">Room {roomId}</p>
            </div>
            <div className="flex gap-2 sm:gap-3 flex-wrap justify-end">
              <NotificationCenter />
              <Link
                href={`/cart?roomId=${roomId}`}
                className="relative bg-pista-500 hover:bg-pista-600 text-white px-3 sm:px-5 py-2 rounded-lg font-bold transition text-xs sm:text-sm shadow-md whitespace-nowrap"
              >
                <span className="hidden sm:inline">🛒 Cart</span>
                <span className="sm:hidden">🛒</span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                    {cart.length}
                  </span>
                )}
              </Link>
              <Link href={`/services?roomId=${roomId}`} className="hidden sm:flex bg-white hover:bg-gray-50 text-pista-700 px-5 py-2 rounded-lg transition border border-pista-200 font-medium text-sm shadow-sm whitespace-nowrap">
                🧹 Services
              </Link>
              <Link href="/" className="bg-white hover:bg-gray-50 text-pista-700 px-3 sm:px-5 py-2 rounded-lg transition border border-pista-200 font-medium text-xs sm:text-sm shadow-sm whitespace-nowrap">
                <span className="hidden sm:inline">← Back</span>
                <span className="sm:hidden">←</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="w-full">
          {/* Main Content */}
          <div>
            {/* Category Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 sm:px-5 py-2 rounded-lg font-semibold whitespace-nowrap transition text-xs sm:text-sm ${
                  activeTab === 'all'
                    ? 'bg-pista-500 text-white shadow-md'
                    : 'bg-white text-pista-700 hover:bg-pista-50 border border-pista-200'
                }`}
              >
                🍽️ All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={`px-4 sm:px-5 py-2 rounded-lg font-semibold whitespace-nowrap transition text-xs sm:text-sm ${
                    activeTab === category
                      ? 'bg-pista-500 text-white shadow-md'
                      : 'bg-white text-pista-700 hover:bg-pista-50 border border-pista-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group glass-effect border-2 border-pista-200 rounded-2xl overflow-hidden hover:border-pista-400 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden bg-gradient-to-br from-pista-100 to-pista-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/600x400/93C572/FFFFFF?text=' + encodeURIComponent(item.name);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    
                    {/* Vegetarian Badge */}
                    {item.isVegetarian && (
                      <span className="absolute top-4 right-4 bg-green-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg">
                        🥬 Veg
                      </span>
                    )}

                    {/* Rating Badge */}
                    {item.rating && (
                      <div className="absolute top-4 left-4 flex items-center gap-1 bg-white/95 px-3 py-1.5 rounded-full shadow-lg">
                        <span className="text-yellow-500 text-sm">⭐</span>
                        <span className="text-gray-900 text-sm font-bold">{item.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-pista-900 text-xl mb-1 group-hover:text-pista-700 transition">{item.name}</h3>
                        <p className="text-pista-600 text-xs font-medium">{item.category}</p>
                      </div>
                    </div>

                    {/* Ingredients */}
                    {item.ingredients && (
                      <div className="mb-4">
                        <p className="text-xs text-pista-700 font-semibold mb-2">Ingredients:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {item.ingredients.slice(0, 4).map((ing, idx) => (
                            <span key={idx} className="text-xs bg-pista-100 text-pista-700 px-2 py-1 rounded-full border border-pista-200">
                              {ing}
                            </span>
                          ))}
                          {item.ingredients.length > 4 && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full border border-gray-200">
                              +{item.ingredients.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-pista-200">
                      <div>
                        <p className="text-2xl font-bold text-pista-900">₹{item.price}</p>
                        <p className="text-xs text-pista-600 flex items-center gap-1 mt-1">
                          <span>⏱️</span>
                          <span>20 min</span>
                        </p>
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-pista-500 hover:bg-pista-600 text-white px-6 py-2.5 rounded-lg font-bold transition transform hover:scale-105 active:scale-95 text-sm shadow-md"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
