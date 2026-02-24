import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ShoppingBag, ArrowRight, User, Package } from 'lucide-react';
import api from '../api/api';

const PRODUCT_PLACEHOLDERS = [
    { id: 1, name: 'Fresh Spinach', price: 2.99, unit: 'bunch', category: 'Leafy Greens', imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=400&auto=format&fit=crop' },
    { id: 2, name: 'Organic Carrots', price: 1.50, unit: 'kg', category: 'Root Vegetables', imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=400&auto=format&fit=crop' },
    { id: 3, name: 'Tomatoes', price: 3.20, unit: 'kg', category: 'Fruits', imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f02bad174?q=80&w=400&auto=format&fit=crop' },
    { id: 4, name: 'Broccoli', price: 2.45, unit: 'piece', category: 'Cruciferous', imageUrl: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?q=80&w=400&auto=format&fit=crop' },
];

const Home = ({ refreshCart }) => {
    const [products, setProducts] = useState(PRODUCT_PLACEHOLDERS);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [quantities, setQuantities] = useState({});
    const [cartItems, setCartItems] = useState({}); // Tracking { productId: quantity }

    useEffect(() => {
        fetchProducts();
        fetchUserCart();
    }, [selectedCategory]);

    const fetchUserCart = async () => {
        try {
            const savedUser = localStorage.getItem('user');
            if (savedUser && savedUser !== 'undefined') {
                const user = JSON.parse(savedUser);
                const response = await api.get(`/cart/${user.userId}`);
                const mapping = {};
                response.data.items?.forEach(item => {
                    mapping[item.productId] = item.quantity;
                });
                setCartItems(mapping);
            }
        } catch (error) {
            console.error('Error fetching user cart:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const endpoint = selectedCategory === 'All' ? '/products' : `/products/category/${selectedCategory}`;
            const response = await api.get(endpoint);
            setProducts(response.data);

            // Initialize quantities for new products
            const initialQtys = {};
            response.data.forEach(p => {
                initialQtys[p.id] = 1;
            });
            setQuantities(prev => ({ ...initialQtys, ...prev }));

            // Also refresh cart data to stay synced
            fetchUserCart();
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQtyChange = (productId, delta, maxStock) => {
        const alreadyInCart = cartItems[productId] || 0;
        const availableToAdd = maxStock - alreadyInCart;

        setQuantities(prev => {
            const current = prev[productId] || 1;
            const next = current + delta;

            if (next < 1) return prev;

            if (availableToAdd <= 0 && delta > 0) {
                alert(`Limit reached! You already have ${alreadyInCart} in your cart, which is the full stock.`);
                return prev;
            }

            if (next > availableToAdd) {
                alert(`Only ${availableToAdd} more available (you have ${alreadyInCart} in cart)`);
                return prev;
            }

            return { ...prev, [productId]: next };
        });
    };

    const addToCart = async (product) => {
        const qty = quantities[product.id] || 1;
        const alreadyInCart = cartItems[product.id] || 0;

        let user = null;
        try {
            const savedUser = localStorage.getItem('user');
            if (savedUser && savedUser !== 'undefined') {
                user = JSON.parse(savedUser);
            }
        } catch (e) {
            console.error("Auth error", e);
        }

        if (!user) {
            alert('Please login to add items to cart');
            return;
        }

        if (product.stock <= 0) {
            alert('Sorry, this item is out of stock!');
            return;
        }

        if (qty > (product.stock - alreadyInCart)) {
            alert(`Cannot add ${qty} more. You already have ${alreadyInCart} in cart, and only ${product.stock} total are available.`);
            return;
        }

        try {
            await api.post(`/cart/${user.userId}/add`, {
                productId: product.id,
                productName: product.name,
                price: product.price,
                quantity: qty
            });

            alert(`${qty} ${product.unit} added to cart!`);

            // Reset quantity to 1 after adding
            setQuantities(prev => ({ ...prev, [product.id]: 1 }));

            if (refreshCart) refreshCart();
            fetchProducts(); // This will also trigger fetchUserCart()
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            alert('Failed to add to cart: ' + errorMsg);
        }
    };

    return (
        <div className="space-y-12 pb-20">
            {/* Hero Section */}
            <section className="relative h-[600px] overflow-hidden bg-primary-950 flex items-center">
                <div className="absolute inset-0 opacity-40">
                    <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2000&auto=format&fit=crop" alt="Hero" className="w-full h-full object-cover" />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-2xl text-white space-y-6"
                    >
                        <span className="bg-primary-600/20 text-primary-400 px-4 py-1 rounded-full text-sm font-semibold border border-primary-500/30">
                            100% Farm Fresh
                        </span>
                        <h1 className="text-6xl font-bold leading-tight">
                            Fresh Vegetables <br />
                            <span className="text-primary-500">Delivered To You</span>
                        </h1>
                        <p className="text-gray-300 text-xl">
                            Ethically sourced vegetables from local farmers. Quality guaranteed, same-day delivery available.
                        </p>
                        <div className="flex space-x-4 pt-4">
                            <button
                                onClick={() => document.getElementById('shop-items')?.scrollIntoView({ behavior: 'smooth' })}
                                className="btn-primary flex items-center space-x-2 px-8 py-4"
                            >
                                <span>Shop Now</span>
                                <ArrowRight size={20} />
                            </button>
                            <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-medium hover:bg-white/20 transition-all">
                                Learn More
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Main Shop Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold">Popular Categories</h2>
                        <p className="text-gray-500">Check our latest arrivals this week</p>
                    </div>

                    <div className="flex w-full md:w-auto space-x-4">
                        <div className="relative flex-grow md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search vegetables..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="bg-white p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            <Filter size={18} className="text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Categories Pills */}
                <div className="flex space-x-4 mb-10 overflow-x-auto pb-2 scrollbar-hide">
                    {['All', 'Leafy Greens', 'Root Vegetables', 'Cruciferous', 'Marrows', 'Fruity'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-2 rounded-full whitespace-nowrap transition-all font-medium ${selectedCategory === cat ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-400'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div id="shop-items" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product, idx) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-primary-100 transition-all group"
                        >
                            <div className="h-64 overflow-hidden relative">
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-primary-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider z-10">
                                    {product.category}
                                </span>

                                {product.stock <= 0 && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px] z-20">
                                        <span className="bg-red-600 text-white px-6 py-2 rounded-full font-black text-sm tracking-widest uppercase shadow-xl transform -rotate-12 border-2 border-white/20">
                                            Out of Stock
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 space-y-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold group-hover:text-primary-600 transition-colors">{product.name}</h3>
                                    <p className="text-primary-600 font-bold text-lg">${product.price.toFixed(2)}</p>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <p className="text-gray-400">per {product.unit}</p>
                                    <p className={`font-bold ${product.stock <= 5 && product.stock > 0 ? 'text-red-500 animate-pulse' : product.stock === 0 ? 'text-gray-400' : 'text-primary-600/60'}`}>
                                        {product.stock > 0 ? `${product.stock} ${product.unit} left` : 'Out of Stock'}
                                    </p>
                                </div>

                                {product.stock > 0 && (
                                    <div className="pt-2 space-y-3">
                                        <div className="flex justify-between items-center text-xs">
                                            {cartItems[product.id] > 0 ? (
                                                <span className="text-primary-600 font-bold bg-primary-50 px-2 py-0.5 rounded-lg border border-primary-100 flex items-center">
                                                    <ShoppingBag size={12} className="mr-1" />
                                                    {cartItems[product.id]} in cart
                                                </span>
                                            ) : <span />}

                                            {cartItems[product.id] >= product.stock ? (
                                                <span className="text-red-500 font-black uppercase tracking-tighter">Limit Reached</span>
                                            ) : (
                                                <span className="text-gray-400">
                                                    Available: {product.stock - (cartItems[product.id] || 0)} more
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                                                <button
                                                    onClick={() => handleQtyChange(product.id, -1, product.stock)}
                                                    className="p-1.5 hover:bg-white hover:text-primary-600 rounded-lg transition-all text-gray-400"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" size={16} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                                </button>
                                                <span className="w-8 text-center font-bold text-gray-700">{quantities[product.id] || 1}</span>
                                                <button
                                                    onClick={() => handleQtyChange(product.id, 1, product.stock)}
                                                    className={`p-1.5 rounded-lg transition-all ${(cartItems[product.id] || 0) + (quantities[product.id] || 1) >= product.stock
                                                            ? "text-gray-200 cursor-not-allowed"
                                                            : "hover:bg-white hover:text-primary-600 text-gray-400"
                                                        }`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" size={16} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => addToCart(product)}
                                                disabled={(cartItems[product.id] || 0) >= product.stock}
                                                className={`flex-grow font-bold py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm active:scale-95 ${(cartItems[product.id] || 0) >= product.stock
                                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        : "bg-primary-600 text-white hover:bg-primary-700"
                                                    }`}
                                            >
                                                <ShoppingBag size={18} />
                                                <span>{(cartItems[product.id] || 0) >= product.stock ? 'Limited' : 'Add'}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center space-x-1 pt-2">
                                    {[1, 2, 3, 4, 5].map(s => <span key={s} className="text-yellow-400 text-xs">★</span>)}
                                    <span className="text-gray-400 text-xs pl-2">(48 reviews)</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Trust Section */}
            <section className="bg-primary-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex items-start space-x-4">
                            <div className="bg-white p-3 rounded-2xl shadow-sm text-primary-600">
                                <Package size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold">Next Day Delivery</h4>
                                <p className="text-gray-500 text-sm">Order before 5 PM to get it tomorrow</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="bg-white p-3 rounded-2xl shadow-sm text-primary-600">
                                <User size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold">Organic Certified</h4>
                                <p className="text-gray-500 text-sm">All our products are certified organic</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="bg-white p-3 rounded-2xl shadow-sm text-primary-600">
                                <ShoppingBag size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold">Safe Payments</h4>
                                <p className="text-gray-500 text-sm">100% secure checkout processes</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
