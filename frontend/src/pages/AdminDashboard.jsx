import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, ShoppingCart, Users, Plus, Edit, Trash2, CheckCircle, Clock, Eye } from 'lucide-react';
import api from '../api/api';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUserModal, setShowUserModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [userFormData, setUserFormData] = useState({ name: '', email: '', password: '', phone: '', address: '', role: 'ROLE_USER' });
    const [showProductModal, setShowProductModal] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [productFormData, setProductFormData] = useState({
        name: '', description: '', category: 'Leafy Greens', price: 0, unit: 'kg', stock: 0, imageUrl: '', active: true
    });
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'products') {
                const res = await api.get('/products');
                setProducts(res.data);
            } else if (activeTab === 'orders') {
                const res = await api.get('/orders/admin/all');
                setOrders(res.data);
            } else if (activeTab === 'users') {
                const res = await api.get('/users/admin/all');
                setUsers(res.data);
            }
        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, status) => {
        try {
            await api.patch(`/orders/${orderId}/status?status=${status}`);
            fetchData();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        try {
            if (currentUser) {
                await api.put(`/users/admin/${currentUser.id}`, userFormData);
            } else {
                await api.post('/users/admin', userFormData);
            }
            setShowUserModal(false);
            fetchData();
        } catch (err) {
            alert('Failed to save customer: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/users/admin/${userId}`);
                fetchData();
            } catch (err) {
                alert('Failed to delete user');
            }
        }
    };

    const openUserModal = (user = null) => {
        if (user) {
            setCurrentUser(user);
            setUserFormData({ ...user, password: '' }); // Don't show hashed password
        } else {
            setCurrentUser(null);
            setUserFormData({ name: '', email: '', password: '', phone: '', address: '', role: 'ROLE_USER' });
        }
        setShowUserModal(true);
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        try {
            if (currentProduct) {
                await api.put(`/products/${currentProduct.id}`, productFormData);
            } else {
                await api.post('/products', productFormData);
            }
            setShowProductModal(false);
            fetchData();
        } catch (err) {
            let errorMsg = err.response?.data?.message || err.message;
            if (productFormData.imageUrl && productFormData.imageUrl.length > 500) {
                errorMsg += " (The Image URL might be too long. Try using a direct link to an image instead of a search result link.)";
            }
            alert('Failed to save vegetable: ' + errorMsg);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this vegetable?')) {
            try {
                await api.delete(`/products/${productId}`);
                fetchData();
            } catch (err) {
                alert('Failed to delete product');
            }
        }
    };

    const openProductModal = (product = null) => {
        if (product) {
            setCurrentProduct(product);
            setProductFormData(product);
        } else {
            setCurrentProduct(null);
            setProductFormData({ name: '', description: '', category: 'Leafy Greens', price: 0, unit: 'kg', stock: 0, imageUrl: '', active: true });
        }
        setShowProductModal(true);
    };

    const menuItems = [
        { id: 'products', label: 'Vegetables', icon: Package },
        { id: 'orders', label: 'Orders', icon: ShoppingCart },
        { id: 'users', label: 'Customers', icon: Users },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-100 p-8 space-y-10">
                <div className="flex items-center space-x-2 text-primary-600">
                    <LayoutDashboard size={28} />
                    <span className="text-xl font-bold text-gray-900">Admin Portal</span>
                </div>

                <nav className="space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all font-medium ${activeTab === item.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-gray-500 hover:bg-primary-50 hover:text-primary-600'}`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Content */}
            <main className="flex-1 p-12 space-y-10">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold capitalize">{activeTab} Management</h1>
                        <p className="text-gray-500">Overview and control of your store's {activeTab}</p>
                    </div>
                    {activeTab === 'products' ? (
                        <button onClick={() => openProductModal()} className="btn-primary flex items-center space-x-2">
                            <Plus size={20} />
                            <span>Add Vegetable</span>
                        </button>
                    ) : activeTab === 'users' ? (
                        <button onClick={() => openUserModal()} className="btn-primary flex items-center space-x-2">
                            <Plus size={20} />
                            <span>Add Customer</span>
                        </button>
                    ) : null}
                </header>

                {loading ? (
                    <div className="h-96 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden"
                    >
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-400 text-xs uppercase tracking-widest border-b border-gray-50">
                                    {activeTab === 'products' && (
                                        <>
                                            <th className="px-8 py-6">Vegetable</th>
                                            <th className="px-8 py-6">Category</th>
                                            <th className="px-8 py-6">Price</th>
                                            <th className="px-8 py-6">Stock</th>
                                            <th className="px-8 py-6 text-right">Actions</th>
                                        </>
                                    )}
                                    {activeTab === 'orders' && (
                                        <>
                                            <th className="px-8 py-6">Order ID</th>
                                            <th className="px-8 py-6">Customer</th>
                                            <th className="px-8 py-6">Amount</th>
                                            <th className="px-8 py-6">Status</th>
                                            <th className="px-8 py-6 text-right">Actions</th>
                                        </>
                                    )}
                                    {activeTab === 'users' && (
                                        <>
                                            <th className="px-8 py-6">Name</th>
                                            <th className="px-8 py-6">Email</th>
                                            <th className="px-8 py-6">Phone</th>
                                            <th className="px-8 py-6">Role</th>
                                            <th className="px-8 py-6 text-right">Actions</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-gray-600">
                                {activeTab === 'products' && products.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5 font-bold text-gray-900">{p.name}</td>
                                        <td className="px-8 py-5"><span className="bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-xs font-bold">{p.category}</span></td>
                                        <td className="px-8 py-5">${p.price.toFixed(2)}</td>
                                        <td className="px-8 py-5">{p.stock} {p.unit}</td>
                                        <td className="px-8 py-5 text-right space-x-2">
                                            <button onClick={() => openProductModal(p)} className="p-2 text-gray-400 hover:text-primary-600 transition-colors"><Edit size={18} /></button>
                                            <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === 'orders' && orders.map(o => (
                                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5 font-bold text-gray-900">#ORD-{o.id}</td>
                                        <td className="px-8 py-5">User {o.userId}</td>
                                        <td className="px-8 py-5 font-bold text-primary-600">${o.totalAmount.toFixed(2)}</td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${o.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right space-x-2">
                                            <button onClick={() => { setSelectedOrder(o); setShowOrderModal(true); }} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Eye size={18} title="View Items" /></button>
                                            <button onClick={() => handleUpdateStatus(o.id, 'SHIPPED')} className="p-2 text-gray-400 hover:text-primary-600 transition-colors"><Clock size={18} title="Mark Shipped" /></button>
                                            <button onClick={() => handleUpdateStatus(o.id, 'DELIVERED')} className="p-2 text-gray-400 hover:text-green-600 transition-colors"><CheckCircle size={18} title="Mark Delivered" /></button>
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === 'users' && users.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5 font-bold text-gray-900">{u.name}</td>
                                        <td className="px-8 py-5">{u.email}</td>
                                        <td className="px-8 py-5">{u.phone}</td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {u.role.replace('ROLE_', '')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right space-x-2">
                                            <button onClick={() => openUserModal(u)} className="p-2 text-gray-400 hover:text-primary-600 transition-colors"><Edit size={18} /></button>
                                            <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(activeTab === 'products' && products.length === 0) ||
                            (activeTab === 'orders' && orders.length === 0) ? (
                            <div className="py-20 text-center text-gray-400">No {activeTab} found in the database.</div>
                        ) : null}
                    </motion.div>
                )}
            </main>

            {/* User Modal */}
            {showUserModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl space-y-6"
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">{currentUser ? 'Edit Customer' : 'Add New Customer'}</h2>
                            <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <form onSubmit={handleSaveUser} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                        placeholder="John Doe"
                                        value={userFormData.name}
                                        onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                                    <input
                                        type="email" required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                        placeholder="john@example.com"
                                        value={userFormData.email}
                                        onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password {currentUser && '(Empty to keep)'}</label>
                                    <input
                                        type="password" required={!currentUser}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                        placeholder="••••••••"
                                        value={userFormData.password}
                                        onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Phone</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                        placeholder="555-0199"
                                        value={userFormData.phone}
                                        onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Delivery Address</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                    placeholder="123 Street, City"
                                    value={userFormData.address}
                                    onChange={(e) => setUserFormData({ ...userFormData, address: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Account Role</label>
                                <select
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                    value={userFormData.role}
                                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                                >
                                    <option value="ROLE_USER">Customer</option>
                                    <option value="ROLE_ADMIN">Administrator</option>
                                </select>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all">Cancel</button>
                                <button type="submit" className="flex-[2] py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-lg shadow-primary-100 hover:bg-primary-700 active:scale-95 transition-all">Save Changes</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Product Modal */}
            {showProductModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">{currentProduct ? 'Edit Vegetable' : 'Add New Vegetable'}</h2>
                            <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <form onSubmit={handleSaveProduct} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Name</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                    placeholder="e.g. Fresh Spinach"
                                    value={productFormData.name}
                                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Category</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                        value={productFormData.category}
                                        onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                                    >
                                        <option value="Leafy Greens">Leafy Greens</option>
                                        <option value="Root Vegetables">Root Vegetables</option>
                                        <option value="Cruciferous">Cruciferous</option>
                                        <option value="Marrows">Marrows</option>
                                        <option value="Fruity">Fruity</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Price ($)</label>
                                    <input
                                        type="number" step="0.01" required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                        value={productFormData.price}
                                        onChange={(e) => setProductFormData({ ...productFormData, price: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Stock</label>
                                    <input
                                        type="number" required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                        value={productFormData.stock}
                                        onChange={(e) => setProductFormData({ ...productFormData, stock: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Unit</label>
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                        placeholder="e.g. kg, bunch, piece"
                                        value={productFormData.unit}
                                        onChange={(e) => setProductFormData({ ...productFormData, unit: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Image URL</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                    placeholder="https://..."
                                    value={productFormData.imageUrl}
                                    onChange={(e) => setProductFormData({ ...productFormData, imageUrl: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium min-h-[100px]"
                                    placeholder="Vegetable description..."
                                    value={productFormData.description}
                                    onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                                />
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button type="button" onClick={() => setShowProductModal(false)} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all">Cancel</button>
                                <button type="submit" className="flex-[2] py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-lg shadow-primary-100 hover:bg-primary-700 active:scale-95 transition-all">Save Vegetable</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
            {/* Order Items Modal */}
            {showOrderModal && selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[32px] p-8 w-full max-w-2xl shadow-2xl space-y-6"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">Order Items (#ORD-{selectedOrder.id})</h2>
                                <p className="text-gray-500 text-sm">Customer ID: {selectedOrder.userId}</p>
                            </div>
                            <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <div className="overflow-hidden border border-gray-100 rounded-2xl">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Product</th>
                                        <th className="px-6 py-4">Price</th>
                                        <th className="px-6 py-4">Qty</th>
                                        <th className="px-6 py-4 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                        selectedOrder.items.map((item) => (
                                            <tr key={item.id} className="text-sm">
                                                <td className="px-6 py-4 font-bold text-gray-900">{item.productName}</td>
                                                <td className="px-6 py-4">${item.price.toFixed(2)}</td>
                                                <td className="px-6 py-4">{item.quantity}</td>
                                                <td className="px-6 py-4 text-right font-bold text-primary-600">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-400 italic">
                                                No items found for this order.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-gray-50/50">
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 font-bold text-right">Total Amount:</td>
                                        <td className="px-6 py-4 text-right font-extrabold text-primary-600 text-lg">
                                            ${selectedOrder.totalAmount.toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowOrderModal(false)}
                                className="px-8 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
