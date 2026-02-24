import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, CreditCard, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/api';

const Cart = ({ refreshCart }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkUser = () => {
            try {
                const saved = localStorage.getItem('user');
                if (saved && saved !== 'undefined') {
                    const parsedUser = JSON.parse(saved);
                    setUser(parsedUser);
                    fetchCart(parsedUser.userId);
                } else {
                    setLoading(false);
                }
            } catch (e) {
                console.error('Cart Auth Error:', e);
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    const fetchCart = async (userId) => {
        try {
            const response = await api.get(`/cart/${userId}`);
            setCart(response.data);
        } catch (err) {
            console.error('Error fetching cart:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (productId, delta) => {
        if (!user) return;
        try {
            await api.post(`/cart/${user.userId}/add`, {
                productId: productId,
                productName: '',
                price: 0,
                quantity: delta
            });
            fetchCart(user.userId);
            if (refreshCart) refreshCart();
        } catch (err) {
            console.error('Error updating quantity:', err);
        }
    };

    const removeItem = async (productId) => {
        if (!user) return;
        try {
            const response = await api.delete(`/cart/${user.userId}/remove/${productId}`);
            setCart(response.data);
            if (refreshCart) refreshCart();
        } catch (err) {
            console.error('Error removing item:', err);
        }
    };

    const clearCart = async () => {
        if (!user) return;
        try {
            await api.delete(`/cart/${user.userId}/clear`);
            setCart({ items: [] });
            if (refreshCart) refreshCart();
        } catch (err) {
            console.error('Error clearing cart:', err);
        }
    };

    const subtotal = cart?.items?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;
    const shipping = subtotal >= 50 ? 0 : (subtotal > 0 ? 5.00 : 0);
    const total = subtotal + shipping;

    const handleCheckout = async () => {
        if (!user) return;
        setLoading(true); // Show loading while processing order
        try {
            const orderResponse = await api.post('/orders', {
                userId: user.userId,
                items: cart.items.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    price: item.price,
                    quantity: item.quantity
                })),
                totalAmount: total,
                shippingAddress: user.address || 'Default Address'
            });

            await api.post('/payments/initiate', {
                orderId: orderResponse.data.id,
                userId: user.userId,
                amount: total,
                paymentMethod: 'CREDIT_CARD'
            });

            await clearCart();
            alert('Order placed successfully!');
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            alert('Checkout failed: ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="h-96 flex items-center justify-center font-bold text-primary-600">Loading your cart...</div>;

    if (!user) return (
        <div className="h-96 flex flex-col items-center justify-center space-y-4">
            <h2 className="text-2xl font-bold">Please login to see your cart</h2>
            <Link to="/login" className="btn-primary">Login Now</Link>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-bold mb-10 flex items-center space-x-4">
                <div className="bg-primary-100 p-2 rounded-2xl text-primary-600">
                    <ShoppingBag size={28} />
                </div>
                <span>Shopping Cart</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-6">
                    {!cart || cart.items.length === 0 ? (
                        <div className="bg-white p-12 rounded-[40px] text-center space-y-4 border border-gray-100">
                            <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                <ShoppingBag size={48} />
                            </div>
                            <h2 className="text-xl font-bold">Your cart is empty</h2>
                            <p className="text-gray-400">Looks like you haven't added any fresh veggies yet.</p>
                            <Link to="/" className="btn-primary inline-flex items-center space-x-2">
                                <span>Start Shopping</span>
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    ) : (
                        cart.items.map((item) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={item.id}
                                className="bg-white p-6 rounded-[32px] border border-gray-50 flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="flex items-center space-x-6">
                                    <div className="bg-primary-50 p-4 rounded-2xl text-primary-600 font-bold group-hover:bg-primary-100 transition-colors">
                                        {item.productName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{item.productName}</h3>
                                        <p className="text-gray-400 text-sm">${item.price.toFixed(2)} / unit</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-8">
                                    <div className="flex items-center bg-gray-50 rounded-2xl p-1">
                                        <button
                                            onClick={() => updateQuantity(item.productId, -1)}
                                            disabled={item.quantity <= 1}
                                            className="p-2 hover:bg-white rounded-xl transition-colors disabled:opacity-30"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="w-10 text-center font-bold">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.productId, 1)}
                                            className="p-2 hover:bg-white rounded-xl transition-colors"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <div className="text-right w-20">
                                        <p className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.productId)}
                                        className="text-gray-300 hover:text-red-500 transition-colors p-2"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-primary-200/50 border border-primary-50 space-y-6 sticky top-24">
                        <h2 className="text-2xl font-bold">Order Summary</h2>
                        <div className="space-y-4 text-gray-500">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-bold text-gray-900">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span className="font-bold text-gray-900">${shipping.toFixed(2)}</span>
                            </div>
                            <div className="pt-4 border-t border-gray-100 flex justify-between text-xl text-gray-900">
                                <span className="font-bold">Total</span>
                                <span className="font-extrabold text-primary-600">${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={!cart || cart.items.length === 0}
                            className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary-200 hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:bg-gray-300 disabled:shadow-none"
                        >
                            <span>{subtotal > 0 ? 'Checkout Now' : 'Cart Empty'}</span>
                            <CreditCard size={20} />
                        </button>

                        <div className="flex items-center justify-center space-x-2 text-primary-600 text-sm font-medium pt-2">
                            <div className="h-2 w-2 bg-primary-500 rounded-full animate-pulse" />
                            <span>Free shipping on orders over $50</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
