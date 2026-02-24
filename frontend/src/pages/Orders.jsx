import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Eye, Clock, CheckCircle, Package } from 'lucide-react';
import api from '../api/api';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem('user');
        if (saved && saved !== 'undefined') {
            const parsedUser = JSON.parse(saved);
            setUser(parsedUser);
            fetchOrders(parsedUser.userId);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchOrders = async (userId) => {
        try {
            const res = await api.get(`/orders/user/${userId}`);
            setOrders(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            try {
                await api.patch(`/orders/${orderId}/status?status=CANCELLED`);
                alert('Order cancelled successfully. Stock has been restored.');
                fetchOrders(user.userId);
            } catch (err) {
                alert('Failed to cancel order: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    if (loading) return <div className="h-96 flex items-center justify-center font-bold text-primary-600">Loading your orders...</div>;

    if (!user) return (
        <div className="h-96 flex flex-col items-center justify-center space-y-4">
            <h2 className="text-2xl font-bold">Please login to see your orders</h2>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-4xl font-bold flex items-center space-x-4">
                    <div className="bg-primary-100 p-2 rounded-2xl text-primary-600">
                        <ShoppingBag size={28} />
                    </div>
                    <span>My Orders</span>
                </h1>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white p-20 rounded-[40px] text-center space-y-4 border border-gray-100 shadow-sm">
                    <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-gray-300">
                        <Package size={48} />
                    </div>
                    <h2 className="text-2xl font-bold">No orders yet</h2>
                    <p className="text-gray-400">Time to go shopping for some fresh veggies!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={order.id}
                            className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all gap-6"
                        >
                            <div className="space-y-1">
                                <div className="flex items-center space-x-3">
                                    <span className="text-xl font-extrabold text-gray-900">#ORD-{order.id}</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>

                            <div className="flex items-center space-x-12">
                                <div className="text-right">
                                    <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Total Amount</p>
                                    <p className="text-2xl font-extrabold text-primary-600">${order.totalAmount.toFixed(2)}</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={() => { setSelectedOrder(order); setShowModal(true); }}
                                        className="flex items-center justify-center space-x-2 bg-gray-50 text-gray-600 px-6 py-3 rounded-2xl font-bold hover:bg-primary-50 hover:text-primary-600 transition-all border border-transparent hover:border-primary-100"
                                    >
                                        <Eye size={20} />
                                        <span>View Details</span>
                                    </button>
                                    {order.status === 'PENDING' && (
                                        <button
                                            onClick={() => handleCancelOrder(order.id)}
                                            className="flex items-center justify-center space-x-2 bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-bold hover:bg-red-100 transition-all border border-transparent hover:border-red-200"
                                        >
                                            <span>Cancel Order</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Order Details Modal */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[32px] p-8 w-full max-w-2xl shadow-2xl space-y-6"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">Order Details (#ORD-{selectedOrder.id})</h2>
                                <p className="text-gray-500 text-sm">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
                        </div>

                        <div className="overflow-hidden border border-gray-100 rounded-2xl">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Product</th>
                                        <th className="px-6 py-4 font-bold">Price</th>
                                        <th className="px-6 py-4 font-bold">Qty</th>
                                        <th className="px-6 py-4 font-bold text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {selectedOrder.items && selectedOrder.items.map((item) => (
                                        <tr key={item.id} className="text-sm">
                                            <td className="px-6 py-4 font-bold text-gray-900">{item.productName}</td>
                                            <td className="px-6 py-4">${item.price.toFixed(2)}</td>
                                            <td className="px-6 py-4 font-medium">{item.quantity}</td>
                                            <td className="px-6 py-4 text-right font-bold text-primary-600">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50/50">
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 font-bold text-right text-gray-900 border-t border-gray-100">Grand Total:</td>
                                        <td className="px-6 py-4 text-right font-extrabold text-primary-600 text-xl border-t border-gray-100">
                                            ${selectedOrder.totalAmount.toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-2xl space-y-2">
                            <h3 className="font-bold text-sm text-gray-400 uppercase tracking-widest flex items-center space-x-2">
                                <Package size={16} />
                                <span>Shipping Address</span>
                            </h3>
                            <p className="font-bold text-gray-900">{selectedOrder.shippingAddress || 'Not specified'}</p>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-10 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 shadow-lg shadow-primary-100 active:scale-95 transition-all"
                            >
                                Close Details
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Orders;
