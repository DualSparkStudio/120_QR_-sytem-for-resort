'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import QRScanner from '@/components/QRScanner';

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoDetected, setAutoDetected] = useState(false);

  useEffect(() => {
    // Auto-detect room from QR code URL parameter
    const roomParam = searchParams.get('room');
    if (roomParam) {
      setRoomId(roomParam);
      setAutoDetected(true);
      // Auto-redirect to menu after 1 second
      setTimeout(() => {
        router.push(`/menu?roomId=${encodeURIComponent(roomParam)}`);
      }, 1000);
    }
  }, [searchParams, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!roomId.trim()) {
      setError('Please enter a valid room number');
      return;
    }
    
    if (!/^\d+$/.test(roomId)) {
      setError('Room number should contain only digits');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      window.location.href = `/menu?roomId=${encodeURIComponent(roomId)}`;
    }, 500);
  };

  const handleQuickAccess = (feature: string) => {
    if (!roomId.trim()) {
      setError('Please enter a room number first');
      return;
    }
    if (!/^\d+$/.test(roomId)) {
      setError('Room number should contain only digits');
      return;
    }
    window.location.href = `/${feature}?roomId=${encodeURIComponent(roomId)}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pista-300/40 to-emerald-300/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-teal-300/40 to-cyan-300/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pista-200/20 to-emerald-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-lg animate-fade-in">
        {/* Logo/Header Section */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pista-500 to-emerald-600 rounded-3xl mb-6 shadow-2xl shadow-pista-500/50 transform hover:scale-110 hover:rotate-6 transition-all duration-500 animate-bounce-slow">
            <span className="text-4xl animate-pulse">🏨</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pista-800 via-emerald-700 to-teal-700 mb-3 tracking-tight animate-gradient">
            GRAND VALLEY
          </h1>
          <div className="inline-block px-6 py-2 bg-gradient-to-r from-pista-500/20 to-emerald-500/20 rounded-full border border-pista-300/50 backdrop-blur-sm mb-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-lg font-semibold text-pista-800">Resort Services</p>
          </div>
          
          <p className="text-gray-600 max-w-md mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Experience seamless dining, housekeeping, and concierge services at your fingertips
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-2xl shadow-pista-500/10 mb-6 animate-scale-in hover:shadow-3xl transition-shadow duration-500" style={{ animationDelay: '0.6s' }}>
          {autoDetected && (
            <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 text-center animate-bounce-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-3 shadow-lg animate-spin-slow">
                <span className="text-3xl">✓</span>
              </div>
              <p className="text-green-800 font-bold text-lg animate-pulse">Room {roomId} Detected!</p>
              <p className="text-green-600 text-sm mt-1">Redirecting to menu...</p>
            </div>
          )}

          {!autoDetected && (
            <>
              {/* QR Scanner */}
              <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pista-300 to-transparent animate-expand"></div>
                  <p className="text-xs text-pista-700 font-bold uppercase tracking-widest">Quick Access</p>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pista-300 to-transparent animate-expand"></div>
                </div>
                <QRScanner />
              </div>

              <div className="relative py-6 animate-fade-in" style={{ animationDelay: '1s' }}>
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white text-xs text-gray-500 font-medium uppercase tracking-wider">Or Enter Manually</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
                {/* Room Number Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">
                    Room Number
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-pista-400 to-emerald-400 rounded-2xl blur opacity-25 group-hover:opacity-40 group-focus-within:opacity-50 transition-opacity duration-300 animate-pulse-slow"></div>
                    <input
                      type="text"
                      value={roomId}
                      onChange={(e) => {
                        setRoomId(e.target.value);
                        setError('');
                      }}
                      placeholder="Enter your room number"
                      className="relative w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-pista-500/20 focus:border-pista-500 outline-none transition-all duration-300 text-lg font-medium transform focus:scale-[1.02]"
                    />
                  </div>
                  {error && (
                    <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 animate-shake">
                      <span className="text-lg animate-bounce">⚠️</span>
                      <p className="text-sm font-medium">{error}</p>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!roomId.trim() || loading}
                  className="w-full bg-gradient-to-r from-pista-500 to-emerald-600 hover:from-pista-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] shadow-xl shadow-pista-500/30 disabled:cursor-not-allowed disabled:shadow-none uppercase tracking-wider text-base relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="animate-spin text-xl">⏳</span> 
                      <span>Loading...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      <span>Continue</span>
                      <span className="text-xl transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </span>
                  )}
                </button>
              </form>

              {/* Features */}
              <div className="mt-8 pt-8 border-t border-gray-200 animate-fade-in-up" style={{ animationDelay: '1.4s' }}>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => handleQuickAccess('menu')}
                    className="flex flex-col items-center p-4 rounded-2xl hover:bg-gradient-to-br hover:from-pista-50 hover:to-emerald-50 transition-all duration-300 group border-2 border-transparent hover:border-pista-200 transform hover:scale-105 hover:-translate-y-1"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <span className="text-2xl">🍽️</span>
                    </div>
                    <p className="text-xs text-gray-700 font-bold">Dining</p>
                  </button>
                  <button
                    onClick={() => handleQuickAccess('services')}
                    className="flex flex-col items-center p-4 rounded-2xl hover:bg-gradient-to-br hover:from-pista-50 hover:to-emerald-50 transition-all duration-300 group border-2 border-transparent hover:border-pista-200 transform hover:scale-105 hover:-translate-y-1"
                    style={{ animationDelay: '0.1s' }}
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <span className="text-2xl">🧹</span>
                    </div>
                    <p className="text-xs text-gray-700 font-bold">Services</p>
                  </button>
                  <button
                    className="flex flex-col items-center p-4 rounded-2xl hover:bg-gradient-to-br hover:from-pista-50 hover:to-emerald-50 transition-all duration-300 group border-2 border-transparent hover:border-pista-200 transform hover:scale-105 hover:-translate-y-1"
                    style={{ animationDelay: '0.2s' }}
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <span className="text-2xl">🔔</span>
                    </div>
                    <p className="text-xs text-gray-700 font-bold">Alerts</p>
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 text-center animate-fade-in-up" style={{ animationDelay: '1.6s' }}>
                <Link 
                  href="/admin" 
                  className="inline-flex items-center gap-2 text-pista-600 hover:text-pista-700 transition-all duration-300 font-semibold text-sm group transform hover:scale-105"
                >
                  <span className="w-8 h-8 bg-pista-100 rounded-full flex items-center justify-center group-hover:bg-pista-200 transition-all duration-300 group-hover:rotate-12">
                    <span className="text-sm">👨‍💼</span>
                  </span>
                  <span>Staff Login</span>
                  <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '1.8s' }}>
          <p className="text-gray-500 text-xs font-medium">
            © 2024 Grand Valley Resort • All Rights Reserved
          </p>
        </div>
      </div>
    </main>
  );
}
