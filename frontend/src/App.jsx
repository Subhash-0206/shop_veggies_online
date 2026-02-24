import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package, LayoutDashboard, ChevronRight } from 'lucide-react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import api from './api/api';

function App() {
  const getInitialUser = () => {
    try {
      const saved = localStorage.getItem('user');
      if (!saved || saved === 'undefined') return null;
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      return null;
    }
  };

  const [user, setUser] = useState(getInitialUser());
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  const fetchCartCount = async () => {
    try {
      const saved = localStorage.getItem('user');
      if (saved && saved !== 'undefined') {
        const parsedUser = JSON.parse(saved);
        const res = await api.get(`/cart/${parsedUser.userId}`);
        const count = res.data.items.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(count);
      } else {
        setCartCount(0);
      }
    } catch (err) {
      console.error("Cart fetch error", err);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, [user]);

  console.log('App Component Rendering', { user, cartCount });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCartCount(0);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Package className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
                VeggieShop
              </span>
            </Link>

            <div className="flex items-center space-x-6 text-gray-600 font-medium">
              <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
              <Link to="/cart" className="relative hover:text-primary-600 transition-colors">
                <ShoppingCart size={22} />
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">{cartCount}</span>
              </Link>
              {user && (
                <Link to="/orders" className="hover:text-primary-600 transition-colors">My Orders</Link>
              )}

              {user ? (
                <div className="flex items-center space-x-4">
                  {user.role === 'ROLE_ADMIN' && (
                    <Link to="/admin" className="flex items-center space-x-1 text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full hover:bg-primary-100 transition-all">
                      <LayoutDashboard size={18} />
                      <span>Admin</span>
                    </Link>
                  )}
                  <Link to="/profile" className="flex items-center space-x-1 hover:text-primary-600 transition-colors">
                    <User size={20} />
                    <span>Profile</span>
                  </Link>
                  <button onClick={handleLogout} className="flex items-center space-x-1 hover:text-red-600 transition-colors">
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn-primary flex items-center space-x-1">
                  <User size={18} />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home refreshCart={fetchCartCount} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart refreshCart={fetchCartCount} />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4 col-span-1 md:col-span-1">
              <div className="flex items-center space-x-2">
                <div className="bg-primary-600 p-1.5 rounded-md">
                  <Package className="text-white" size={18} />
                </div>
                <span className="text-xl font-bold">VeggieShop</span>
              </div>
              <p className="text-gray-500 text-sm">
                Freshest vegetables directly from local farms to your kitchen. Eco-friendly and fast delivery.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="text-gray-500 space-y-2 text-sm">
                <li><Link to="/">Browse All</Link></li>
                <li><Link to="/cart">Shopping Cart</Link></li>
                <li><Link to="/login">My Account</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Categories</h4>
              <ul className="text-gray-500 space-y-2 text-sm">
                <li>Leafy Greens</li>
                <li>Root Vegetables</li>
                <li>Cruciferous</li>
                <li>Marrows</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Newsletter</h4>
              <div className="flex">
                <input type="email" placeholder="Email" className="bg-gray-50 border border-gray-200 rounded-l-lg px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-primary-500" />
                <button className="bg-primary-600 text-white px-4 py-2 rounded-r-lg hover:bg-primary-700">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-100 text-center text-gray-400 text-sm">
            © 2024 VeggieShop. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
